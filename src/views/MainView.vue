<template>
  <!-- 검색 이벤트 임시 비활성화 -->
  <AppLayout @edit-click="goToEdit">


    <!-- 🔥 추천 섹션 -->
    <section class="recommendations-section scroll-target" id="recommendations">
      <div class="recommendations-header">
        <div class="recommendations-title">
          <span>🔥</span>
          맞춤 추천 문구
        </div>
        <div class="recommendations-controls">
          <button class="refresh-btn" @click="refreshRecommendations">
            🔄 새로고침
          </button>
          <button 
            class="collapse-btn" 
            :class="{ collapsed: isRecommendationsCollapsed }"
            @click="toggleRecommendations"
          >
            ▼
          </button>
        </div>
      </div>
      
      <div 
        class="recommendations-content" 
        :class="{ collapsed: isRecommendationsCollapsed }"
      >
        <!-- 추천 액션 바 -->
        <div class="recommendation-actions">
          <div class="quick-filters">
            <div 
              class="filter-chip" 
              :class="{ active: selectedRecommendationFilter === '전체' }"
              @click="setRecommendationFilter('전체')"
            >
              전체
            </div>
            <div 
              class="filter-chip" 
              :class="{ active: selectedRecommendationFilter === '날씨' }"
              @click="setRecommendationFilter('날씨')"
            >
              날씨
            </div>
            <div 
              class="filter-chip" 
              :class="{ active: selectedRecommendationFilter === '개인화' }"
              @click="setRecommendationFilter('개인화')"
            >
              개인화
            </div>
            <div 
              class="filter-chip" 
              :class="{ active: selectedRecommendationFilter === '새 카테고리' }"
              @click="setRecommendationFilter('새 카테고리')"
            >
              새 카테고리
            </div>
          </div>
          <div class="navigation-buttons">
            <button class="nav-btn secondary" @click="scrollToAllNotices">
              📚 모든 문구 보러가기
            </button>
            <button class="nav-btn primary" @click="addNewNotice">
              + 새 문구 추가
            </button>
          </div>
        </div>

        <!-- 추천 문구 그리드 -->
        <div class="all-notices-grid">
          <!-- 날씨 기반 추천 문구들 -->
          <NoticeCard
            v-for="notice in filteredWeatherRecommendations"
            :key="notice.id"
            :title="notice.title"
            :content="notice.content"
            :tags="notice.tags"
            :sub-tags="notice.subTags"
            :author="notice.author"
            :like-count="notice.likeCount"
            :sub-items="notice.subItems"
            :created-at="notice.createdAt"
            :is-selected="selectedNotices.some(n => n.id === notice.id)"
            :is-selecting-mode="selectedNotices.length > 0"
            :show-footer="true"
            @copy="handleCopy(notice)"
            @save="handleSave(notice)"
            @click="()=>toggleSelection(notice)"
          />
          
          <!-- 카테고리 기반 추천 문구들 -->
          <NoticeCard
            v-for="notice in filteredCategoryRecommendations"
            :key="notice.id"
            :title="notice.title"
            :content="notice.content"
            :tags="notice.tags"
            :sub-tags="notice.subTags"
            :author="notice.author"
            :like-count="notice.likeCount"
            :sub-items="notice.subItems"
            :created-at="notice.createdAt"
            :is-selected="selectedNotices.some(n => n.id === notice.id)"
            :is-selecting-mode="selectedNotices.length > 0"
            :show-footer="true"
            @copy="handleCopy(notice)"
            @save="handleSave(notice)"
            @click="()=>toggleSelection(notice)"
            :is-used="usedNoticeIds.includes(notice.id)"
          />
          
          <!-- 일반 추천 문구들 (사용량/인기 기반) -->
          <NoticeCard
            v-for="notice in filteredGeneralRecommendations"
            :key="notice.id"
            :title="notice.title"
            :content="notice.content"
            :tags="notice.tags"
            :sub-tags="notice.subTags"
            :author="notice.author"
            :like-count="notice.likeCount"
            :sub-items="notice.subItems"
            :created-at="notice.createdAt"
            :is-recommended="false"
            :is-selected="selectedNotices.some(n => n.id === notice.id)"
            :is-selecting-mode="selectedNotices.length > 0"
            :show-footer="true"
            @copy="handleCopy(notice)"
            @save="handleSave(notice)"
            @click="()=>toggleSelection(notice)"
            :is-used="usedNoticeIds.includes(notice.id)"
          />
        </div>
      </div>
    </section>

    <!-- Filter Bar -->
    <!-- 📚 전체 문구 섹션 -->
    <section class="all-notices-section scroll-target" id="all-notices">
      <div class="all-notices-header">
        <div class="section-title-bar">
          <div class="section-title">
            <h2>
              📚 전체 문구 탐색
              <span class="result-count">총 {{ filteredNotices.length }}개 문구</span>
            </h2>
          </div>
          <div class="search-controls">
            <!-- 검색 기능은 현재 비활성화 상태 -->
            <!-- <input type="text" class="search-input" placeholder="문구 검색...">
            <button class="search-btn">🔍 검색</button> -->
          </div>
        </div>
        
        <!-- 필터 컨트롤 -->
        <div class="filter-controls">
          <div class="category-filters">
            <CategoryTag 
              category="전체" 
              :clickable="true"
              :active="selectedCategory === '전체'"
              @click="setCategory('전체')"
              class="category-tag"
            />
            <CategoryTag 
              v-for="category in categories"
              :key="category"
              :category="category"
              :clickable="true"
              :active="selectedCategory === category"
              @click="setCategory"
              class="category-tag"
            />
          </div>
          
          <div class="filter-options">
            <select v-model="sortBy" class="sort-select">
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="usage">사용량순</option>
            </select>
            
            <label class="exclude-recommended">
              <input type="checkbox" v-model="excludeRecommended">
              추천 문구 제외
            </label>
          </div>
        </div>
      </div>

      <div class="all-notices-content">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-section">
          <div class="loading-spinner">🔄</div>
          <p>문구 데이터를 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="loadError" class="error-section">
          <div class="error-icon">⚠️</div>
          <p>{{ loadError }}</p>
          <BaseButton variant="outline" @click="loadAllData">
            다시 시도
          </BaseButton>
        </div>

        <!-- 전체 문구 그리드 -->
        <div v-else class="all-notices-grid">
          <NoticeCard
            v-for="notice in finalFilteredNotices"
            :key="notice.id"
            :title="notice.title"
            :content="notice.content"
            :tags="notice.tags"
            :sub-tags="notice.subTags"
            :author="notice.author"
            :like-count="notice.likeCount"
            :sub-items="notice.subItems"
            :created-at="notice.createdAt"
            :is-selected="selectedNotices.some(n => n.id === notice.id)"
            :is-selecting-mode="selectedNotices.length > 0"
            :show-footer="true"
            :is-used="usedNoticeIds.includes(notice.id)"
            @copy="handleCopy(notice)"
            @save="handleSave(notice)"
            @click="()=>toggleSelection(notice)"
          />
        </div>

        <!-- Load More Button -->
        <div v-if="hasMoreNotices && !isLoading" class="load-more-section">
          <BaseButton 
            variant="secondary" 
            :loading="loadingMore"
            @click="loadMoreNotices"
            class="load-more-btn"
          >
            더 많은 문구 보기
          </BaseButton>
          <!-- 디버깅 정보 -->
          <div class="load-progress">
            현재: {{ allBlocks.length }}개 / 전체: {{ totalBlocksCount }}개
          </div>
        </div>
      </div>
    </section>    <!-- Content Grid - 전체 문구 목록 -->
   

    <!-- Selected Notice Panel -->
    <SelectedNoticePanel
      :notices="selectedNotices"
      :show="selectedNotices.length > 0"
      @close="closeSelectedPanel"
      @clear="clearAllSelections"
      @copy-all="copyAllToClipboard"
      @use-in-editor="useAllInEditor"
      @preview="openSelectedNoticesPreview"
      @remove="removeSelection"
      @reorder="handleReorder"
    />

    <!-- FullScreen Preview -->
        <FullScreenNoticePreview
      v-if="showFullScreenPreview"
      :notices="selectedNotices"
      @close="closeFullScreenPreview"
    />
  </AppLayout>
