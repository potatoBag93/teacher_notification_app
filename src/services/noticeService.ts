/**
 * 알림장 문구 관리 서비스 클래스
 * 
 * notices.ts 구조에 맞는 알림장 문구의 CRUD 작업과 관련 기능들을 제공합니다.
 * - 문구 조회 (필터링, 검색, 정렬, 페이징)
 * - 문구 생성, 수정, 삭제
 * - 좋아요 기능
 * - 사용 기록 추적
 * - 추천 및 인기 문구 조회
 */

import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import type { Notice, Category } from '../data/notices'

// 데이터베이스 타입 정의
type NoticeRow = Database['public']['Tables']['notices']['Row']
type NoticeInsert = Database['public']['Tables']['notices']['Insert']
type NoticeUpdate = Database['public']['Tables']['notices']['Update']

export class NoticeService {
  /**
   * 공개된 문구들을 조회합니다 (필터링 및 페이징 지원)
   * 
   * @param options 조회 옵션
   * @param options.tags 필터링할 태그 배열
   * @param options.search 제목이나 내용에서 검색할 키워드
   * @param options.orderBy 정렬 기준 ('created_at', 'usage_count', 'like_count')
   * @param options.order 정렬 순서 ('asc', 'desc')
   * @param options.limit 한 번에 가져올 최대 개수
   * @param options.offset 건너뛸 개수 (페이징용)
   * @param options.weatherFilter 날씨 문구 필터 ('exclude' | 'only' | 'include')
   * @param options.weatherConditions 특정 날씨 조건에 맞는 문구만 조회
   * @param options.excludeIds 제외할 문구 ID 배열
   * @param options.randomize 결과를 랜덤으로 섞을지 여부
   * @returns 조건에 맞는 문구 배열
   */
  static async getNotices(options: {
    tags?: Category[]
    search?: string
    orderBy?: 'created_at' | 'usage_count' | 'like_count'
    order?: 'asc' | 'desc'
    limit?: number
    offset?: number
    weatherFilter?: 'exclude' | 'only' | 'include'
    weatherConditions?: any
    excludeIds?: string[]
    randomize?: boolean
  } = {}): Promise<Notice[]> {

    let query: any
    try {
      query = supabase
        .from('notices')
        .select('*, sub_tags')  // sub_tags 명시적으로 포함

      // console.log("supabase:",supabase)
      // 태그 필터링
      if (options.tags && options.tags.length > 0) {
        console.log('[getNotices] 태그 필터:', options.tags)
        query = query.overlaps('tags', options.tags)
      }

      // 검색어 필터링
      if (options.search) {
        console.log('[getNotices] 검색어:', options.search)
        query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`)
      }

      // 특정 ID 제외 (추천 시스템용)
      if (options.excludeIds && options.excludeIds.length > 0) {
        console.log('[getNotices] 제외할 ID:', options.excludeIds.length, '개')
        query = query.not('id', 'in', `(${options.excludeIds.join(',')})`)
      }

      // 날씨 문구 필터링
      const weatherFilter = options.weatherFilter || 'exclude' // 기본값: 날씨 문구 제외
      
      if (weatherFilter === 'only') {
        // 날씨 문구만 조회
        console.log('[getNotices] 날씨 문구만 조회')
        query = query.eq('is_weather_notice', true)
      } else if (weatherFilter === 'exclude') {
        // 날씨 문구 제외
        query = query.eq('is_weather_notice', false)
      }
      // weatherFilter === 'include'인 경우 필터링하지 않음

      // 제외할 ID가 있는 경우
      if (options.excludeIds && options.excludeIds.length > 0) {
        // 중복 제거
        const uniqueIds = [...new Set(options.excludeIds)]
        console.log('[getNotices] 제외할 ID:', uniqueIds.length, '개')
        query = query.not('id', 'in', `(${uniqueIds.join(',')})`)
      }

      // 정렬 설정
      const orderBy = options.orderBy || 'created_at'
      const order = options.order || 'desc'
      // console.log('[getNotices] 정렬:', orderBy, order)
      query = query.order(orderBy, { ascending: order === 'asc' })

      // 페이징 처리
      if (options.limit) {
        // console.log('[getNotices] limit:', options.limit)
        query = query.limit(options.limit)
      }
      if (options.offset) {
        // console.log('[getNotices] offset:', options.offset)
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
      }

      // console.log('[getNotices] 쿼리 실행 직전:', query)
      const { data, error } = await query
      // console.log('[getNotices] 쿼리 실행 완료', { data, error })

      // console.log('🔍 [getNotices] 데이터베이스 조회 결과:', data)
      // console.log('🔍 [getNotices] 조회된 행 수:', data?.length || 0)
      
      // if (data && data.length > 0) {
      //   console.log('🔍 [getNotices] 첫 번째 행 샘플:', data[0])
      //   console.log('🔍 [getNotices] 첫 번째 행의 is_weather_notice:', data[0].is_weather_notice)
      //   console.log('🔍 [getNotices] 첫 번째 행의 weather_conditions:', data[0].weather_conditions)
      // }

      if (error) {
        console.error('[getNotices] Supabase error:', error)
        // throw error
        // UI에 노출할 수 있도록 에러 객체 대신 Notice[]에 특수값 반환
        return Promise.reject(error.message || '알림장 목록 조회 중 오류가 발생했습니다.')
      }

      // 데이터베이스 형식을 Notice 형식으로 변환
      let notices = (data || []).map(this.mapRowToNotice)

      // 날씨 조건 기반 추가 필터링 (클라이언트 사이드)
      if (options.weatherConditions) {
        // console.log('🌤️ [NoticeService] 날씨 조건 필터링 시작:', options.weatherConditions)
        // console.log('🌤️ [NoticeService] 필터링 전 문구 수:', notices.length)
        
        notices = notices.filter((notice: Notice) => {
          const match = this.isWeatherConditionMatch(options.weatherConditions, (notice as any).weather_conditions)
          // if (match) {
          //   console.log('✅ [NoticeService] 매칭된 문구:', notice.title, (notice as any).weather_conditions)
          // }
          return match
        })
        
        console.log('🌤️ [NoticeService] 필터링 후 문구 수:', notices.length)
      }

      // 랜덤화 처리
      if (options.randomize) {
        notices = this.shuffleArray(notices)
      }

      // console.log('[getNotices] 변환된 notices:', notices)
      return notices

    } catch (error: any) {
      console.error('[NoticeService.getNotices] catch error:', error)
      // throw error
      return Promise.reject(error?.message || '알림장 목록 조회 중 예기치 않은 오류가 발생했습니다.')
    }
  }

  /**
   * 특정 ID의 문구를 상세 조회합니다
   * 
   * @param id 조회할 문구의 ID
   * @returns 문구 데이터
   * @throws 문구가 존재하지 않으면 에러 발생
   */
  static async getNotice(id: string): Promise<Notice> {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return this.mapRowToNotice(data)
  }

  /**
   * 새로운 문구를 생성합니다
   * 
   * @param notice 생성할 문구 데이터
   * @returns 생성된 문구 데이터
   */
  static async createNotice(notice: Omit<Notice, 'createdAt'>): Promise<Notice> {
    const noticeInsert: NoticeInsert = {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      tags: notice.tags,
      sub_tags: notice.subTags || null,  // subTags 추가
      author: notice.author,
      like_count: notice.likeCount || 0,
      sub_items: notice.subItems,
      usage_count: notice.usageCount || null,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('notices')
      .insert(noticeInsert)
      .select()
      .single()

    if (error) throw error
    return this.mapRowToNotice(data)
  }

  /**
   * 기존 문구를 수정합니다
   * 
   * @param id 수정할 문구의 ID
   * @param updates 수정할 데이터
   * @returns 수정된 문구 데이터
   */
  static async updateNotice(id: string, updates: Partial<Notice>): Promise<Notice> {
    const noticeUpdate: NoticeUpdate = {}

    if (updates.title !== undefined) noticeUpdate.title = updates.title
    if (updates.content !== undefined) noticeUpdate.content = updates.content
    if (updates.tags !== undefined) noticeUpdate.tags = updates.tags
    if (updates.subTags !== undefined) noticeUpdate.sub_tags = updates.subTags
    if (updates.author !== undefined) noticeUpdate.author = updates.author
    if (updates.likeCount !== undefined) noticeUpdate.like_count = updates.likeCount
    if (updates.subItems !== undefined) noticeUpdate.sub_items = updates.subItems
    if (updates.usageCount !== undefined) noticeUpdate.usage_count = updates.usageCount

    noticeUpdate.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('notices')
      .update(noticeUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapRowToNotice(data)
  }

  /**
   * 문구를 삭제합니다
   * 
   * @param id 삭제할 문구의 ID
   */
  static async deleteNotice(id: string): Promise<void> {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * 추천 문구들을 조회합니다
   * 
   * @param limit 조회할 최대 개수 (기본값: 10개)
   * @returns 추천 문구 배열
   */
  static async getRecommendedNotices(limit: number = 10): Promise<Notice[]> {
    return this.getNotices({
      orderBy: 'like_count',
      order: 'desc',
      limit
    })
  }

  /**
   * 인기 문구들을 조회합니다 (좋아요 순)
   * 
   * @param limit 조회할 최대 개수 (기본값: 10개)
   * @returns 인기 문구 배열
   */
  static async getPopularNotices(limit: number = 10): Promise<Notice[]> {
    return this.getNotices({
      orderBy: 'like_count',
      order: 'desc',
      limit
    })
  }

  /**
   * 카테고리별 문구를 조회합니다
   * 
   * @param categories 조회할 카테고리 배열
   * @param limit 조회할 최대 개수
   * @returns 카테고리에 해당하는 문구 배열
   */
  static async getNoticesByCategories(categories: Category[], limit?: number): Promise<Notice[]> {
    return this.getNotices({
      tags: categories,
      orderBy: 'like_count',
      order: 'desc',
      limit
    })
  }

  /**
   * 특정 조건에 맞는 문구를 랜덤으로 하나 선택합니다
   * 
   * @param options 조회 조건
   * @returns 랜덤으로 선택된 문구 (없으면 null)
   */
  static async getRandomNotice(options: {
    tags?: Category[]
    weatherConditions?: any
    weatherFilter?: 'exclude' | 'only' | 'include'
    excludeIds?: string[]
  } = {}): Promise<Notice | null> {
    const notices = await this.getNotices({
      ...options,
      randomize: true
    })
    
    return notices.length > 0 ? notices[0] : null
  }

  /**
   * 특정 조건에 맞는 문구를 랜덤으로 여러 개 선택합니다
   * 
   * @param options 조회 조건
   * @param count 선택할 개수
   * @returns 랜덤으로 선택된 문구 배열
   */
  static async getRandomNotices(options: {
    tags?: Category[]
    weatherConditions?: any
    weatherFilter?: 'exclude' | 'only' | 'include'
    excludeIds?: string[]
  } = {}, count: number = 3): Promise<Notice[]> {
    const notices = await this.getNotices({
      ...options,
      randomize: true,
      limit: count * 3 // 충분한 여유분 확보
    })
    
    return notices.slice(0, count)
  }

  /**
   * 문구 사용 횟수를 증가시킵니다
   * 
   * @param id 사용한 문구의 ID
   */
  static async incrementUsageCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_notice_usage_count', { 
      notice_id: id 
    })

    if (error) {
      // RPC 함수가 없는 경우 직접 업데이트
      const notice = await this.getNotice(id)
      await this.updateNotice(id, {
        usageCount: (notice.usageCount || 0) + 1
      })
    }
  }

  /**
   * 문구 좋아요 수를 증가시킵니다
   * 
   * @param id 좋아요한 문구의 ID
   */
  static async incrementLikeCount(id: string): Promise<void> {
    const notice = await this.getNotice(id)
    await this.updateNotice(id, {
      likeCount: notice.likeCount + 1
    })
  }

  /**
   * 문구 좋아요 수를 감소시킵니다
   * 
   * @param id 좋아요 취소한 문구의 ID
   */
  static async decrementLikeCount(id: string): Promise<void> {
    const notice = await this.getNotice(id)
    await this.updateNotice(id, {
      likeCount: Math.max(0, notice.likeCount - 1)
    })
  }

  /**
   * 데이터베이스 Row를 Notice 객체로 변환하는 헬퍼 메서드
   * 
   * @param row 데이터베이스 행 데이터
   * @returns Notice 객체
   */
  private static mapRowToNotice(row: NoticeRow): Notice {
    const notice = {
      id: row.id,
      title: row.title,
      content: row.content,
      tags: row.tags as Category[],
      subTags: (row as any).sub_tags || undefined,  // subTags 추가
      author: row.author,
      likeCount: row.like_count,
      subItems: row.sub_items,
      createdAt: new Date(row.created_at),
      usageCount: row.usage_count || undefined
    }
    
    // 날씨 조건 정보 추가 (있는 경우에만)
    const rowAny = row as any
    if (rowAny.weather_conditions) {
      (notice as any).weather_conditions = rowAny.weather_conditions
    }
    
    return notice
  }

  /**
   * 배열을 랜덤으로 섞는 헬퍼 메서드
   * 
   * @param array 섞을 배열
   * @returns 섞인 새 배열
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * 날씨 조건 매칭 확인 헬퍼 메서드
   * 
   * @param weatherData 현재 날씨 데이터
   * @param conditions 문구의 날씨 조건
   * @returns 조건이 맞는지 여부
   */
  private static isWeatherConditionMatch(weatherData: any, conditions: any): boolean {
    if (!conditions) return false
    
    // 온도 조건 체크
    if (conditions.temperature) {
      if (conditions.temperature.min && weatherData.temperature < conditions.temperature.min) {
        return false
      }
      if (conditions.temperature.max && weatherData.temperature > conditions.temperature.max) {
        return false
      }
    }
    
    // 날씨 상태 조건 체크
    if (conditions.condition && !conditions.condition.includes(weatherData.condition)) {
      return false
    }
    
    // 풍속 조건 체크
    if (conditions.windSpeed?.min && weatherData.windSpeed < conditions.windSpeed.min) {
      return false
    }

    // 습도 조건 체크
    if (conditions.humidity?.min && weatherData.humidity < conditions.humidity.min) {
      return false
    }

    // 습도 최대값 체크 (건조 조건)
    if (conditions.humidity?.max && weatherData.humidity > conditions.humidity.max) {
      return false
    }
    
    return true
  }

  /**
   * Notice 객체를 데이터베이스 Insert 형식으로 변환하는 헬퍼 메서드
   * 
   * @param notice Notice 객체
   * @returns 데이터베이스 Insert 객체
   */
  private static mapNoticeToInsert(notice: Notice): NoticeInsert {
    return {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      tags: notice.tags,
      author: notice.author,
      like_count: notice.likeCount,
      sub_items: notice.subItems,
      usage_count: notice.usageCount || null,
      created_at: notice.createdAt.toISOString()
    }
  }
}
