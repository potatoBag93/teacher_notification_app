<template>
  <AppLayout>
    <div class="component-library">
      <header class="library-header">
        <h1>🎨 컴포넌트 라이브러리</h1>
        <p>교실 소통 문구 앱에서 사용하는 컴포넌트들의 실시간 데모</p>
        <div class="library-stats">
          <span class="stat-item">📦 {{ Object.keys(components).length }}개 컴포넌트</span>
          <span class="stat-item">🏷️ {{ categories.length }}개 카테고리</span>
          <span class="stat-item">🔖 {{ allSubTags.length }}개 서브태그</span>
        </div>
      </header>

      <main class="library-content">
        <!-- BaseCard 컴포넌트 -->
        <section class="component-section">
          <h2>BaseCard</h2>
          <p>기본 카드 레이아웃 컴포넌트 - 모든 카드 UI의 기반</p>
          
          <div class="component-demo">
            <div class="demo-grid">
              <BaseCard padding="md" shadow="md">
                <h3>기본 카드</h3>
                <p>기본적인 카드 스타일입니다.</p>
              </BaseCard>
              
              <BaseCard padding="lg" shadow="lg" hover>
                <h3>호버 효과</h3>
                <p>마우스를 올리면 그림자가 진해집니다.</p>
              </BaseCard>
              
              <BaseCard padding="md" shadow="md" clickable @click="handleCardClick">
                <h3>클릭 가능</h3>
                <p>클릭할 수 있는 카드입니다.</p>
              </BaseCard>
            </div>
          </div>
        </section>

        <!-- BaseButton 컴포넌트 -->
        <section class="component-section">
          <h2>BaseButton</h2>
          <p>다양한 스타일의 버튼 컴포넌트 - 일관된 인터랙션 제공</p>
          
          <div class="component-demo">
            <div class="demo-buttons">
              <BaseButton variant="primary">Primary</BaseButton>
              <BaseButton variant="secondary">Secondary</BaseButton>
              <BaseButton variant="outline">Outline</BaseButton>
              <BaseButton variant="ghost">Ghost</BaseButton>
              <BaseButton variant="danger">Danger</BaseButton>
            </div>
            
            <div class="demo-buttons">
              <BaseButton variant="primary" size="sm">Small</BaseButton>
              <BaseButton variant="primary" size="md">Medium</BaseButton>
              <BaseButton variant="primary" size="lg">Large</BaseButton>
            </div>
            
            <div class="demo-buttons">
              <BaseButton variant="primary" :loading="loading" @click="toggleLoading">
                {{ loading ? '로딩 중...' : '로딩 테스트' }}
              </BaseButton>
              <BaseButton variant="secondary" disabled>비활성화</BaseButton>
            </div>
          </div>
        </section>

        <!-- CategoryTag 컴포넌트 -->
        <section class="component-section">
          <h2>CategoryTag</h2>
          <p>카테고리별 색상과 의미를 가진 태그 컴포넌트 - 13개 통합 카테고리 시스템</p>
          
          <div class="component-demo">
            <h4 class="demo-subtitle">📚 교육 관련 카테고리</h4>
            <div class="demo-tags">
              <CategoryTag category="학습관리" />
              <CategoryTag category="생활지도" />
              <CategoryTag category="안전보건" />
              <CategoryTag category="인성교육" />
            </div>
            
            <h4 class="demo-subtitle">🎨 활동 관련 카테고리</h4>
            <div class="demo-tags">
              <CategoryTag category="창의예술" />
              <CategoryTag category="체육건강" />
              <CategoryTag category="환경정보" />
              <CategoryTag category="행사활동" />
            </div>
            
            <h4 class="demo-subtitle">💬 소통 관련 카테고리</h4>
            <div class="demo-tags">
              <CategoryTag category="상담지원" />
              <CategoryTag category="학교알림" />
              <CategoryTag category="특별교육" />
              <CategoryTag category="가정연계" />
              <CategoryTag category="기타사항" />
            </div>
            
            <h4 class="demo-subtitle">✅ 클릭 가능한 필터 태그</h4>
            <div class="demo-tags">
              <CategoryTag 
                v-for="tag in ['학습관리', '안전보건', '인성교육']" 
                :key="tag"
                :category="tag as Category" 
                clickable 
                :active="activeTag === tag" 
                @click="setActiveTag" 
              />
            </div>
          </div>
        </section>

        <!-- SearchInput 컴포넌트 -->
        <section class="component-section">
          <h2>SearchInput</h2>
          <p>스마트 자동완성 검색 컴포넌트 - 실제 서브태그 기반 추천</p>
          
          <div class="component-demo">
            <div class="demo-search">
              <SearchInput 
                v-model="searchQuery"
                placeholder="문구를 검색해보세요... (예: 교통안전, 독서활동)"
                :suggestions="searchSuggestions"
                @search="handleSearch"
              />
            </div>
            <p v-if="searchQuery" class="search-result">
              🔍 검색어: "<strong>{{ searchQuery }}</strong>"
            </p>
            <div v-if="searchQuery" class="suggested-categories">
              <span v-for="category in getRelatedCategories(searchQuery)" :key="category" class="category-hint">
                {{ category }}
              </span>
            </div>
          </div>
        </section>

        <!-- NoticeCard 컴포넌트 -->
        <section class="component-section">
          <h2>NoticeCard</h2>
          <p>알림장 문구 카드 컴포넌트 - 메인 카테고리 + 서브태그 시스템</p>
          
          <div class="component-demo">
            <div class="demo-notice-cards">
              <NoticeCard
                title="겨울철 등하교 안전 수칙"
                content="눈과 얼음으로 미끄러운 겨울철, 안전한 등하교를 위해 다음 사항을 꼭 지켜주세요."
                :tags="['안전보건']"
                :sub-tags="['교통안전', '겨울체육', '한파대비']"
                author="김안전 선생님"
                :like-count="23"
                :sub-items="['미끄럼 방지 신발을 착용하세요', '급하게 뛰지 마시고 천천히 걸어주세요', '빙판길에서는 특히 조심하세요']"
                :created-at="new Date(Date.now() - 3 * 60 * 60 * 1000)"
                :is-recommended="true"
                @copy="handleCopy"
                @save="handleSave"
              />
              
              <NoticeCard
                title="창의적 독서 활동 안내"
                content="이번 주는 창의 독서 주간입니다. 책을 읽고 다양한 방법으로 표현해보세요."
                :tags="['학습관리', '창의예술']"
                :sub-tags="['독서활동', '창작활동', '표현력']"
                author="이창의 선생님"
                :like-count="18"
                :sub-items="['좋아하는 장면을 그림으로 그려보세요', '주인공에게 편지를 써보세요', '다른 결말을 상상해보세요']"
                :created-at="new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)"
                :is-popular="true"
                @copy="handleCopy"
                @save="handleSave"
              />
              
              <NoticeCard
                title="건강한 겨울나기 프로젝트"
                content="추운 겨울, 건강하게 지내기 위한 생활 습관을 함께 실천해봅시다."
                :tags="['체육건강', '인성교육']"
                :sub-tags="['건강관리', '체력향상', '협력정신']"
                author="박건강 선생님"
                :like-count="31"
                :sub-items="['매일 30분 이상 실내 운동하기', '충분한 수면과 영양 섭취', '친구들과 함께 건강 목표 세우기']"
                :created-at="new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)"
                :clickable="true"
                :is-selecting-mode="selectingMode"
                :is-selected="selectedNotices.includes('health-winter')"
                @click="() => toggleNoticeSelection('health-winter')"
                @copy="handleCopy"
                @save="handleSave"
              />
            </div>
            
            <div class="demo-controls">
              <BaseButton 
                variant="outline" 
                @click="selectingMode = !selectingMode"
              >
                {{ selectingMode ? '선택 모드 해제' : '선택 모드 활성화' }}
              </BaseButton>
              <span v-if="selectingMode" class="selection-info">
                선택된 문구: {{ selectedNotices.length }}개
              </span>
            </div>
          </div>
        </section>

        <!-- 새로운 컴포넌트들 -->
        <section class="component-section">
          <h2>SelectedNoticePanel</h2>
          <p>선택된 문구들을 관리하는 패널 컴포넌트</p>
          
          <div class="component-demo">
            <SelectedNoticePanel
              v-if="demoNotices.length > 0"
              :notices="demoNotices"
              :show="showDemoPanel"
              @close="showDemoPanel = false"
              @clear="handleClearDemo"
              @copy-all="handleCopyAll"
              @use-in-editor="handleUseInEditor"
              @preview="handlePreview"
              @remove="handleRemoveDemo"
              @reorder="handleReorderDemo"
            />
            <div class="demo-controls">
              <BaseButton 
                variant="primary" 
                @click="showDemoPanel = true"
              >
                데모 패널 열기
              </BaseButton>
              <BaseButton 
                variant="outline" 
                @click="addDemoNotice"
              >
                데모 문구 추가
              </BaseButton>
            </div>
            <p v-if="!showDemoPanel" class="demo-placeholder">
              버튼을 클릭하여 SelectedNoticePanel 데모를 확인해보세요.
            </p>
          </div>
        </section>

        <section class="component-section">
          <h2>AppLayout</h2>
          <p>전체 앱의 레이아웃을 담당하는 컴포넌트 - 현재 이 페이지를 감싸고 있음</p>
          
          <div class="component-demo">
            <div class="layout-demo">
              <div class="layout-structure">
                <div class="layout-header">Header (네비게이션)</div>
                <div class="layout-main">
                  <div class="layout-sidebar">Sidebar (메뉴)</div>
                  <div class="layout-content">Main Content (이 영역)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 서브태그 시스템 소개 -->
        <section class="component-section">
          <h2>서브태그 시스템</h2>
          <p>카테고리별 세부 분류를 위한 {{ allSubTags.length }}개의 서브태그 체계</p>
          
          <div class="component-demo">
            <div v-for="category in sampleCategories" :key="category" class="category-subtags">
              <h4 class="category-title">
                <CategoryTag :category="category" />
                {{ categoryMetaMap[category].displayName }}
              </h4>
              <div class="subtag-list">
                <span 
                  v-for="subTag in getSubTagsByCategory(category).slice(0, 8)" 
                  :key="subTag"
                  class="subtag-item"
                  :style="getSubTagStyle(subTag)"
                >
                  #{{ subTag }}
                </span>
                <span v-if="getSubTagsByCategory(category).length > 8" class="subtag-more">
                  +{{ getSubTagsByCategory(category).length - 8 }}개 더
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- 푸터 -->
      <footer class="library-footer">
        <div class="footer-content">
          <p>🎨 실시간 컴포넌트 라이브러리 - 모든 컴포넌트는 실제 앱에서 사용되는 버전입니다</p>
          <div class="footer-links">
            <router-link to="/main" class="footer-link">메인으로</router-link>
            <router-link to="/about" class="footer-link">About</router-link>
          </div>
        </div>
      </footer>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/common/BaseCard.vue'