</template>

<script setup lang="ts">  
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import BaseButton from '../components/common/BaseButton.vue'
import CategoryTag from '../components/common/CategoryTag.vue'
import NoticeCard from '../components/common/NoticeCard.vue'
import SelectedNoticeCard from '../components/common/SelectedNoticeCard.vue'
import SelectedNoticePanel from '../components/common/SelectedNoticePanel.vue'
import FullScreenNoticePreview from '../components/common/FullScreenNoticePreview.vue'
import RecentNoticesTicker from '../components/RecentNoticesTicker.vue'
import { 
  categories, 
  type Notice, 
  type Category 
} from '../data/notices'
// import { AIServiceSimplified } from '../services/aiServiceSimplified'
// Services are now dynamically imported to prevent circular dependencies
import { useAuthStore } from '../stores/auth'
import { getSupabaseUrl, getSupabaseAnonKey } from '../config/environment'
import { UserUsageService } from '../services/userUsageService'

const router = useRouter()
const authStore = useAuthStore()

// 기존 상태 관리
const selectedCategory = ref<Category | '전체'>('전체')
const sortBy = ref<'latest' | 'popular' | 'usage'>('latest')
// 검색 기능 임시 비활성화
// const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 6
const loadingMore = ref(false)

// 새로운 상태 관리 - 다중 선택
const selectedNotices = ref<Notice[]>([])
const currentSet = ref(1)
const totalSets = 3

