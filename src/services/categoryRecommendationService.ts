import { NoticeService } from './noticeService'
import { UserUsageService } from './userUsageService'
import type { Notice, Category } from '@/data/notices'

/**
 * 카테고리 기반 추천 서비스
 * 사용자가 적게 사용한 카테고리에서 아직 사용하지 않은 문구를 추천
 */
export class CategoryRecommendationService {
  
  /**
   * 카테고리 기반 추천 문구 생성
   * @param count 추천할 문구 개수 (기본값: 2)
   * @returns 추천 문구 배열
   */
  static async getRecommendations(count: number = 2): Promise<Notice[]> {
    try {
      console.log('🎯 [CategoryRecommendation] 카테고리 추천 시작')
      
      // 1. 사용자 통계 조회 (메인 카테고리 + 서브태그)
      const [leastUsedStats, usedNoticeIds, subTagStats] = await Promise.all([
        UserUsageService.getLeastUsedCategories(),
        UserUsageService.getUserUsedNoticeIds(),
        UserUsageService.getSubTagStatistics()
      ])

      if (leastUsedStats.length === 0) {
        console.log('🎯 [CategoryRecommendation] 사용 통계가 없음')
        return []
      }

      // 2. 서브태그별 사용현황 분석
      const subTagUsageMap = new Map<string, number>()
      subTagStats.forEach(stat => {
        subTagUsageMap.set(stat.subTag, stat.usageCount)
      })

      // 3. 최소 사용 카테고리들 찾기 (서브태그 고려)
      const minUsage = leastUsedStats[0].usageCount
      const leastUsedCategories = leastUsedStats
        .filter(stat => stat.usageCount === minUsage)
        .map(stat => stat.category as Category)

      console.log('🎯 [CategoryRecommendation] 최소 사용 카테고리들:', leastUsedCategories)

      // 4. 추천 문구 생성 (서브태그 다양성 고려)
      const recommendations: Notice[] = []
      const maxAttempts = Math.min(leastUsedCategories.length * 3, 15) // 시도 횟수 증가
      const usedSubTags = new Set<string>()

      for (let attempt = 0; attempt < maxAttempts && recommendations.length < count; attempt++) {
        const randomCategory = this.getRandomFromArray(leastUsedCategories)
        
        try {
          const categoryRecommendation = await this.getRecommendationFromCategory(
            randomCategory,
            usedNoticeIds,
            recommendations.map(r => r.id), // 이미 선택된 추천 문구도 제외
            subTagUsageMap,
            usedSubTags
          )

          if (categoryRecommendation) {
            recommendations.push(categoryRecommendation)
            
            // 사용된 서브태그 추적
            const notice = categoryRecommendation as any
            if (notice.sub_tags) {
              notice.sub_tags.forEach((subTag: string) => usedSubTags.add(subTag))
            }
            
            console.log(`🎯 [CategoryRecommendation] ${randomCategory} 카테고리에서 추천 추가:`, categoryRecommendation.title)
          }
        } catch (error) {
          console.warn(`🎯 [CategoryRecommendation] ${randomCategory} 카테고리 추천 실패:`, error)
        }
      }

      console.log(`🎯 [CategoryRecommendation] 최종 추천 수: ${recommendations.length}개`)
      return recommendations

    } catch (error) {
      console.error('🎯 [CategoryRecommendation] 추천 생성 실패:', error)
      return []
    }
  }

  /**
   * 특정 카테고리에서 추천 문구 조회 (서브태그 다양성 고려)
   * @param category 카테고리
   * @param excludeIds 제외할 문구 ID들
   * @param alreadySelected 이미 선택된 추천 문구 ID들
   * @param subTagUsageMap 서브태그별 사용횟수 맵
   * @param usedSubTags 이미 사용된 서브태그 Set
   * @returns 추천 문구 또는 null
   */
  private static async getRecommendationFromCategory(
    category: Category,
    excludeIds: string[],
    alreadySelected: string[] = [],
    subTagUsageMap?: Map<string, number>,
    usedSubTags?: Set<string>
  ): Promise<Notice | null> {
    try {
      // 해당 카테고리에서 사용하지 않은 문구들 조회
      const availableNotices = await NoticeService.getNotices({
        tags: [category],
        excludeIds: [...excludeIds, ...alreadySelected],
        limit: 30, // 후보군 증가
        randomize: true
      })

      if (availableNotices.length === 0) {
        console.log(`🎯 [CategoryRecommendation] ${category} 카테고리에 사용 가능한 문구 없음`)
        return null
      }

      // 서브태그 다양성을 고려한 선택
      if (subTagUsageMap && usedSubTags) {
        // 아직 사용하지 않은 서브태그를 가진 문구 우선 선택
        const noticesWithUnusedSubTags = availableNotices.filter(notice => {
          const noticeSubTags = (notice as any).sub_tags || []
          return noticeSubTags.some((subTag: string) => !usedSubTags.has(subTag))
        })

        if (noticesWithUnusedSubTags.length > 0) {
          // 가장 적게 사용된 서브태그를 가진 문구 선택
          const sortedBySubTagUsage = noticesWithUnusedSubTags.sort((a, b) => {
            const getMinSubTagUsage = (notice: Notice) => {
              const subTags = (notice as any).sub_tags || []
              if (subTags.length === 0) return 0
              return Math.min(...subTags.map((subTag: string) => subTagUsageMap.get(subTag) || 0))
            }
            return getMinSubTagUsage(a) - getMinSubTagUsage(b)
          })
          
          return sortedBySubTagUsage[0]
        }
      }

      // 기본적으로 랜덤 선택
      return this.getRandomFromArray(availableNotices)
      
    } catch (error) {
      console.error(`🎯 [CategoryRecommendation] ${category} 카테고리 문구 조회 실패:`, error)
      return null
    }
  }

  /**
   * 배열에서 랜덤 요소 선택
   * @param array 배열
   * @returns 랜덤 요소
   */
  private static getRandomFromArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  /**
   * 추천 메시지 생성
   * @param category 카테고리
   * @param usageCount 사용 횟수
   * @returns 추천 메시지
   */
  static getRecommendationMessage(category: Category, usageCount: number): string {
    if (usageCount === 0) {
      return `💡 '${category}' 영역의 새로운 문구를 시도해보세요!`
    } else {
      return `🔄 '${category}' 영역을 다시 활용해보세요!`
    }
  }
}