import BaseButton from '../components/common/BaseButton.vue'
import CategoryTag from '../components/common/CategoryTag.vue'
import SearchInput from '../components/common/SearchInput.vue'
import NoticeCard from '../components/common/NoticeCard.vue'
import SelectedNoticePanel from '../components/common/SelectedNoticePanel.vue'
import { 
  categories, 
  allSubTags, 
  categoryMetaMap, 
  getSubTagsByCategory,
  getMainCategoryFromSubTag,
  getCategoryMeta,
  inferCategoryFromKeywords,
  type Category 
} from '../constants/categories'
import type { Notice } from '../data/notices'

// 반응형 상태
const loading = ref(false)
const activeTag = ref<string>('')
const searchQuery = ref('')
const selectingMode = ref(false)
const selectedNotices = ref<string[]>([])
const showDemoPanel = ref(false)

// 데모용 문구 데이터
const demoNotices = ref<Notice[]>([
  {
    id: '1',
    title: '겨울철 안전 수칙',
    content: '추운 겨울, 안전하게 지내기 위한 중요한 수칙들을 알아봅시다.',
    tags: ['안전보건'],
    subTags: ['교통안전', '한파대비'],
    subItems: ['미끄럼방지 신발 착용', '충분한 보온'],
    author: '김안전',
    createdAt: new Date(),
    likeCount: 12
  },
  {
    id: '2', 
    title: '독서 활동 안내',
    content: '창의적인 독서 활동으로 상상력을 키워봅시다.',
    tags: ['학습관리'],
    subTags: ['독서활동', '창작활동'],
    subItems: ['매일 30분 독서', '독후감 작성'],
    author: '이독서',
    createdAt: new Date(),
    likeCount: 8
  }
])

