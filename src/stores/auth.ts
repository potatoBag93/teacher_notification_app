/**
 * 인증 관련 상태 관리 스토어 (Pinia)
 * 
 * 구글 OAuth를 통한 사용자 인증, 프로필 관리, 권한 확인 등의 기능을 제공합니다.
 * - 구글 로그인/로그아웃 처리
 * - 사용자 프로필 상태 관리
 * - 승인 상태 및 관리자 권한 확인
 * - 인증 상태 자동 초기화 및 동기화
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, getCurrentUser, getSession, signOut, signInWithGoogle } from '../lib/supabase'
import { UserService } from '../services/userService'
import type { Database } from '../lib/database.types'

// 사용자 프로필 타입 정의
type User = Database['public']['Tables']['user_profiles']['Row']

export const useAuthStore = defineStore('auth', () => {
  // ==================== 상태 (State) ====================
  
  /** 현재 로그인된 사용자의 프로필 정보 */
  const user = ref<User | null>(null)
  
  /** 로딩 상태 (로그인, 초기화 등) */
  const isLoading = ref(false)
  
  /** 사용자 인증 여부 */
  const isAuthenticated = ref(false)
  
  /** 관리자 승인 여부 */
  const isApproved = ref(false)
  
  /** 관리자 권한 여부 */
  const isAdmin = ref(false)
  // stores/auth.ts
  const isInit = ref(false)
  let initPromise: Promise<void> | null = null
  // ==================== 계산된 값 (Getters) ====================
  
  /** 사용자 프로필 정보 반환 */
  const userProfile = computed(() => user.value)
  
  /** 사용자 이름 반환 */
  const userName = computed(() => user.value?.full_name || '')
  
  /** 사용자 학교명 반환 */
  const userSchool = computed(() => user.value?.school_name || '')

  /** 프로필 완성도 체크 */
  const isProfileComplete = computed(() => {
    return user.value?.school_name?.trim() ? true : false
  })

  // ==================== 액션 (Actions) ====================
  
  /**
   * 앱 시작시 인증 상태를 초기화합니다
   */
  const initializeAuth = async () => {
    // console.log("initialize Auth Start")
    isLoading.value = true
    try {
      const currentUser = await getCurrentUser()
      
      if (currentUser) {
        await loadUserProfile()
        
        // updateLastLogin은 백그라운드에서 실행 (에러 무시)
        UserService.updateLastLogin().catch(err => 
          console.warn('[Auth Store] 마지막 로그인 업데이트 실패:', err)
        )
      } else {
        clearAuth()
        // console.log("clearAuth Done.")
      }
    } catch (error) {
      console.error('[Auth Store] 인증 초기화 실패:', error)
      clearAuth()
    } finally {
      isLoading.value = false
    }
  }

  // "동시에 한 번만" + "성공 시에만 완료 표시" + "항상 동일 Promise 공유"
  const initializeAuthOnce = async (): Promise<void> => {
    if (isInit.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        await initializeAuth()
        isInit.value = true      // ← 성공 시에만 완료 처리
      } finally {
        initPromise = null       // ← 다음 호출을 위해 정리
      }
    })()

    return initPromise
  }

  /**
   * 현재 인증된 사용자의 프로필을 로드합니다
   */
  const loadUserProfile = async (userId? : string) => {
    try {
      // 기존 프로필 조회 시도
      const profile = await UserService.getProfile(userId)
      
      // 프로필이 없으면 새로 생성
      if (!profile) {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          throw new Error('사용자 정보를 찾을 수 없습니다.')
        }

        // 구글 계정 정보로 프로필 생성
        const newProfile = await UserService.createProfile({
          id: currentUser.id,
          email: currentUser.email!,
          fullName: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '이름 없음',
          schoolName: '', // 나중에 사용자가 입력
          phone: undefined,
          position: undefined
        })

        user.value = newProfile
        isAuthenticated.value = true
        isApproved.value = newProfile.is_approved
        isAdmin.value = newProfile.is_admin
        return
      }
      
      // 프로필이 있으면 설정
      user.value = profile
      isAuthenticated.value = true
      isApproved.value = profile.is_approved
      isAdmin.value = profile.is_admin
      
    } catch (error) {
      console.error('[Auth Store] 프로필 로드 실패:', error)
      clearAuth()
    }
  }

  /**
   * 구글 OAuth를 통한 로그인을 처리합니다
   * 
   * @returns 로그인 결과 객체 { success: boolean, error?: string }
   */
  const loginWithGoogle = async () => {
    isLoading.value = true
    try {
      console.log('[Auth Store] 구글 로그인 시작')
      
      const { data, error } = await signInWithGoogle()
      if (error) throw error

      console.log('[Auth Store] 구글 로그인 요청 성공 - 리디렉션 진행 중')
      return { success: true }
    } catch (error: any) {
      console.error('[Auth Store] 구글 로그인 실패:', error)
      return { 
        success: false, 
        error: error.message || '구글 로그인에 실패했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * OAuth 콜백을 처리하고 사용자 프로필을 로드합니다
   * 
   * @returns 콜백 처리 결과 { success: boolean, error?: string }
   */
  const handleAuthCallback = async () => {
    isLoading.value = true
    try {
      console.log('[Auth Store] OAuth 콜백 처리 시작')
      
      // 현재 세션 확인
      const session = await getSession()
      if (!session) {
        throw new Error('인증 세션을 찾을 수 없습니다.')
      }

      console.log('[Auth Store] 세션 확인됨:', session.user.email)
      
      // 사용자 프로필 로드 또는 생성
      await loadUserProfile()
      
      return { success: true }
    } catch (error: any) {
      console.error('[Auth Store] OAuth 콜백 처리 실패:', error)
      return { 
        success: false, 
        error: error.message || 'OAuth 콜백 처리에 실패했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 현재 사용자를 로그아웃합니다
   * 
   * @returns 로그아웃 결과 객체 { success: boolean, error?: string }
   */
  const logout = async () => {
    console.log("auth.js - logout")
    isLoading.value = true
    try {
      const { error } = await signOut()
      if (error) throw error
      
      clearAuth()  // 로컬 상태 초기화
      resetInitFlags()
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || '로그아웃에 실패했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }
  // (선택) 로그아웃 시 플래그 리셋: 다음 로그인에서 다시 초기화되도록
  const resetInitFlags = () => {
    isInit.value = false
    initPromise = null
  }
  /**
   * 사용자 프로필을 업데이트합니다
   * 
   * @param updates 업데이트할 프로필 필드들
   * @returns 업데이트 결과 객체 { success: boolean, error?: string }
   */
  const updateProfile = async (updates: Partial<User>) => {
    if (!user.value) return { success: false, error: '로그인이 필요합니다.' }

    isLoading.value = true
    try {
      const updatedProfile = await UserService.updateProfile(updates)
      user.value = updatedProfile  // 로컬 상태 업데이트
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || '프로필 업데이트에 실패했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 현재 사용자의 승인 상태를 확인합니다
   * 
   * @returns 승인 상태 정보 객체 또는 null
   */
  const checkApprovalStatus = async () => {
    try {
      const status = await UserService.checkApprovalStatus()
      isApproved.value = status.is_approved  // 로컬 상태 업데이트
      return status
    } catch (error) {
      console.error('Failed to check approval status:', error)
      return null
    }
    
  }

  /**
   * 인증 관련 모든 상태를 초기화합니다
   */
  const clearAuth = () => {
    user.value = null
    isAuthenticated.value = false
    isApproved.value = false
    isAdmin.value = false
  }


  // ==================== 반환할 상태와 메서드들 ====================
  
  return {
    // 상태 (State)
    user: userProfile,      // 사용자 프로필 정보
    isLoading,             // 로딩 상태
    isAuthenticated,       // 인증 여부
    isApproved,           // 승인 여부
    isAdmin,              // 관리자 권한
    
    // 계산된 값 (Getters)
    userName,             // 사용자 이름
    userSchool,           // 사용자 학교명
    isProfileComplete,    // 프로필 완성 여부
    
    // 액션 (Actions)
    initializeAuth,       // 인증 상태 초기화
    initializeAuthOnce,
    loginWithGoogle,      // 구글 로그인
    handleAuthCallback,   // OAuth 콜백 처리
    logout,              // 로그아웃
    updateProfile,       // 프로필 업데이트
    checkApprovalStatus, // 승인 상태 확인
    loadUserProfile      // 프로필 다시 로드
  }
})