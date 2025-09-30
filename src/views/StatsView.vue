<template>
  <AppLayout>
    <div :class="$style.dashboard">
      <!-- 헤더 섹션 -->
      <header :class="$style.header">
  <h1 :class="$style.title">📊 내 알뭐 사용 분석</h1>
  <p :class="$style.subtitle">알뭐 사용 패턴과 활동 내역을 확인해보세요</p>
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
          알뭐를 작성하고 '📱 알뭐 띄우기' 기능을 사용해보세요!<br>
          사용 기록이 쌓이면 여기에 통계가 표시됩니다.
        </p>
        <RouterLink to="/" :class="$style.emptyButton">
          알뭐 작성하러 가기
        </RouterLink>
      </div>

      <div v-else>
        <!-- 통계 요약 카드 -->
        <section :class="$style.statsGrid">
          <BaseCard
            v-for="stat in statCards"
            :key="stat.label"
            :class="$style.statCard"
          >
            <div :class="$style.statTitle">
              <span style="margin-right: 8px;">{{ stat.icon }}</span>
              <span>{{ stat.label }}</span>
            </div>
            <div :class="[$style.statNumber, $style[stat.colorClass]]">{{ stat.value }}</div>
            <p :class="$style.statLabel">{{ stat.description }}</p>
          </BaseCard>
        </section>

        <!-- 카테고리별 사용 현황 -->
        <section :class="$style.categorySection">
          <BaseCard :class="$style.categoryCard">
            <div :class="$style.cardHeader">
              <h2 :class="$style.sectionTitle">
                🎨 영역별 활용 현황
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

        <!-- 날짜별 사용내역 섹션 -->
        <section :class="$style.dateUsageSection">
          <BaseCard :class="$style.dateUsageCard">
            <h2 :class="$style.sectionTitle">🗓️ 날짜별 사용내역</h2>
            <div :class="$style.dateUsageList">
              <div v-for="group in recentActivities" :key="group.date" :class="$style.dateUsageItem">
                <div :class="$style.dateInfo">
                  <span :class="$style.date">{{ group.date }}</span>
                  <span :class="$style.count">{{ group.activities.length }}회</span>
                  <span :class="$style.representative">
                    {{
                      (() => {
                        const titles = group.activities.map(a => a.title).filter(Boolean);
                        const joined = titles.join(', ');
                        return joined.length > 60 ? joined.slice(0, 60) + '...' : joined || '문구';
                      })()
                    }}
                  </span>
                </div>
                <button :class="$style.detailBtn" @click="showDateDetail(group)">상세보기</button>
              </div>
            </div>
          </BaseCard>
        </section>
      </div>
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
              <h4 :class="$style.noticeTitle">{{ notice.title || notice.content || '알뭐 문구' }}</h4>
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
      <!-- 날짜별 활동 상세 모달 -->
      <div v-if="showDateModal" :class="$style.modal" @click="closeDateModal">
        <div :class="$style.modalContent" @click.stop>
          <div :class="$style.modalHeader">
            <h3 :class="$style.modalTitle">{{ selectedDate }} 활동 내역</h3>
            <button :class="$style.closeBtn" @click="closeDateModal">&times;</button>
          </div>
          <div :class="$style.noticeList">
            <h4 :class="$style.noticeListTitle">📋 사용한 문구 목록</h4>
            <div v-if="selectedDatePhrases.length === 0" style="color:#6b7280; padding:16px;">해당 날짜에 사용된 문구가 없습니다.</div>
            <div v-for="phrase in selectedDatePhrases" :key="phrase.id" :class="$style.noticeItem">
              <div :class="$style.noticeHeader">
                <h4 :class="$style.noticeTitle">{{ phrase.notices.title || '알뭐 문구' }}</h4>
                <div :class="$style.noticeMetaInfo">
                  <span :class="$style.noticeDate">사용일:{{  }} {{ formatDate(phrase.used_at) }}</span>
                </div>
              </div>
              <div :class="$style.noticeContent">{{ phrase.notices.sub_tags }}</div>
             <div v-if="phrase.notices.tags && phrase.notices.tags.length" style="margin:8px 0 0 0;">
                <span v-for="tag in phrase.notices.tags" :key="tag" style="display:inline-block; background:#eff6ff; color:#2563eb; font-size:12px; font-weight:500; border-radius:8px; padding:2px 10px; margin-right:6px;">#{{ tag }}</span>
              </div>

              <div v-if="phrase.notices.sub_tags && phrase.notices.sub_tags.length" style="margin:4px 0 0 0;">
                <span v-for="subTag in phrase.snotices.sub_tags" :key="subTag" style="display:inline-block; background:#f3f4f6; color:#6b7280; font-size:12px; border-radius:8px; padding:2px 8px; margin-right:4px;">#{{ subTag }}</span>
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
import { getCategoryGradient } from '@/constants/categories'
import { watch } from 'vue'

// 반응형 상태
const showModal = ref(false)
const selectedCategory = ref<CategoryData | null>(null)
const isLoading = ref(true)
const usageHistory = ref<any[]>([])
const categoryStats = ref<any[]>([])
const subTagStats = ref<any[]>([])
// 날짜별 활동 모달 상태
const showDateModal = ref(false)
const selectedDate = ref('')
const selectedDatePhrases = ref<any[]>([])

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
      UserUsageService.getTagStatistics()
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

// 날짜별 활동 상세 모달 열기
const showDateDetail = (group: { date: string, activities: any[] }) => {
  selectedDate.value = group.date
  // Find all phrases used on this date
  selectedDatePhrases.value = usageHistory.value.filter(item => formatDate(item.used_at) === group.date)
  showDateModal.value = true
}

const closeDateModal = () => {
  showDateModal.value = false
  selectedDate.value = ''
  selectedDatePhrases.value = []
}

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
      icon: '🔁',
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

// 최근 활동 데이터 - 날짜별 그룹화
const recentActivities = computed(() => {
  // 날짜별 그룹화
  const grouped: Record<string, any[]> = {};
  usageHistory.value
    .sort((a, b) => new Date(b.used_at).getTime() - new Date(a.used_at).getTime())
    .forEach(item => {
      const dateKey = formatDate(item.used_at);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push({
        id: item.id,
        type: 'copy' as const,
        title: item.notices?.title || item.notices?.content || item.title || item.content || '문구',
        description: `"${item.notices?.content?.substring(0, 30) || item.content?.substring(0, 30) || '문구'}..." 를 알뭐에 사용했습니다`,
        timestamp: new Date(item.used_at)
      });
    });
  // [{ date: '2025. 9. 28.', activities: [...] }, ...]
  return Object.entries(grouped).map(([date, activities]) => ({ date, activities }));
})

// 카테고리 색상/그라디언트는 categories.ts에서 참조
const getCategoryColor = (categoryKey: string): string => {
  return getCategoryGradient(categoryKey as any)
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
 @import './StatsView.css'

</style>