// 컴포넌트 맵 (통계용)
const components = {
  'BaseCard': BaseCard,
  'BaseButton': BaseButton,
  'CategoryTag': CategoryTag,
  'SearchInput': SearchInput,
  'NoticeCard': NoticeCard,
  'SelectedNoticePanel': SelectedNoticePanel,
  'AppLayout': AppLayout
}

// 샘플 카테고리들 (서브태그 시연용)
const sampleCategories: Category[] = ['학습관리', '안전보건', '인성교육', '창의예술']

// 검색 자동완성 데이터 (실제 서브태그 기반)
const searchSuggestions = computed(() => {
  return [
    // 학습관리 관련
    '시험안내', '과제제출', '독서활동', '받아쓰기', '학용품',
    // 안전보건 관련  
    '교통안전', '체육안전', '감기예방', '폭염대비', '한파대비',
    // 인성교육 관련
    '학교폭력예방', '배려', '협력정신', '친절함', '규칙위반',
    // 창의예술 관련
    '미술전시', '창작활동', '음악회', '예술체험', '상상력',
    // 기타
    '환경보호', '분리수거', '학교행사', '체험학습', '개별상담'
  ]
})

// 이벤트 핸들러들
const toggleLoading = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

const handleCardClick = () => {
  alert('카드가 클릭되었습니다!')
}

