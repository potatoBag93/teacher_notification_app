/**
 * 사용자 관리 서비스 클래스
 * 
 * 교사 사용자들의 프로필 관리와 관련 기능들을 제공합니다.
 * - 사용자 프로필 생성, 조회, 수정
 * - 사용자 통계 및 활동 내역
 * - 승인 시스템 관리
 * - 관리자 권한 확인
 */

import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import { getSupabaseUrl, getSupabaseAnonKey } from './configService'

// 데이터베이스 타입 정의
type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export class UserService {
  /**
   * 새 사용자의 프로필을 생성합니다 (회원가입 시 호출)
   * 
   * @param userData 사용자 정보
   * @param userData.email 이메일 주소
   * @param userData.fullName 전체 이름
   * @param userData.schoolName 학교명
   * @param userData.phone 전화번호 (선택사항)
   * @param userData.position 직책 (선택사항)
   * @returns 생성된 사용자 프로필
   * @throws 인증되지 않은 사용자일 경우 에러 발생
   */
  static async createProfile(userData: {
    id: string,
    email: string
    fullName: string
    schoolName: string
    phone?: string
    position?: string
  }) {
    console.log('[UserService] createProfile: 시작', userData)

    try {
      // 이메일 기준으로 기존 프로필 조회
      console.log('[UserService] createProfile: 기존 프로필 조회 시도')
      const { data: existing, error: findError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', userData.email)
        .single()
      
      console.log('[UserService] createProfile: 기존 프로필 조회 결과', { existing, findError })

      // 실제 에러인지 단순히 데이터가 없는 것인지 구분
      if (findError && findError.code !== 'PGRST116') {
        console.error('[UserService] createProfile: 프로필 조회 중 실제 에러 발생', findError)
        
        // RLS 에러인 경우 특별 처리
        if (findError.message?.includes('row-level security')) {
          console.warn('[UserService] createProfile: RLS 정책에 의한 접근 제한 - 프로필 생성 진행')
          // RLS 에러는 무시하고 계속 진행
        } else {
          throw findError
        }
      }
      
      if (existing) {
        console.log('[UserService] createProfile: 이미 존재하는 프로필 반환')
        return existing
      }

      // 새 프로필 데이터 생성
      const profileData: UserProfileInsert = {
        id: userData.id,
        email: userData.email,
        full_name: userData.fullName,
        school_name: userData.schoolName,
        phone: userData.phone || null,
        position: userData.position || null,
        is_approved: false,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      console.log('[UserService] createProfile: 새 프로필 데이터', profileData)

      console.log('[UserService] createProfile: INSERT 시작')
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()
      console.log('[UserService] createProfile: INSERT 완료')
      console.log('[UserService] createProfile: 프로필 생성 결과', { data, error })

      if (error) {
        console.error('[UserService] createProfile: 프로필 생성 에러', error)
        
        // RLS 에러 메시지를 더 명확하게 변환
        if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
          throw new Error('데이터베이스 권한 설정 문제입니다. 관리자에게 문의하세요.')
        }
        
        throw error
      }
      
      console.log('[UserService] createProfile: 프로필 생성 성공')
      return data
      
    } catch (error: any) {
      console.error('[UserService] createProfile: 최종 에러', error)
      throw error
    }
  }

  /**
   * 사용자 프로필을 조회합니다
   * 
   * @param userId 조회할 사용자 ID (기본값: 현재 로그인 사용자)
   * @returns 사용자 프로필 데이터
   * @throws 인증되지 않은 사용자일 경우 에러 발생
   */
  static async getProfile(userId?: string) {
    try {
      let targetUserId = userId
      
      // userId가 제공되지 않은 경우 현재 인증된 사용자 정보 가져오기
      if (!targetUserId) {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          throw new Error('User not authenticated')
        }
        
        targetUserId = user.id
      }
      
      if (!targetUserId) {
        throw new Error('User ID is required')
      }

      // Supabase 클라이언트를 직접 사용 (자동으로 인증 토큰 관리)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()
      
      if (error) {
        // 프로필이 없는 경우 (404)
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }
      
      return data
        
    } catch (error) {
      console.error('[UserService.getProfile] 에러:', error)
      throw error
    }
  }

  /**
   * 사용자 프로필을 업데이트합니다
   * 
   * @param updates 업데이트할 필드들
   * @returns 업데이트된 프로필 데이터
   * @throws 인증되지 않은 사용자일 경우 에러 발생
   */
  static async updateProfile(updates: Partial<UserProfileUpdate>) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()  // 수정 시간 자동 업데이트
      })
      .eq('id', user.user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 사용자의 활동 통계를 조회합니다
   * 
   * @param userId 조회할 사용자 ID (기본값: 현재 로그인 사용자)
   * @returns 사용자 통계 객체
   * - totalBlocks: 생성한 총 블록 수
   * - totalUsage: 블록 사용 총 횟수
   * - totalLikes: 받은 총 좋아요 수
   * - categoryUsage: 카테고리별 사용 통계
   * - lastActivity: 마지막 활동 시간
   * @throws 인증되지 않은 사용자일 경우 에러 발생
   */
  static async getUserStats(userId?: string) {
    const { data: user } = await supabase.auth.getUser()
    const targetUserId = userId || user.user?.id
    
    if (!targetUserId) throw new Error('User not authenticated')

    // 여러 통계를 병렬로 조회하여 성능 최적화
    const [
      { count: totalBlocks },      // 생성한 블록 수
      { count: totalUsage },       // 블록 사용 횟수
      likesResult,                 // 좋아요 계산용 블록 목록
      { data: categoryStats }      // 카테고리별 사용 통계
    ] = await Promise.all([
      // 사용자가 생성한 블록 수 조회
      supabase
        .from('blocks')
        .select('id', { count: 'exact' })
        .eq('created_by', targetUserId),

      // 사용자의 블록 사용 횟수 조회
      supabase
        .from('block_usage')
        .select('id', { count: 'exact' })
        .eq('user_id', targetUserId),

      // 사용자가 만든 블록들의 ID 조회 (좋아요 계산용)
      supabase
        .from('blocks')
        .select('id')
        .eq('created_by', targetUserId),

      // 카테고리별 사용 통계 조회
      supabase
        .from('block_usage')
        .select(`
          block_id,
          blocks!inner(tags)
        `)
        .eq('user_id', targetUserId)
    ])

    // 사용자가 만든 블록들의 총 좋아요 수 계산
    let totalLikes = 0
    if (likesResult.data && likesResult.data.length > 0) {
      const blockIds = likesResult.data.map(block => block.id)
      const { count } = await supabase
        .from('block_likes')
        .select('id', { count: 'exact' })
        .in('block_id', blockIds)
      totalLikes = count || 0
    }

    // 카테고리별 사용 횟수 집계
    const categoryUsage: Record<string, number> = {}
    categoryStats?.forEach(usage => {
      const tags = (usage.blocks as any)?.tags || []
      tags.forEach((tag: string) => {
        categoryUsage[tag] = (categoryUsage[tag] || 0) + 1
      })
    })

    return {
      totalBlocks: totalBlocks || 0,
      totalUsage: totalUsage || 0,
      totalLikes: totalLikes,
      categoryUsage,
      lastActivity: new Date().toISOString() // 실제로는 최근 활동 시간 조회 필요
    }
  }

  /**
   * 사용자의 활동 내역을 조회합니다 (블록 사용 기록)
   * 
   * @param userId 조회할 사용자 ID (기본값: 현재 로그인 사용자)
   * @param limit 조회할 최대 개수 (기본값: 20개)
   * @returns 사용 기록 배열 (블록 정보 포함)
   * @throws 인증되지 않은 사용자일 경우 에러 발생
   */
  static async getUserActivity(userId?: string, limit: number = 20) {
    const { data: user } = await supabase.auth.getUser()
    const targetUserId = userId || user.user?.id
    
    if (!targetUserId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('block_usage')
      .select(`
        *,
        blocks(id, title, tags)
      `)
      .eq('user_id', targetUserId)
      .order('used_at', { ascending: false })  // 최근 사용 순
      .limit(limit)

    if (error) throw error
    return data
  }

  /**
   * 사용자가 좋아요한 블록들을 조회합니다
   * 
   * @param userId 조회할 사용자 ID (기본값: 현재 로그인 사용자)
   * @returns 좋아요한 블록 배열
   * @throws 인증되지 않은 사용자일 경우 에러 발생
   */
  static async getUserLikedBlocks(userId?: string) {
    const { data: user } = await supabase.auth.getUser()
    const targetUserId = userId || user.user?.id
    
    if (!targetUserId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('block_likes')
      .select(`
        created_at,
        blocks(*)
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })  // 최근 좋아요 순

    if (error) throw error
    return data?.map(like => like.blocks)  // 블록 정보만 추출하여 반환
  }

  /**
   * 사용자의 마지막 로그인 시간을 현재 시간으로 업데이트합니다
   * 로그인 성공시 자동으로 호출됩니다
   */
  static async updateLastLogin() {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    await supabase
      .from('user_profiles')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.user.id)
  }

  /**
   * 현재 사용자의 승인 상태를 확인합니다
   * 
   * @returns 승인 상태 정보 (승인 여부, 이름, 학교명)
   * @throws 인증되지 않은 사용자일 경우 에러 발생
   */
  static async checkApprovalStatus() {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_approved, full_name, school_name')
      .eq('id', user.user.id)
      .single()

    if (error) throw error
    return data
  }

  /**
   * 현재 사용자가 관리자 권한을 가지고 있는지 확인합니다
   * 
   * @returns 관리자 권한 여부
   */
  static async isAdmin() {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return false

    const { data } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.user.id)
      .single()

    return data?.is_admin || false
  }
}

/**
 * 관리자 전용 서비스 클래스
 * 
 * 시스템 관리자만 접근 가능한 기능들을 제공합니다.
 * - 사용자 승인 관리
 * - 전체 사용자 목록 조회
 * - 시스템 통계 확인
 * 
 * 모든 메서드는 호출 전에 관리자 권한을 확인합니다.
 */
export class AdminService {
  /**
   * 승인 대기 중인 사용자 목록을 조회합니다
   * 
   * @returns 승인 대기 사용자 배열 (최신 가입순)
   * @throws 관리자 권한이 없을 경우 에러 발생
   */
  static async getPendingUsers() {
    const isAdmin = await UserService.isAdmin()
    if (!isAdmin) throw new Error('Admin access required')

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('is_approved', false)                    // 승인되지 않은 사용자만
      .order('created_at', { ascending: false })   // 최신 가입순

    if (error) throw error
    return data
  }

  /**
   * 사용자의 승인 상태를 변경합니다
   * 
   * @param userId 대상 사용자 ID
   * @param isApproved 승인 여부 (true: 승인, false: 거부)
   * @returns 업데이트된 사용자 정보
   * @throws 관리자 권한이 없을 경우 에러 발생
   */
  static async updateUserApproval(userId: string, isApproved: boolean) {
    const isAdmin = await UserService.isAdmin()
    if (!isAdmin) throw new Error('Admin access required')

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        is_approved: isApproved,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 전체 사용자 목록을 조회합니다 (관리자용)
   * 
   * @param options 조회 옵션
   * @param options.isApproved 승인 상태 필터 (true: 승인됨, false: 대기중, undefined: 전체)
   * @param options.search 검색어 (이름, 학교명, 이메일에서 검색)
   * @param options.limit 조회할 최대 개수
   * @param options.offset 건너뛸 개수 (페이징)
   * @returns 사용자 목록 배열
   * @throws 관리자 권한이 없을 경우 에러 발생
   */
  static async getAllUsers(options: {
    isApproved?: boolean
    search?: string
    limit?: number
    offset?: number
  } = {}) {
    const isAdmin = await UserService.isAdmin()
    if (!isAdmin) throw new Error('Admin access required')

    let query = supabase
      .from('user_profiles')
      .select('*')

    // 승인 상태 필터
    if (options.isApproved !== undefined) {
      query = query.eq('is_approved', options.isApproved)
    }

    // 검색어 필터 (이름, 학교명, 이메일에서 검색)
    if (options.search) {
      query = query.or(`full_name.ilike.%${options.search}%,school_name.ilike.%${options.search}%,email.ilike.%${options.search}%`)
    }

    // 페이징 처리
    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
    }

    query = query.order('created_at', { ascending: false })  // 최신 가입순

    const { data, error } = await query
    if (error) throw error
    return data
  }

  /**
   * 시스템 전체 통계를 조회합니다 (관리자용)
   * 
   * @returns 시스템 통계 객체
   * - totalUsers: 전체 사용자 수
   * - approvedUsers: 승인된 사용자 수
   * - pendingUsers: 승인 대기 사용자 수
   * - totalBlocks: 전체 공개 블록 수
   * - pendingReports: 처리 대기 신고 수
   * @throws 관리자 권한이 없을 경우 에러 발생
   */
  static async getSystemStats() {
    const isAdmin = await UserService.isAdmin()
    if (!isAdmin) throw new Error('Admin access required')

    // 여러 통계를 병렬로 조회하여 성능 최적화
    const [
      { count: totalUsers },      // 전체 사용자 수
      { count: approvedUsers },   // 승인된 사용자 수
      { count: totalBlocks },     // 전체 공개 블록 수
      { count: pendingReports }   // 처리 대기 신고 수
    ] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact' }),
      supabase.from('user_profiles').select('id', { count: 'exact' }).eq('is_approved', true),
      supabase.from('blocks').select('id', { count: 'exact' }).eq('is_public', true),
      supabase.from('reports').select('id', { count: 'exact' }).eq('status', 'pending')
    ])

    return {
      totalUsers: totalUsers || 0,
      approvedUsers: approvedUsers || 0,
      pendingUsers: (totalUsers || 0) - (approvedUsers || 0),  // 승인 대기 = 전체 - 승인됨
      totalBlocks: totalBlocks || 0,
      pendingReports: pendingReports || 0
    }
  }
}