// 알림장 띄우기 상태
const showFullScreenPreview = ref(false)

// 추천 섹션 상태
const isRecommendationsCollapsed = ref(false)
const selectedRecommendationFilter = ref<'전체' | '날씨' | '개인화' | '새 카테고리'>('전체')

// 전체 문구 섹션 상태
const excludeRecommended = ref(false)

// 추천 문구 관련 상태
const weatherRecommendedNotices = ref<Notice[]>([])
const categoryRecommendedNotices = ref<Notice[]>([])

// 실제 데이터 상태
const allBlocks = ref<any[]>([])
const recommendedBlocks = ref<any[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const totalBlocksCount = ref<number>(0) // 전체 블록 수 추가

//언마운트 변수
let isUnmounted = false

// 사용한 문구 표시 관련 변수
const usedNoticeIds = ref<string[]>([])

const loadUsedNoticeIds = async () => {
  try {
    usedNoticeIds.value = await UserUsageService.getUserUsedNoticeIds()
  } catch (e) {
    usedNoticeIds.value = []
  }
}

const filteredRecommendedNotices = computed(() => {
  // 날씨 기반 추천 문구와 기존 추천 문구를 합쳐서 반환
  const allRecommended = [
    ...weatherRecommendedNotices.value, 
    ...categoryRecommendedNotices.value,
    ...(recommendedBlocks.value as Notice[])
  ]
  
  if (selectedCategory.value === '전체') {
    return allRecommended
  }
  return allRecommended.filter(notice =>
    notice.tags.includes(selectedCategory.value as Category)
  )
})

// 추천 필터링을 위한 computed 속성들
const filteredWeatherRecommendations = computed(() => {
  if (selectedRecommendationFilter.value === '전체' || selectedRecommendationFilter.value === '날씨') {
    return weatherRecommendedNotices.value.slice(0, 4)
  }
  return []
})

const filteredCategoryRecommendations = computed(() => {
  if (selectedRecommendationFilter.value === '전체' || selectedRecommendationFilter.value === '새 카테고리') {
    return categoryRecommendedNotices.value.slice(0, 2)
  }
  return []
})

const filteredGeneralRecommendations = computed(() => {
  if (selectedRecommendationFilter.value === '전체' || selectedRecommendationFilter.value === '개인화') {
    return (recommendedBlocks.value as Notice[]).filter((n: Notice) => 
      !weatherRecommendedNotices.value.some((weather: Notice) => weather.id === n.id) &&
      !categoryRecommendedNotices.value.some((category: Notice) => category.id === n.id)
    ).slice(0, 4)
  }
  return []
})

// 전체 문구 섹션용 필터링된 문구
const finalFilteredNotices = computed(() => {
  let notices = filteredNotices.value
  
  // 추천 문구 제외 옵션이 활성화된 경우 또는 기본적으로 추천 문구 중복 제거
  const allRecommendedIds = [
    ...weatherRecommendedNotices.value.map(n => n.id),
    ...categoryRecommendedNotices.value.map(n => n.id),
    ...(recommendedBlocks.value as Notice[]).map(n => n.id)
  ]
  
  // 추천 문구 제외 체크박스 상태에 관계없이 기본적으로 중복 제거
  // 단, 체크박스가 선택된 경우 추가적으로 명시적으로 제외
  if (excludeRecommended.value || true) { // 항상 중복 제거
    notices = notices.filter(notice => !allRecommendedIds.includes(notice.id))
  }
  
  return notices
})

// 추천 문구 표시 개수

const filteredNotices = computed(() => {
  let notices = allBlocks.value as Notice[]
  
  // 카테고리 필터링
  if (selectedCategory.value !== '전체') {
    notices = notices.filter(notice => 
      notice.tags.includes(selectedCategory.value as Category)
    )
  }
  
  // 검색어 필터링 - 임시 비활성화
  /*
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    notices = notices.filter(notice =>
      notice.title.toLowerCase().includes(query) ||
      notice.content.toLowerCase().includes(query) ||
      notice.tags.some((tag: string) => tag.includes(query))
    )
  }
  */
  
  // 정렬
  notices.sort((a, b) => {
    switch (sortBy.value) {
      case 'popular':
        return b.likeCount - a.likeCount
      case 'usage':
        return (b.usageCount || 0) - (a.usageCount || 0)
      case 'latest':
      default:
        return b.createdAt.getTime() - a.createdAt.getTime()
    }
  })
  
  return notices
})

// 페이지네이션된 문구 목록
const paginatedNotices = computed(() => {
  return filteredNotices.value.slice(0, currentPage.value * pageSize)
})

// 더 보기 버튼 표시 여부
const hasMoreNotices = computed(() => {
  const hasMore = allBlocks.value.length < totalBlocksCount.value && totalBlocksCount.value > 0
  // console.log('🔍 hasMoreNotices 계산:', {
  //   currentBlocks: allBlocks.value.length,
  //   totalCount: totalBlocksCount.value,
  //   hasMore: hasMore,
  //   isLoading: isLoading.value
  // })
  return hasMore
})



// AI 블록 여부 확인 (작성자 ID를 기반으로)
const getAuthorName = (createdBy: string): string => {
  const AI_SYSTEM_UUID = import.meta.env.VITE_AI_SYSTEM_UUID
  if (createdBy === AI_SYSTEM_UUID) {
    return '🤖 AI 생성'
  }
  return '교사' // 일반적인 표시
}

// 데이터 로딩 함수들
const loadAllBlocks = async () => {
  // console.log("loadAllBlocks")
  try {
    //전체 notices 수 먼저 조회
    const totalCount = await getTotalNoticesCount()
    totalBlocksCount.value = totalCount
      // console.log("loadAllBlocks",totalCount)

    // 동적 임포트로 NoticeService 로드
    const { NoticeService } = await import('../services/noticeService')
    
    // 실제 notices 로딩
    const notices = await NoticeService.getNotices({
      limit: 6,
      orderBy: 'created_at',
      order: 'desc'
    })
      // console.log("loadAllBlocks",notices)

    allBlocks.value = notices as any[]
    
  } catch (error) {
    console.error('📚 [Data] 전체 문구 로딩 실패:', error)
    loadError.value = '문구 데이터를 불러오는데 실패했습니다.'
  }
}

// 전체 notices 수 조회 함수
const getTotalNoticesCount = async (): Promise<number> => {
  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseAnonKey()
    
    const url = new URL(`${supabaseUrl}/rest/v1/notices`)
    url.searchParams.append('select', 'count')
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'authorization': `Bearer ${supabaseKey}`,
        'content-type': 'application/json',
        'prefer': 'count=exact'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const countHeader = response.headers.get('content-range')
    if (countHeader) {
      const match = countHeader.match(/\/(\d+)$/)
      return match ? parseInt(match[1]) : 0
    }
    
    return 0
    
  } catch (error) {
    console.error('📊 전체 블록 수 조회 실패:', error)
    return 0
  }
}

