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
   * @param options.categories 필터링할 카테고리 배열
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
    categories?: Category[]
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
        .select('*, tags')  // tags 명시적으로 포함

      // 카테고리 필터링 (DB의 categories 컬럼 사용)
      if (options.categories && options.categories.length > 0) {
        console.log('[getNotices] 카테고리 필터:', options.categories)
        query = query.overlaps('categories', options.categories)
      }

      // 검색어 필터링
      if (options.search) {
        console.log('[getNotices] 검색어:', options.search)
        query = query.or(`content.ilike.%${options.search}%`)
      }

      // 특정 ID 제외 (추천 시스템용)
      if (options.excludeIds && options.excludeIds.length > 0) {
        console.log('[getNotices] 제외할 ID:', options.excludeIds.length, '개')
        query = query.not('id', 'in', `(${options.excludeIds.join(',')})`)
      }

      // 날씨 문구 필터링
      const weatherFilter = options.weatherFilter || 'exclude' // 기본값: 날씨 문구 제외
      
      if (weatherFilter === 'only') {
        console.log('[getNotices] 날씨 문구만 조회')
        query = query.eq('is_weather_notice', true)
      } else if (weatherFilter === 'exclude') {
        query = query.eq('is_weather_notice', false)
      }

      // 정렬 설정
      const orderBy = options.orderBy || 'created_at'
      const order = options.order || 'desc'
      query = query.order(orderBy, { ascending: order === 'asc' })

      // 페이징 처리
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('[getNotices] Supabase error:', error)
        return Promise.reject(error.message || '알림장 목록 조회 중 오류가 발생했습니다.')
      }

      let notices = (data || []).map(this.mapRowToNotice)

      if (options.weatherConditions) {
        notices = notices.filter((notice: Notice) => {
          return this.isWeatherConditionMatch(options.weatherConditions, (notice as any).weather_conditions)
        })
      }

      if (options.randomize) {
        notices = this.shuffleArray(notices)
      }

      return notices

    } catch (error: any) {
      console.error('[NoticeService.getNotices] catch error:', error)
      return Promise.reject(error?.message || '알림장 목록 조회 중 예기치 않은 오류가 발생했습니다.')
    }
  }

  /**
   * 특정 ID의 문구를 상세 조회합니다
   */
  static async getNotice(id: string): Promise<Notice> {
    const { data, error } = await supabase
      .from('notices')
      .select('*, tags')
      .eq('id', id)
      .single()

    if (error) throw error
    return this.mapRowToNotice(data)
  }

  /**
   * 새로운 문구를 생성합니다
   */
  static async createNotice(notice: Omit<Notice, 'createdAt'>): Promise<Notice> {
    const noticeInsert: NoticeInsert = {
      id: notice.id,
      content: notice.content,
      categories: notice.categories, // App: categories -> DB: tags
      tags: notice.tags || null, // App: tags -> DB: sub_tags
      author: notice.author,
      like_count: notice.likeCount || 0,
      usage_count: notice.usageCount || null,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('notices')
      .insert(noticeInsert)
      .select('*, sub_tags')
      .single()

    if (error) throw error
    return this.mapRowToNotice(data)
  }

  /**
   * 기존 문구를 수정합니다
   */
  static async updateNotice(id: string, updates: Partial<Notice>): Promise<Notice> {
    const noticeUpdate: NoticeUpdate = {}

    if (updates.content !== undefined) noticeUpdate.content = updates.content
    if (updates.categories !== undefined) noticeUpdate.categories = updates.categories // App: categories -> DB: categories
    if (updates.tags !== undefined) noticeUpdate.tags = updates.tags // App: tags -> DB: tags
    if (updates.author !== undefined) noticeUpdate.author = updates.author
    if (updates.likeCount !== undefined) noticeUpdate.like_count = updates.likeCount
    if (updates.usageCount !== undefined) noticeUpdate.usage_count = updates.usageCount

    noticeUpdate.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('notices')
      .update(noticeUpdate)
      .eq('id', id)
      .select('*, sub_tags')
      .single()

    if (error) throw error
    return this.mapRowToNotice(data)
  }

  /**
   * 문구를 삭제합니다
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
   */
  static async getNoticesByCategories(categories: Category[], limit?: number): Promise<Notice[]> {
    return this.getNotices({
      categories: categories,
      orderBy: 'like_count',
      order: 'desc',
      limit
    })
  }

  /**
   * 특정 조건에 맞는 문구를 랜덤으로 하나 선택합니다
   */
  static async getRandomNotice(options: {
    categories?: Category[]
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
   */
  static async getRandomNotices(options: {
    categories?: Category[]
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
   */
  static async incrementUsageCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_notice_usage_count', { 
      notice_id: id 
    })

    if (error) {
      const notice = await this.getNotice(id)
      await this.updateNotice(id, {
        usageCount: (notice.usageCount || 0) + 1
      })
    }
  }

  /**
   * 문구 좋아요 수를 증가시킵니다
   */
  static async incrementLikeCount(id: string): Promise<void> {
    const notice = await this.getNotice(id)
    await this.updateNotice(id, {
      likeCount: notice.likeCount + 1
    })
  }

  /**
   * 문구 좋아요 수를 감소시킵니다
   */
  static async decrementLikeCount(id: string): Promise<void> {
    const notice = await this.getNotice(id)
    await this.updateNotice(id, {
      likeCount: Math.max(0, notice.likeCount - 1)
    })
  }

  /**
   * 데이터베이스 Row를 Notice 객체로 변환하는 헬퍼 메서드
   */
  private static mapRowToNotice(row: NoticeRow): Notice {
    const notice: Notice = {
      id: row.id,
      content: row.content,
      categories: row.categories as Category[], // DB: categories -> App: categories
      tags: row.tags || undefined,  // DB: tags -> App: tags
      author: row.author,
      likeCount: row.like_count,
      createdAt: new Date(row.created_at),
      usageCount: row.usage_count || undefined
    }
    const rowAny = row as any
    if (rowAny.weather_conditions) {
      (notice as any).weather_conditions = rowAny.weather_conditions
    }
    return notice
  }

  /**
   * 배열을 랜덤으로 섞는 헬퍼 메서드
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
   */
  private static isWeatherConditionMatch(weatherData: any, conditions: any): boolean {
    if (!conditions) return false
    
    if (conditions.temperature) {
      if (conditions.temperature.min && weatherData.temperature < conditions.temperature.min) return false
      if (conditions.temperature.max && weatherData.temperature > conditions.temperature.max) return false
    }
    
    if (conditions.condition && !conditions.condition.includes(weatherData.condition)) return false
    if (conditions.windSpeed?.min && weatherData.windSpeed < conditions.windSpeed.min) return false
    if (conditions.humidity?.min && weatherData.humidity < conditions.humidity.min) return false
    if (conditions.humidity?.max && weatherData.humidity > conditions.humidity.max) return false
    
    return true
  }

  /**
   * Notice 객체를 데이터베이스 Insert 형식으로 변환하는 헬퍼 메서드
   */
  private static mapNoticeToInsert(notice: Notice): NoticeInsert {
    return {
      id: notice.id,
      content: notice.content,
      categories: notice.categories,
      tags: notice.tags,
      author: notice.author,
      like_count: notice.likeCount,
      usage_count: notice.usageCount || null,
      created_at: notice.createdAt.toISOString()
    }
  }
}
