import { supabase } from '@/lib/supabase'
import type { Notice, Category } from '@/data/notices'
import { categorySubTagsMap } from '@/constants/categories'

export interface UserNoticeUsage {
  id: string
  user_id: string
  notice_id: string
  used_at: string
  notices?: any
}

export interface UserCategoryStats {
  category: string
  usage_count: number
  usage_percentage: number
  last_used: string
  notices?: Array<{ 
    id: string
    title?: string
    content: string
    subItems?: string[]
    used_at: string
    usage: number 
  }>
}

export class UserUsageService {
  /**
   * 문구 사용 기록 저장 (알림장 띄우기 시 호출)
   */
  static async saveNoticeUsage(noticeId: string) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        throw new Error('로그인이 필요합니다.')
      }

      const { data, error } = await supabase
        .from('user_notice_usage')
        .insert({
          user_id: user.user.id,
          notice_id: noticeId,
          used_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      console.log('문구 사용 기록 저장됨:', noticeId)
      return data
    } catch (error) {
      console.error('문구 사용 기록 저장 실패:', error)
      throw error
    }
  }

  /**
   * 여러 문구 사용 기록 일괄 저장
   */
  static async saveMultipleNoticeUsage(noticeIds: string[]) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        throw new Error('로그인이 필요합니다.')
      }

      const usageRecords = noticeIds.map(noticeId => ({
        user_id: user.user.id,
        notice_id: noticeId,
        used_at: new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from('user_notice_usage')
        .insert(usageRecords)
        .select()

      if (error) throw error
      console.log(`${noticeIds.length}개 문구 사용 기록 저장됨`)
      return data
    } catch (error) {
      console.error('다중 문구 사용 기록 저장 실패:', error)
      throw error
    }
  }

  /**
   * 사용자가 사용한 모든 문구 ID 조회
   */
  static async getUserUsedNoticeIds(userId?: string): Promise<string[]> {
    try {
      let currentUserId = userId
      if (!currentUserId) {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) {
          return []
        }
        currentUserId = user.user.id
      }

      const { data, error } = await supabase
        .from('user_notice_usage')
        .select('notice_id')
        .eq('user_id', currentUserId)

      if (error) throw error

      // 중복 제거해서 반환
      const noticeIds = data.map(item => item.notice_id)
      return [...new Set(noticeIds)]
    } catch (error) {
      console.error('사용한 문구 ID 조회 실패:', error)
      return []
    }
  }

  /**
   * 카테고리별 최소 사용 통계 조회 (추천용)
   */
  static async getLeastUsedCategories(): Promise<{ category: string; usageCount: number }[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        throw new Error('로그인이 필요합니다.')
      }

      // 사용자의 카테고리별 사용 통계 조회
      const categoryStats = await this.getUserCategoryStats()
      
      if (categoryStats.length === 0) {
        // 사용 기록이 없으면 모든 카테고리를 0회로 반환
        const { categories } = await import('@/constants/categories')
        return categories.map(category => ({ category, usageCount: 0 }))
      }

      // 사용 횟수 기준으로 정렬
      const sortedStats = categoryStats
        .map(stat => ({ category: stat.category, usageCount: stat.usage_count }))
        .sort((a, b) => a.usageCount - b.usageCount)

      return sortedStats
    } catch (error) {
      console.error('최소 사용 카테고리 조회 실패:', error)
      return []
    }
  }

  /**
   * 서브태그별 사용 통계 조회
   */
  static async getSubTagStatistics(userId?: string): Promise<{ 
    category: string; 
    subTag: string; 
    usageCount: number; 
    notices: any[] 
  }[]> {
    try {
      let currentUserId = userId
      if (!currentUserId) {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) {
          return []
        }
        currentUserId = user.user.id
      }

      const { data, error } = await supabase
        .from('user_notice_usage')
        .select(`
          notice_id,
          used_at,
          notices:notice_id (
            id,
            title,
            content,
            tags,
            sub_tags
          )
        `)
        .eq('user_id', currentUserId)
        .order('used_at', { ascending: false })

      if (error) throw error

      const subTagStats: Record<string, {
        category: string;
        subTag: string;
        usageCount: number;
        notices: any[];
      }> = {}

      data.forEach(usage => {
        const notices = Array.isArray(usage.notices) ? usage.notices : [usage.notices]
        notices.forEach((notice: any) => {
          if (!notice) return

          // sub_tags 처리
          const subTags = notice.sub_tags || []

          subTags.forEach((subTag: string) => {
            // 서브태그에서 메인 카테고리 찾기
            const mainCategory = this.getMainCategoryFromSubTag(subTag)
            if (!mainCategory) return

            const key = `${mainCategory}-${subTag}`
            
            if (!subTagStats[key]) {
              subTagStats[key] = {
                category: mainCategory,
                subTag: subTag,
                usageCount: 0,
                notices: []
              }
            }

            subTagStats[key].usageCount++
            
            // 중복 방지
            if (!subTagStats[key].notices.find(n => n.id === notice.id)) {
              subTagStats[key].notices.push({
                id: notice.id,
                title: notice.title,
                content: notice.content,
                used_at: usage.used_at
              })
            }
          })
        })
      })

      return Object.values(subTagStats)
        .sort((a, b) => b.usageCount - a.usageCount)
    } catch (error) {
      console.error('서브태그 통계 조회 실패:', error)
      return []
    }
  }

  /**
   * 서브태그에서 메인 카테고리 찾기 (내부 유틸리티)
   */
  private static getMainCategoryFromSubTag(subTag: string): string | null {
    for (const [category, subTags] of Object.entries(categorySubTagsMap)) {
      if (subTags.includes(subTag)) {
        return category
      }
    }
    return null
  }

  /**
   * 사용자의 사용 기록 조회 (페이지네이션 지원)
   */
  static async getUserUsageHistory(limit = 50): Promise<UserNoticeUsage[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        throw new Error('로그인이 필요합니다.')
      }

      const { data, error } = await supabase
        .from('user_notice_usage')
        .select(`
          id,
          user_id,
          notice_id,
          used_at,
          notices (
            id,
            title,
            content,
            tags,
            author,
            like_count,
            sub_items,
            created_at,
            usage_count
          )
        `)
        .eq('user_id', user.user.id)
        .order('used_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as UserNoticeUsage[]
    } catch (error) {
      console.error('사용 기록 조회 실패:', error)
      return []
    }
  }

  /**
   * 모든 사용자의 최근 사용 기록 조회 (글로벌 티커용)
   */
  static async getGlobalUsageHistory(limit = 50): Promise<UserNoticeUsage[]> {
    try {
      const { data, error } = await supabase
        .from('user_notice_usage')
        .select(`
          id,
          user_id,
          notice_id,
          used_at,
          notices (
            id,
            title,
            content,
            tags,
            author,
            like_count,
            sub_items,
            created_at,
            usage_count
          )
        `)
        // No user filter, so it's global
        .order('used_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as UserNoticeUsage[]
    } catch (error) {
      console.error('전체 사용 기록 조회 실패:', error)
      return []
    }
  }

  /**
   * 사용자의 카테고리별 통계 조회 (고유 문구 기준)
   */
  static async getUserCategoryStats(): Promise<UserCategoryStats[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        throw new Error('로그인이 필요합니다.')
      }

      // 사용자의 전체 사용 기록과 문구 정보 조회
      const { data, error } = await supabase
        .from('user_notice_usage')
        .select(`
          id,
          used_at,
          notice_id,
          notices!inner (
            id,
            title,
            content,
            tags,
            sub_items
          )
        `)
        .eq('user_id', user.user.id)
        .order('used_at', { ascending: false })

      if (error) throw error

      // 카테고리별 고유 문구 집계 및 문구 정보 수집
      const categoryData: Record<string, { 
        uniqueNotices: Set<string>; 
        lastUsed: string; 
        notices: Array<{ 
          id: string
          title?: string
          content: string
          subItems: string[]
          used_at: string
          usage: number 
        }> 
      }> = {}

      // 문구별 사용 횟수 집계
      const noticeUsageCount: Record<string, number> = {}
      data?.forEach(usage => {
        const noticeId = (usage.notices as any).id
        noticeUsageCount[noticeId] = (noticeUsageCount[noticeId] || 0) + 1
      })

      data?.forEach(usage => {
        const notice = usage.notices as any
        const tags = notice.tags as string[]
        
        tags.forEach(tag => {
          if (!categoryData[tag]) {
            categoryData[tag] = { 
              uniqueNotices: new Set(), 
              lastUsed: usage.used_at, 
              notices: [] 
            }
          }
          
          // 고유 문구 추가
          categoryData[tag].uniqueNotices.add(notice.id)
          
          // 해당 카테고리에 이 문구가 아직 없다면 추가
          const existingNotice = categoryData[tag].notices.find(n => n.id === notice.id)
          if (!existingNotice) {
            categoryData[tag].notices.push({
              id: notice.id,
              title: notice.title,
              content: notice.content,
              subItems: notice.sub_items || [],
              used_at: usage.used_at,
              usage: noticeUsageCount[notice.id] || 1
            })
          }
          
          // 가장 최근 사용일로 업데이트
          if (usage.used_at > categoryData[tag].lastUsed) {
            categoryData[tag].lastUsed = usage.used_at
          }
        })
      })

      // 총 고유 문구 수 계산
      const totalUniqueNotices = new Set(
        data?.map(usage => (usage.notices as any).id) || []
      ).size

      // 결과 구성 (고유 문구 수 기준)
      const results: UserCategoryStats[] = Object.entries(categoryData).map(([category, data]) => ({
        category,
        usage_count: data.uniqueNotices.size, // 고유 문구 수로 변경
        usage_percentage: totalUniqueNotices > 0 ? Math.round((data.uniqueNotices.size / totalUniqueNotices) * 100 * 10) / 10 : 0,
        last_used: data.lastUsed,
        notices: data.notices.sort((a, b) => new Date(b.used_at).getTime() - new Date(a.used_at).getTime())
      }))

      return results.sort((a, b) => b.usage_count - a.usage_count)
    } catch (error) {
      console.error('카테고리별 통계 조회 실패:', error)
      return []
    }
  }

  /**
   * 개인화된 추천 문구 조회 (다양성 중심)
   */
  static async getPersonalizedRecommendations(limit = 5): Promise<Notice[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        // 비로그인 사용자는 인기 문구 반환
        return this.getPopularNotices(limit)
      }

      // 사용자의 카테고리별 사용 통계 조회
      const categoryStats = await this.getUserCategoryStats()
      const usedCategories = categoryStats.map(stat => stat.category)
      
      // 이미 사용한 문구 ID 조회
      const { data: usedNoticeIds } = await supabase
        .from('user_notice_usage')
        .select('notice_id')
        .eq('user_id', user.user.id)

      const usedIds = usedNoticeIds?.map(item => item.notice_id) || []

      if (categoryStats.length === 0) {
        // 사용 기록이 없으면 인기 문구 반환
        return this.getPopularNotices(limit)
      }

      // 모든 가능한 카테고리 목록 (실제 DB에서 조회)
      const { data: allCategories } = await supabase
        .from('notices')
        .select('tags')
        .not('id', 'in', usedIds.length > 0 ? `(${usedIds.join(',')})` : '()')
      
      const allAvailableCategories = new Set<string>()
      allCategories?.forEach(notice => {
        (notice.tags as string[])?.forEach(tag => allAvailableCategories.add(tag))
      })

      // 미사용 카테고리 우선 추천 (50% 비중)
      const unusedCategories = Array.from(allAvailableCategories)
        .filter(category => !usedCategories.includes(category))
      
      // 적게 사용한 카테고리 추천 (30% 비중)  
      const leastUsedCategories = categoryStats
        .sort((a, b) => a.usage_count - b.usage_count)
        .slice(0, 2)
        .map(stat => stat.category)

      // 자주 사용하는 카테고리 추천 (20% 비중)
      const topCategories = categoryStats
        .slice(0, 1)
        .map(stat => stat.category)

      // 추천 카테고리 우선순위 조합
      const recommendationCategories = [
        ...unusedCategories.slice(0, Math.ceil(limit * 0.5)), // 50%: 미사용 카테고리
        ...leastUsedCategories.slice(0, Math.ceil(limit * 0.3)), // 30%: 적게 사용한 카테고리
        ...topCategories.slice(0, Math.ceil(limit * 0.2)) // 20%: 자주 사용하는 카테고리
      ].slice(0, Math.max(3, Math.ceil(limit * 0.8))) // 최대 추천 카테고리 수 제한

      console.log('🎯 추천 카테고리 분석:', {
        미사용카테고리: unusedCategories,
        적게사용한카테고리: leastUsedCategories,
        자주사용하는카테고리: topCategories,
        최종추천카테고리: recommendationCategories
      })

      if (recommendationCategories.length === 0) {
        return this.getPopularNotices(limit)
      }

      // 선정된 카테고리에서 문구 추천
      const { data: recommendations, error } = await supabase
        .from('notices')
        .select('*')
        .overlaps('tags', recommendationCategories)
        .not('id', 'in', usedIds.length > 0 ? `(${usedIds.join(',')})` : '()')
        .order('like_count', { ascending: false })
        .limit(limit)

      if (error) throw error
      return recommendations || []
    } catch (error) {
      console.error('개인화 추천 조회 실패:', error)
      return []
    }
  }

  /**
   * 인기 문구 조회 (fallback용)
   */
  private static async getPopularNotices(limit = 5): Promise<Notice[]> {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('like_count', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('인기 문구 조회 실패:', error)
      return []
    }
  }
}