// 날씨 기반 공지사항 로딩
const loadWeatherNotices = async () => {
  try {
    // 동적 임포트로 WeatherNoticeService 로드
    const { WeatherNoticeService } = await import('../services/weatherNoticeService')
    
    // 사용자의 학교 위치 정보 확인
    const user = authStore.user as any
    if (!user || !user.school_lat || !user.school_lng) {
      console.log('🌤️📝 사용자 학교 위치 정보가 없어 날씨 공지사항을 생성하지 않습니다.',user)
      // 테스트용으로 서울 좌표 사용
      const testLat = 37.5665
      const testLng = 126.9780
      console.log('🌤️📝 테스트용 서울 좌표로 날씨 공지사항 생성')
      const weatherNotices = await WeatherNoticeService.generateWeatherNotices(testLat, testLng)
      if (weatherNotices.length > 0) {
        weatherRecommendedNotices.value = [...weatherNotices, ...weatherRecommendedNotices.value]
        console.log(`🌤️📝 테스트 날씨 기반 공지사항 ${weatherNotices.length}개 추가됨`)
      }
      return
    }
    
    console.log(`🌤️📝 학교 위치 기반 날씨 공지사항 생성: ${user.school_lat}, ${user.school_lng}`)
    
    // 날씨 기반 공지사항 생성
    const weatherNotices = await WeatherNoticeService.generateWeatherNotices(
      user.school_lat,
      user.school_lng
    )
    
    if (weatherNotices.length > 0) {
      // 날씨 기반 추천 문구에 추가
      weatherRecommendedNotices.value = [...weatherNotices, ...weatherRecommendedNotices.value]
      console.log(`🌤️📝 날씨 기반 공지사항 ${weatherNotices.length}개 추가됨`)
    }
    
  } catch (error) {
    console.error('🌤️📝 날씨 기반 공지사항 로딩 실패:', error)
  }
}