const setActiveTag = (category: string) => {
  activeTag.value = activeTag.value === category ? '' : category
}

const handleSearch = (query: string) => {
  console.log('검색:', query)
  searchQuery.value = query
}

const handleCopy = () => {
  alert('클립보드에 복사되었습니다!')
}

const handleSave = () => {
  alert('문구가 저장되었습니다!')
}

const toggleNoticeSelection = (noticeId: string) => {
  if (selectedNotices.value.includes(noticeId)) {
    selectedNotices.value = selectedNotices.value.filter(id => id !== noticeId)
  } else {
    selectedNotices.value.push(noticeId)
  }
}

const handlePreview = () => {
  alert('미리보기 모드로 이동합니다!')
}

const handleClearSelection = () => {
  selectedNotices.value = []
  selectingMode.value = false
}

const handleExport = () => {
  alert('선택된 문구들을 내보냅니다!')
}

// SelectedNoticePanel 데모 핸들러들
const handleClearDemo = () => {
  demoNotices.value = []
  showDemoPanel.value = false
}

const handleCopyAll = () => {
  alert('모든 문구가 클립보드에 복사되었습니다!')
}

const handleUseInEditor = () => {
  alert('편집기로 이동합니다!')
}

const handleRemoveDemo = (noticeId: string) => {
  demoNotices.value = demoNotices.value.filter(notice => notice.id !== noticeId)
}

const handleReorderDemo = (fromIndex: number, toIndex: number) => {
  const notices = [...demoNotices.value]
  const [moved] = notices.splice(fromIndex, 1)
  notices.splice(toIndex, 0, moved)
  demoNotices.value = notices
}

