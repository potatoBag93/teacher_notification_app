<template>
  <AppLayout>
    <div :class="$style.dashboard">
      <!-- 헤더 섹션 -->
      <header :class="$style.header">
        <h1 :class="$style.title">📊 내 알림장 사용 분석</h1>
        <p :class="$style.subtitle">알림장 사용 패턴과 활동 내역을 확인해보세요</p>
      </header>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" :class="$style.loading">
        <div :class="$style.loadingSpinner">📊</div>
        <p>통계 데이터를 불러오는 중...</p>
      </div>

      <!-- 데이터가 없는 경우 -->
      <div v-else-if="!usageHistory.length" :class="$style.emptyState">
        <div :class="$style.emptyIcon">📝</div>
        <h3 :class="$style.emptyTitle">아직 사용 기록이 없습니다</h3>
        <p :class="$style.emptyDescription">
          알림장을 작성하고 '📱 알림장 띄우기' 기능을 사용해보세요!<br>
          사용 기록이 쌓이면 여기에 통계가 표시됩니다.
        </p>
        <RouterLink to="/" :class="$style.emptyButton">
          알림장 작성하러 가기
        </RouterLink>
      </div>

      <!-- 통계 데이터 표시 -->
      <template v-else>
        <!-- 통계 요약 카드 -->
        <section :class="$style.statsGrid">
          <BaseCard 
            v-for="stat in statCards" 
            :key="stat.label"
            :class="$style.statCard"
            hover
          >
            <h3 :class="$style.statTitle">{{ stat.icon }} {{ stat.label }}</h3>
            <div :class="[$style.statNumber, $style[stat.colorClass]]">{{ stat.value }}</div>
            <div :class="$style.statLabel">{{ stat.description }}</div>
          </BaseCard>
        </section>

        <!-- 카테고리별 사용 통계 -->
        <section :class="$style.categorySection" v-if="categoryUsage.length">
          <BaseCard :class="$style.categoryCard">
            <div :class="$style.cardHeader">
              <h2 :class="$style.sectionTitle">
                📈 카테고리별 문구 다양성
              </h2>
              <p :class="$style.sectionSubtitle">각 영역에서 사용해본 문구 종류를 확인하세요 (문구는 여러 영역에 중복 포함될 수 있습니다)</p>
            </div>
            
            <div :class="$style.categoryStats">
              <div 
                v-for="category in categoryUsage" 
                :key="category.key"
                :class="$style.categoryItem" 
                @click="showCategoryDetail(category)"
              >
                <div :class="$style.categoryName">{{ category.name }}</div>
                <div :class="$style.categoryCount">{{ category.count }}</div>
                <div :class="$style.categoryPercentage">{{ category.percentage }}%</div>
                <div :class="$style.progressBar">
                  <div 
                    :class="$style.progressFill" 
                    :style="{ width: `${category.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </BaseCard>
        </section>

        <!-- 최근 활동 내역 -->
        <section :class="$style.activitySection" v-if="recentActivities.length">
          <BaseCard :class="$style.activityCard">
            <h2 :class="$style.sectionTitle">🕒 최근 활동 내역</h2>
            
            <div :class="$style.activityList">
              <div 
                v-for="activity in recentActivities" 
                :key="activity.id"
                :class="$style.activityItem"
              >
                <div :class="[$style.activityIcon, $style[activity.type]]">
                  {{ getActivityIcon(activity.type) }}
                </div>
                <div :class="$style.activityContent">
                  <div :class="$style.activityTitle">{{ activity.title }}</div>
                  <div :class="$style.activityDescription">{{ activity.description }}</div>
                </div>
                <div :class="$style.activityTime">{{ formatTime(activity.timestamp) }}</div>
              </div>
            </div>
          </BaseCard>
        </section>

        <!-- 추천 섹션 -->
        <section :class="$style.recommendationsSection" v-if="usageHistory.length > 0">
          <BaseCard :class="$style.recommendationsCard">
            <div :class="$style.recommendationTitle">🎯 소통 패턴 분석 & 인사이트</div>
            <ul :class="$style.recommendationList">
              <li v-if="categoryStats.length === 1">
                {{ categoryStats[0].category }} 영역만 사용하고 계시네요. 다른 영역도 활용해보세요!
              </li>
              <li v-if="new Set(usageHistory.map(item => item.notice_id)).size < 5">
                더 다양한 종류의 문구를 시도해보세요. 새로운 표현 방식을 발견할 수 있습니다.
              </li>
              <li v-if="new Set(usageHistory.map(item => item.notice_id)).size >= 10">
                다양한 문구를 활용하며 풍부한 소통을 하고 계시네요! 👏
              </li>
              <li v-if="new Set(usageHistory.map(item => item.notice_id)).size > 0 && (usageHistory.length / new Set(usageHistory.map(item => item.notice_id)).size) >= 3">
                자주 사용하는 문구들이 있으시네요. 반복 사용으로 일관성 있는 소통을 하고 계십니다.
              </li>
              <li v-if="categoryStats.length >= 5">
                {{ categoryStats.length }}개 영역을 고르게 활용하고 계시네요. 균형 잡힌 소통 스타일입니다!
              </li>
            </ul>
          </BaseCard>
        </section>
      </template>
    </div>
    
    <!-- 카테고리 상세 모달 -->
    <div v-if="showModal" :class="$style.modal" @click="closeModal">
      <div :class="$style.modalContent" @click.stop>
        <div :class="$style.modalHeader">
          <h3 :class="$style.modalTitle">{{ selectedCategory?.name }} 사용 내역</h3>
          <button :class="$style.closeBtn" @click="closeModal">&times;</button>
        </div>
        
        <div :class="$style.categorySummary">
          <h3>{{ selectedCategory?.name }}</h3>
          <p>{{ selectedCategory?.description }}</p>
        </div>

        <!-- 서브태그별 통계 -->
        <div v-if="selectedCategorySubTags.length > 0" :class="$style.subTagSection">
          <h4 :class="$style.subTagTitle">🏷️ 세부 영역별 활용 현황</h4>
          <div :class="$style.subTagList">
            <div 
              v-for="subTag in selectedCategorySubTags" 
              :key="subTag.subTag"
              :class="$style.subTagItem"
            >
              <div :class="$style.subTagName">{{ subTag.subTag }}</div>
              <div :class="$style.subTagCount">{{ subTag.usageCount }}회</div>
            </div>
          </div>
        </div>

        <div :class="$style.noticeList">
          <h4 :class="$style.noticeListTitle">📋 사용한 문구 목록</h4>
          <div 
            v-for="notice in selectedCategory?.notices" 
            :key="notice.id"
            :class="$style.noticeItem"
          >
            <div :class="$style.noticeHeader">
              <h4 :class="$style.noticeTitle">{{ notice.title || '알림장 문구' }}</h4>
              <div :class="$style.noticeMetaInfo">
                <span :class="$style.noticeDate">사용일: {{ formatDate(notice.used_at) }}</span>
                <span :class="$style.noticeUsage">{{ notice.usage }}회</span>
              </div>
            </div>
            <div :class="$style.noticeContent">{{ notice.content }}</div>
            <div v-if="notice.subItems && notice.subItems.length" :class="$style.noticeSubItems">
              <ul :class="$style.subItemsList">
                <li v-for="(subItem, index) in notice.subItems" :key="index" :class="$style.subItem">
                  {{ subItem }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { UserUsageService } from '@/services/userUsageService'

// 반응형 상태
const showModal = ref(false)
const selectedCategory = ref<CategoryData | null>(null)
const isLoading = ref(true)
const usageHistory = ref<any[]>([])
const categoryStats = ref<any[]>([])
const subTagStats = ref<any[]>([])

// 서브태그 통계 (선택된 카테고리)
const selectedCategorySubTags = computed(() => {
  if (!selectedCategory.value) return []
  
  return subTagStats.value.filter(subTag => 
    subTag.category === selectedCategory.value?.name
  )
})

// 타입 정의
interface CategoryData {
  key: string
  name: string
  count: number
  percentage: number
  color: string
  description: string
  notices: NoticeData[]
}

interface NoticeData {
  id: string
  title?: string
  content: string
  used_at: string
  usage: number
  subItems?: string[]
}



// 데이터 로드
onMounted(async () => {
  try {
    isLoading.value = true
    // 실제 사용자 데이터 로드
    const [historyData, categoryData, subTagData] = await Promise.all([
      UserUsageService.getUserUsageHistory(),
      UserUsageService.getUserCategoryStats(),
      UserUsageService.getSubTagStatistics()
    ])
    
    usageHistory.value = historyData
    categoryStats.value = categoryData
    subTagStats.value = subTagData
    
    console.log('통계 데이터 로드 완료:', { 
      usageHistory: usageHistory.value.length, 
      categoryStats: categoryStats.value.length,
      subTagStats: subTagStats.value.length
    })
  } catch (error) {
    console.error('통계 데이터 로드 실패:', error)
  } finally {
    isLoading.value = false
  }
})

// 통계 카드 데이터 - 고유 문구 기준
const statCards = computed(() => {
  const totalUsedCount = usageHistory.value.length // 총 활용 횟수
  const uniqueNotices = new Set(usageHistory.value.map(item => item.notice_id)).size // 고유 문구 수
  const last30DaysUnique = new Set(
    usageHistory.value.filter(item => {
      const usedDate = new Date(item.used_at)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return usedDate >= thirtyDaysAgo
    }).map(item => item.notice_id)
  ).size
  
  // 평균 재사용률 계산 (총 사용 횟수 / 고유 문구 수)
  const avgReuseRate = uniqueNotices > 0 ? Math.round((totalUsedCount / uniqueNotices) * 10) / 10 : 0

  return [
    {
      icon: '📝',
      value: uniqueNotices,
      label: '사용해본 문구',
      description: '서로 다른 고유 문구',
      colorClass: 'primary'
    },
    {
      icon: '�',
      value: `${avgReuseRate}회`,
      label: '평균 재사용률',
      description: '문구당 평균 활용',
      colorClass: 'success'
    },
    {
      icon: '📅',
      value: last30DaysUnique,
      label: '최근 30일 문구',
      description: '새로 사용한 종류',
      colorClass: 'warning'
    },
    {
      icon: '📊',
      value: totalUsedCount,
      label: '총 활용 횟수',
      description: '전체 사용 빈도',
      colorClass: 'info'
    }
  ]
})

// 카테고리별 사용 현황 - 고유 문구 기준
const categoryUsage = computed(() => {
  if (!categoryStats.value.length) return []
  
  const totalUsage = categoryStats.value.reduce((sum, cat) => sum + cat.usage_count, 0)
  
  return categoryStats.value.map(stat => {
    const percentage = totalUsage > 0 ? (stat.usage_count / totalUsage * 100) : 0
    
    return {
      key: stat.category,
      name: stat.category,
      count: stat.usage_count,
      percentage: Math.round(percentage * 10) / 10,
      color: getCategoryColor(stat.category),
      description: `${stat.category} 영역에서 ${stat.usage_count}종류의 문구를 사용하셨습니다`,
      notices: stat.notices || []
    }
  }).sort((a, b) => b.count - a.count)
})

// 최근 활동 데이터 - 실제 데이터 기반
const recentActivities = computed(() => {
  return usageHistory.value
    .sort((a, b) => new Date(b.used_at).getTime() - new Date(a.used_at).getTime())
    .slice(0, 10)
    .map(item => ({
      id: item.id,
      type: 'copy' as const,
      title: '알림장 문구 사용',
      description: `"${item.notices?.content?.substring(0, 30) || '문구'}..." 를 알림장에 사용했습니다`,
      timestamp: new Date(item.used_at)
    }))
})

// 유틸리티 함수
const getCategoryColor = (categoryKey: string): string => {
  const colors: Record<string, string> = {
    안전: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    생활지도: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
    학습: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    건강: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    행사: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    알림: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    상담: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    칭찬: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    주의: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    default: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  }
  return colors[categoryKey] || colors.default
}

// 메서드
const showCategoryDetail = (category: CategoryData) => {
  // console.log('🔍 [StatsView] 선택된 카테고리:', category)
  // console.log('🔍 [StatsView] 카테고리의 notices:', category.notices)
  // category.notices?.forEach((notice, index) => {
  //   console.log(`🔍 [StatsView] Notice ${index}:`, {
  //     id: notice.id,
  //     title: notice.title,
  //     content: notice.content?.substring(0, 30) + '...',
  //     subItems: notice.subItems,
  //     subItemsLength: notice.subItems?.length || 0
  //   })
  // })
  selectedCategory.value = category
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedCategory.value = null
}

const getActivityIcon = (type: string) => {
  const icons = {
    copy: '📝',
    save: '💾',
    share: '🌐'
  }
  return icons[type as keyof typeof icons] || '�'
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes}분 전`
  } else if (hours < 24) {
    return `${hours}시간 전`
  } else if (days === 1) {
    return '1일 전'
  } else if (days < 7) {
    return `${days}일 전`
  } else {
    return '1주일 전'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

</script>

<style module>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* 로딩 및 빈 상태 */
.loading {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loadingSpinner {
  font-size: 48px;
  margin-bottom: 16px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.emptyState {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.emptyIcon {
  font-size: 64px;
  margin-bottom: 16px;
}

.emptyTitle {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.emptyDescription {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.emptyButton {
  display: inline-block;
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.emptyButton:hover {
  background: #2563eb;
}

/* 통계 카드 */
.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.statCard {
  padding: 20px;
  transition: transform 0.2s ease;
  border-radius: 12px;
}

.statCard:hover {
  transform: translateY(-2px);
}

.statTitle {
  color: #1f2937;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
}

.statNumber {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
  line-height: 1;
}

.statNumber.primary {
  color: #3b82f6;
}

.statNumber.success {
  color: #10b981;
}

.statNumber.warning {
  color: #f59e0b;
}

.statNumber.danger {
  color: #ef4444;
}

.statNumber.info {
  color: #8b5cf6;
}

.statLabel {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

/* 카테고리 섹션 */
.categorySection {
  width: 100%;
}

.categoryCard {
  padding: 25px;
  border-radius: 12px;
}

.cardHeader {
  margin-bottom: 20px;
}

.sectionTitle {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.sectionSubtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.categoryStats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.categoryItem {
  padding: 16px;
  border: 2px solid #f1f5f9;
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  background: white;
}

.categoryItem:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.categoryName {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  font-size: 14px;
}

.categoryCount {
  font-size: 24px;
  font-weight: bold;
  color: #3b82f6;
  margin-bottom: 4px;
}

.categoryPercentage {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.progressBar {
  background: #f1f5f9;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}

.progressFill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
  border-radius: 3px;
}

/* 활동 섹션 */
.activitySection {
  width: 100%;
}

.activityCard {
  padding: 25px;
  border-radius: 12px;
}

.activityList {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.activityItem {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}

.activityItem:last-child {
  border-bottom: none;
}

.activityItem:hover {
  background: #f8fafc;
  border-radius: 8px;
  margin: 0 -8px;
  padding: 16px 8px;
}

.activityIcon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 16px;
  flex-shrink: 0;
}

.activityIcon.copy {
  background: #dbeafe;
  color: #3b82f6;
}

.activityIcon.save {
  background: #d1fae5;
  color: #10b981;
}

.activityIcon.share {
  background: #fef3c7;
  color: #f59e0b;
}

.activityContent {
  flex: 1;
  min-width: 0;
}

.activityTitle {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  font-size: 14px;
}

.activityDescription {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
}

.activityTime {
  color: #9ca3af;
  font-size: 12px;
  flex-shrink: 0;
  margin-left: 12px;
}

/* 추천 섹션 */
.recommendationsSection {
  width: 100%;
}

.recommendationsCard {
  padding: 25px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.recommendationTitle {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}

.recommendationList {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendationList li {
  margin-bottom: 12px;
  padding-left: 24px;
  position: relative;
  line-height: 1.5;
}

.recommendationList li:last-child {
  margin-bottom: 0;
}

.recommendationList li:before {
  content: '💡';
  position: absolute;
  left: 0;
  top: 0;
}

/* 모달 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modalContent {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.modalTitle {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.closeBtn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.closeBtn:hover {
  color: #1f2937;
  background: #f3f4f6;
}

.categorySummary {
  background: #3b82f6;
  color: white;
  padding: 20px 24px;
  margin: 0;
}

.categorySummary h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.categorySummary p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.noticeList {
  padding: 24px;
}

.noticeItem {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.noticeItem:last-child {
  margin-bottom: 0;
}

.noticeItem:hover {
  border-color: #4f46e5;
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
}

.noticeHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
}

.noticeTitle {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.noticeContent {
  color: #4b5563;
  line-height: 1.6;
  font-size: 14px;
  margin: 0;
  white-space: pre-wrap;
}

.noticeSubItems {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}


.subItemsList {
  list-style: none;
  padding: 0;
  margin: 0;
}

.subItem {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 4px;
  padding-left: 16px;
  position: relative;
}

.subItem:before {
  content: '•';
  color: #3b82f6;
  position: absolute;
  left: 0;
  top: 0;
}

.subItem:last-child {
  margin-bottom: 0;
}

.noticeMetaInfo {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.noticeDate {
  color: #6b7280;
  font-size: 12px;
}

.noticeUsage {
  background: #4f46e5;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

/* 반응형 */
@media (max-width: 1024px) {
  .statsGrid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  
  .categoryStats {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
    gap: 24px;
  }
  
  .statsGrid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .categoryStats {
    grid-template-columns: 1fr;
  }
  
  .statCard,
  .categoryCard,
  .activityCard,
  .recommendationsCard {
    padding: 20px;
  }
  
  .modalContent {
    margin: 20px;
    max-height: calc(100vh - 40px);
  }
  
  .modalHeader {
    padding: 20px 20px 12px;
  }
  
  .categorySummary {
    padding: 16px 20px;
  }
  
  .noticeList {
    padding: 20px;
  }
  
  .activityItem {
    padding: 12px 0;
  }
  
  .activityTime {
    display: none;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 12px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .statNumber {
    font-size: 28px;
  }
  
  .sectionTitle {
    font-size: 18px;
  }
}

/* 서브태그 스타일 */
.subTagSection {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.subTagTitle {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.subTagList {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subTagItem {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  font-size: 13px;
}

.subTagName {
  color: #4b5563;
  font-weight: 500;
}

.subTagCount {
  color: #6b7280;
  font-size: 12px;
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 8px;
}

.noticeListTitle {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  padding: 0 20px;
}
</style>