// 카테고리 기반 추천 문구 로딩
const loadCategoryRecommendations = async () => {
  try {
    console.log('🎯 카테고리 추천 문구 로딩 중...')
    
    // 동적 임포트로 CategoryRecommendationService 로드
    const { CategoryRecommendationService } = await import('../services/categoryRecommendationService')
    
    const categoryRecommendations = await CategoryRecommendationService.getRecommendations(2)
    
    if (categoryRecommendations.length > 0) {
      categoryRecommendedNotices.value = categoryRecommendations
      console.log(`🎯 카테고리 추천 문구 ${categoryRecommendations.length}개 로딩 완료`)
    } else {
      console.log('🎯 카테고리 추천 문구 없음')
    }
    
  } catch (error) {
    console.error('🎯 카테고리 추천 문구 로딩 실패:', error)
  }
}

// 추천 블록 로딩 (사용량/인기 기반)
const loadRecommendedBlocks = async () => {
  try {
    console.log('🏆 추천 문구 로딩 중...')
    
    // 동적 임포트로 NoticeService 로드
    const { NoticeService } = await import('../services/noticeService')
    
    // 사용량이 높은 문구들과 인기 문구들을 가져오기
    const [popularNotices, usageNotices] = await Promise.all([
      NoticeService.getNotices({
        limit: 3,  // 5에서 3으로 줄임
        orderBy: 'like_count',
        order: 'desc',
        weatherFilter: 'exclude'  // 날씨 문구 제외
      }),
      NoticeService.getNotices({
        limit: 3,  // 5에서 3으로 줄임
        orderBy: 'usage_count',
        order: 'desc',
        weatherFilter: 'exclude'  // 날씨 문구 제외
      })
    ])
    
    // 상위 2개씩만 추천으로 사용 (3에서 2로 줄임)
    const filteredPopular = popularNotices.slice(0, 2)
    const filteredUsage = usageNotices.slice(0, 2)

    // 중복 제거하고 합치기
    const allRecommended = [...filteredPopular, ...filteredUsage]
    const uniqueRecommended = allRecommended.filter((notice, index, self) => 
      index === self.findIndex(n => n.id === notice.id)
    )
    
    // NoticeService에서 이미 Notice 형태로 변환된 데이터를 반환하므로 변환 불필요
    recommendedBlocks.value = uniqueRecommended as Notice[]
    // console.log(`🏆 추천 문구 ${recommendedBlocks.value.length}개 로딩 완료`)
    
  } catch (error) {
    console.error('🏆 추천 문구 로딩 실패:', error)
  }
}

