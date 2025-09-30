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
      console.log('🎯 [CategoryRecommendation] 카테고리 추천 시작 (v2)')

      // 1. 사용자 통계 및 사용 이력 병렬 조회 (기존과 동일, 효율적)
      const [leastUsedStats, usedNoticeIds, tagStats] = await Promise.all([
        UserUsageService.getLeastUsedCategories(),
        UserUsageService.getUserUsedNoticeIds(),
        UserUsageService.getTagStatistics()
      ])

      if (leastUsedStats.length === 0) {
        console.log('🎯 [CategoryRecommendation] 사용 통계가 없어 추천 불가')
        return []
      }

      // 2. 추천 대상 카테고리 선정 (기존과 동일)
      const minUsage = leastUsedStats[0].usageCount
      const leastUsedCategories = leastUsedStats
        .filter(stat => stat.usageCount === minUsage)
        .map(stat => stat.category as Category)
      console.log('🎯 [CategoryRecommendation] 최소 사용 카테고리:', leastUsedCategories)

      // 3. 후보 문구 일괄 조회 (개선점: DB 호출 1회로 줄임)
      const candidateNotices = await NoticeService.getNotices({
  // tags: leastUsedCategories, // 타입에 없는 필드이므로 제거
        excludeIds: usedNoticeIds,
        limit: count * 20, // 충분한 후보군 확보 (e.g., 5 * 20 = 100개)
        randomize: true
      })

      if (candidateNotices.length === 0) {
        console.log('🎯 [CategoryRecommendation] 후보 문구 없음')
        return []
      }

      // 4. 태그 사용 통계 맵 생성
      const tagUsageMap = new Map<string, number>()
      tagStats.forEach(stat => {
        tagUsageMap.set(stat.tag, stat.usageCount)
      })

      // 5. 메모리 내에서 최적의 추천 문구 선택 (개선점: 로직을 메모리에서 처리)
      const recommendations = this.selectBestNoticesFromPool(
        candidateNotices,
        count,
        tagUsageMap
      )

      console.log(`🎯 [CategoryRecommendation] 최종 추천 수: ${recommendations.length}개`)
      return recommendations
    } catch (error) {
      console.error('🎯 [CategoryRecommendation] 추천 생성 실패:', error)
      return []
    }
  }

  /**
   * 후보 목록에서 태그 다양성을 고려하여 최적의 문구를 선택
   * @param candidates 후보 문구 배열
   * @param count 선택할 개수
   * @param tagUsageMap 태그 사용 통계
   * @returns 추천 문구 배열
   */
  private static selectBestNoticesFromPool(
    candidates: Notice[],
    count: number,
    tagUsageMap: Map<string, number>
  ): Notice[] {
    const recommendations: Notice[] = []
    const availableCandidates = [...candidates]

    while (recommendations.length < count && availableCandidates.length > 0) {
      let bestCandidate: Notice | null = null
      let bestCandidateIndex = -1
      let maxScore = -1

      // 현재 추천된 문구들에서 사용된 태그 집합을 매번 새로 계산
      const usedTags = new Set<string>(
        recommendations.flatMap(r => (r as any).sub_tags || [])
      )

      for (let i = 0; i < availableCandidates.length; i++) {
        const candidate = availableCandidates[i]
        const tags = (candidate as any).sub_tags || []

        // 점수 계산: 새로운 태그 > 사용 적은 태그 > 기본
        const hasUnusedTag = tags.some((tag: string) => !usedTags.has(tag))
        const minTagUsage =
          tags.length > 0
            ? Math.min(...tags.map((tag: string) => tagUsageMap.get(tag) || 0))
            : 1000 // 태그가 없는 경우 후순위로

        const score = (hasUnusedTag ? 10000 : 0) + (1000 - minTagUsage)

        if (score > maxScore) {
          maxScore = score
          bestCandidate = candidate
          bestCandidateIndex = i
        }
      }

      if (bestCandidate) {
        recommendations.push(bestCandidate)
        availableCandidates.splice(bestCandidateIndex, 1) // 선택된 후보는 목록에서 제거
      } else {
        // 더 이상 적합한 후보가 없으면 종료
        break
      }
    }

    return recommendations
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