const addDemoNotice = () => {
  const newNotice: Notice = {
    id: Date.now().toString(),
    title: '새로운 데모 문구',
    content: '컴포넌트 라이브러리 테스트용 문구입니다.',
    tags: ['기타사항'],
    subTags: ['기타사항'],
    subItems: ['데모 항목 1', '데모 항목 2'],
    author: '테스트',
    createdAt: new Date(),
    likeCount: 0
  }
  demoNotices.value.push(newNotice)
}

// 검색어와 관련된 카테고리 찾기
const getRelatedCategories = (query: string): Category[] => {
  if (!query.trim()) return []
  return inferCategoryFromKeywords(query).slice(0, 3) // 최대 3개만 표시
}

// 서브태그 스타일 계산
const getSubTagStyle = (subTag: string) => {
  const mainCategory = getMainCategoryFromSubTag(subTag)
  if (mainCategory) {
    const meta = getCategoryMeta(mainCategory)
    return {
      color: meta.color,
      backgroundColor: 'transparent'
    }
  }
  return {
    color: '#6b7280',
    backgroundColor: 'transparent'
  }
}
</script>

<style scoped>
.component-library {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.library-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.library-header h1 {
  font-size: 3rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.library-header p {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.library-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f0f7ff 0%, #e1f0ff 100%);
  border: 1px solid #bfdbfe;
  border-radius: 2rem;
  color: #2563eb;
  font-weight: 600;
  font-size: 0.875rem;
}

.library-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.component-section {
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.component-section h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.component-section h2::before {
  content: '🧩';
  font-size: 1.5rem;
}

.component-section p {
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.6;
}

.component-demo {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.demo-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 1.5rem 0 0.75rem 0;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.demo-subtitle:first-of-type {
  margin-top: 0;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.demo-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.demo-buttons:last-child {
  margin-bottom: 0;
}

.demo-tags {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.demo-tags:last-child {
  margin-bottom: 0;
}

.demo-search {
  max-width: 500px;
  margin-bottom: 1.5rem;
}

.search-result {
  color: #374151;
  font-weight: 600;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  margin-bottom: 1rem;
}

.suggested-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-hint {
  padding: 0.375rem 0.75rem;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #bfdbfe;
}

.demo-notice-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.demo-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.selection-info {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.875rem;
}

.demo-placeholder {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  border: 2px dashed #d1d5db;
}

.layout-demo {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.layout-structure {
  min-height: 200px;
}

.layout-header {
  background: #3b82f6;
  color: white;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
}

.layout-main {
  display: flex;
  min-height: 160px;
}

.layout-sidebar {
  background: #f3f4f6;
  color: #374151;
  padding: 1rem;
  width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-right: 1px solid #e5e7eb;
}

.layout-content {
  background: #fafafa;
  color: #6b7280;
  padding: 1rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.category-subtags {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.subtag-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.subtag-item {
  padding: 0.375rem 0.75rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid currentColor;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.subtag-item:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.subtag-more {
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
  padding: 0.375rem 0.75rem;
}

.library-footer {
  margin-top: 4rem;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-content p {
  color: #6b7280;
  margin: 0;
  flex: 1;
}

.footer-links {
  display: flex;
  gap: 1rem;
}

.footer-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.footer-link:hover {
  background: #eff6ff;
  color: #2563eb;
}

@media (max-width: 768px) {
  .component-library {
    padding: 1rem;
  }
  
  .library-header {
    padding: 2rem 1rem;
    margin-bottom: 2rem;
  }
  
  .library-header h1 {
    font-size: 2rem;
  }

  .library-stats {
    gap: 1rem;
  }
  
  .component-section {
    padding: 1.5rem;
  }
  
  .demo-buttons,
  .demo-controls {
    justify-content: center;
  }
  
  .demo-notice-cards {
    grid-template-columns: 1fr;
  }

  .layout-main {
    flex-direction: column;
  }

  .layout-sidebar {
    width: 100%;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