// 전체 데이터 로딩
const loadAllData = async () => {
  isLoading.value = true
  loadError.value = null
  
  try {
    // console.log('📚 [Data] 전체 데이터 로딩 시작...') 
    
    // 각 로딩 함수를 개별적으로 처리 (하나가 실패해도 다른 것들은 계속)
    const results = await Promise.allSettled([
      loadAllBlocks(),
      loadWeatherNotices(),
      loadCategoryRecommendations(),
      loadRecommendedBlocks()
    ])
    
    // 결과 확인
    results.forEach((result, index) => {
      const names = ['전체 블록', '날씨 공지사항', '카테고리 추천', '추천 블록']
      if (result.status === 'rejected') {
        console.error(`📚 [Data] ${names[index]} 로딩 실패:`, result.reason)
      } else {
        // console.log(`📚 [Data] ${names[index]} 로딩 성공`)
      }
    })
    
    // 모든 것이 실패한 경우에만 에러 표시
    const allFailed = results.every(result => result.status === 'rejected')
    if (allFailed) {
      loadError.value = '모든 데이터 로딩에 실패했습니다. 네트워크 연결을 확인해주세요.'
    }
    
    console.log('📚 [Data] 전체 데이터 로딩 완료')
    
  } catch (error) {
    console.error('📚 [Data] 데이터 로딩 실패:', error)
    loadError.value = '데이터를 불러오는데 실패했습니다.'
  } finally {
    if (!isUnmounted) {
      isLoading.value = false
    }
  }
}

// 기존 메서드
const setCategory = (category: Category | '전체') => {
  selectedCategory.value = category
  currentPage.value = 1
}

// 추천 섹션 관련 메서드
const refreshRecommendations = async () => {
  try {
    await Promise.allSettled([
      loadWeatherNotices(),
      loadCategoryRecommendations(),
      loadRecommendedBlocks()
    ])
    console.log('🔄 추천 문구 새로고침 완료')
  } catch (error) {
    console.error('🔄 추천 문구 새로고침 실패:', error)
  }
}

const toggleRecommendations = () => {
  isRecommendationsCollapsed.value = !isRecommendationsCollapsed.value
}

const setRecommendationFilter = (filter: '전체' | '날씨' | '개인화' | '새 카테고리') => {
  selectedRecommendationFilter.value = filter
}

const scrollToAllNotices = () => {
  const targetSection = document.getElementById('all-notices')
  if (targetSection) {
    targetSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
    
    // 스크롤 후 시각적 효과
    setTimeout(() => {
      targetSection.style.transform = 'scale(1.01)'
      targetSection.style.transition = 'transform 0.3s ease'
      setTimeout(() => {
        targetSection.style.transform = 'scale(1)'
      }, 300)
    }, 500)
  }
}

// 검색 핸들러 - 임시 비활성화
/*
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}
*/

const loadMoreNotices = async () => {
  if (loadingMore.value) return

  loadingMore.value = true
  
  try {
    console.log('📚 [Data] 추가 문구 로딩 중...')
    
    // 동적 임포트로 NoticeService 로드
    const { NoticeService } = await import('../services/noticeService')
    
    // 현재 페이지의 다음 데이터를 가져오기
    const offset = currentPage.value * pageSize
    const additionalNotices = await NoticeService.getNotices({
      limit: pageSize,
      offset: offset,
      orderBy: sortBy.value === 'latest' ? 'created_at' : 
               sortBy.value === 'popular' ? 'like_count' : 'usage_count',
      order: 'desc'
    })
    
    // 기존 데이터에 추가
    allBlocks.value = [...allBlocks.value, ...additionalNotices]
    currentPage.value += 1
    
    console.log('📚 [Data] 추가 문구 로딩 완료:', additionalNotices.length, '개')
    
  } catch (error) {
    console.error('📚 [Data] 추가 문구 로딩 실패:', error)
  } finally {
    loadingMore.value = false
  }
}

const handleCopy = (notice: Notice) => {
  // 클립보드에 복사하는 로직
  let textToCopy = notice.content
  
  textToCopy += '\n' + notice.subItems.map(item => `- ${item}`).join('\n')
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('클립보드에 복사되었습니다!')
  }).catch(() => {
    alert('복사에 실패했습니다.')
  })
}

const handleSave = (notice: Notice) => {
  alert(`"${notice.title}" 문구가 저장되었습니다!`)
}

const addNewNotice = () => {
  router.push('/edit')
}

const goToEdit = () => {
  router.push('/edit')
}



// 새로운 메서드 - 다중 선택 기능
const toggleSelection = (notice: Notice) => {
  const index = selectedNotices.value.findIndex(n => n.id === notice.id)
  
  if (index >= 0) {
    // 선택 해제
    selectedNotices.value.splice(index, 1)
  } else {
    // 선택 추가
    selectedNotices.value.push(notice)
  }
    console.log("selectedNotices",selectedNotices.value)
    console.log("notice",notice)
}

const removeSelection = (noticeId: string) => {
  const index = selectedNotices.value.findIndex(n => n.id === noticeId)
  if (index >= 0) {
    selectedNotices.value.splice(index, 1)
  }
}

const clearAllSelections = () => {
  selectedNotices.value = []
}

const closeSelectedPanel = () => {
  selectedNotices.value = []
}

// 문구 세트 변경
const changeNoticeSet = () => {
  currentSet.value = currentSet.value >= totalSets ? 1 : currentSet.value + 1
  // 실제로는 다른 데이터 세트를 로드하는 로직이 들어감
}

// 순서 변경 핸들러
const handleReorder = (fromIndex: number, toIndex: number) => {
  const draggedNotice = selectedNotices.value.splice(fromIndex, 1)[0]
  selectedNotices.value.splice(toIndex, 0, draggedNotice)
}

// 전체 복사
const copyAllToClipboard = () => {
  if (selectedNotices.value.length === 0) return
  
  const allText = selectedNotices.value.map((notice, index) => {
    let text = `${index + 1}. ${notice.content}`
    text += '\n' + notice.subItems.map(item => `   • ${item}`).join('\n')
    return text
  }).join('\n\n')
  
  navigator.clipboard.writeText(allText).then(() => {
    alert('전체 문구가 클립보드에 복사되었습니다!')
  }).catch(() => {
    alert('복사에 실패했습니다.')
  })
}

// 에디터에서 사용
const useAllInEditor = () => {
  if (selectedNotices.value.length === 0) {
    alert('편집할 문구를 먼저 선택해주세요.')
    return
  }
  
  // 선택된 문구들을 localStorage에 임시 저장
  const noticeData = selectedNotices.value.map(notice => ({
    id: notice.id,
    title: notice.title,
    content: notice.content,
    subItems: notice.subItems,
    tags: notice.tags
  }))
  
  localStorage.setItem('editingNotices', JSON.stringify(noticeData))
  
  // 편집 화면으로 이동
  router.push({ name: 'edit' })
}

// 선택된 문구들을 알림장으로 띄우기
const openSelectedNoticesPreview = async () => {
  if (selectedNotices.value.length === 0) {
    alert('띄울 문구를 먼저 선택해주세요.')
    return
  }
  
  try {
    // 알림장 띄우기 시 자동으로 사용 기록 저장
    await saveUsageRecords()
    
    showFullScreenPreview.value = true
  } catch (error) {
    console.error('사용 기록 저장 실패:', error)
    // 저장에 실패해도 알림장은 띄워줌
    showFullScreenPreview.value = true
  }
}

// 사용 기록 저장
const saveUsageRecords = async () => {
  try {
    // 동적 임포트로 UserUsageService 로드
    const { UserUsageService } = await import('../services/userUsageService')
    
    const noticeIds = selectedNotices.value.map(notice => notice.id)
    await UserUsageService.saveMultipleNoticeUsage(noticeIds)
    console.log('알림장 사용 기록이 저장되었습니다.')
  } catch (error) {
    console.error('사용 기록 저장 중 오류:', error)
  }
}

// 알림장 띄우기 닫기
const closeFullScreenPreview = () => {
  showFullScreenPreview.value = false
}

// 알림장에서 편집된 문구들 저장
const saveEditedNotices = (editedNotices: Notice[]) => {
  // 편집된 내용을 selectedNotices에 반영
  selectedNotices.value = editedNotices
  showFullScreenPreview.value = false
  
  // 성공 메시지
  alert('📝 편집된 내용이 저장되었습니다!')
}

onMounted(async () => {
  await loadUsedNoticeIds()

  // 실제 데이터 로딩
  await loadAllData()
  })

onUnmounted(() => {
  isUnmounted = true
})



</script>

<style scoped>
 @import './MainView.css'
</style>
