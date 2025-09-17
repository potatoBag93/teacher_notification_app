<template>
  <AppLayout>
    <div :class="$style.collectionPage">
      <!-- 페이지 헤더 -->
      <div :class="$style.pageHeader">
        <div>
          <h1 :class="$style.pageTitle">� 내 컬렉션</h1>
          <p :class="$style.pageSubtitle">총 {{ totalNoticesCount }}개 문구</p>
        </div>
        <div :class="$style.pageActions">
          <BaseButton variant="outline">📂 내보내기</BaseButton>
          <BaseButton variant="primary" @click="$router.push('/edit')">➕ 새 문구 작성</BaseButton>
        </div>
      </div>

      <!-- 탭 네비게이션 -->
      <div :class="$style.tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="[$style.tab, { [$style.active]: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <!-- 필터 및 정렬 -->
      <div :class="$style.filters">
        <div :class="$style.filterGroup">
          <label :class="$style.filterLabel">카테고리</label>
          <select v-model="selectedCategory" :class="$style.selectField">
            <option value="">전체</option>
            <option value="safety">안전</option>
            <option value="life">생활지도</option>
            <option value="study">학습</option>
            <option value="health">건강</option>
          </select>
        </div>
        
        <div :class="$style.filterGroup">
          <label :class="$style.filterLabel">정렬</label>
          <select v-model="sortBy" :class="$style.selectField">
            <option value="recent">최근 저장순</option>
            <option value="usage">자주 사용순</option>
            <option value="name">이름순</option>
            <option value="created">작성일순</option>
          </select>
        </div>
        
        <div :class="$style.filterGroup">
          <label :class="$style.filterLabel">기간</label>
          <select v-model="dateFilter" :class="$style.selectField">
            <option value="">전체</option>
            <option value="week">최근 1주일</option>
            <option value="month">최근 1개월</option>
            <option value="quarter">최근 3개월</option>
          </select>
        </div>
      </div>

      <!-- 탭 콘텐츠 -->
      <div :class="$style.tabContent">
        <!-- 저장한 문구 탭 -->
        <div v-if="activeTab === 'saved'" :class="$style.collectionGrid">
          <div 
            v-for="notice in filteredSavedNotices" 
            :key="notice.id"
            :class="$style.collectionCard"
          >
            <div :class="$style.cardHeader">
              <div>
                <h3 :class="$style.cardTitle">{{ notice.title }}</h3>
                <div :class="$style.cardMeta">
                  {{ formatTimeAgo(notice.savedAt) }} 저장 • 원작자: {{ notice.author }}
                </div>
              </div>
              <div :class="$style.cardMenu">
                <button :class="$style.menuTrigger" @click="toggleMenu(notice.id)">⋮</button>
                <div v-if="openMenuId === notice.id" :class="$style.dropdown" @click.stop>
                  <button @click="editNotice(notice)">편집</button>
                  <button @click="deleteNotice(notice)">삭제</button>
                </div>
              </div>
            </div>
            
            <div :class="$style.cardContent">{{ notice.content }}</div>
            
            <div :class="$style.cardTags">
              <span 
                v-for="tag in notice.tags" 
                :key="tag"
                :class="[$style.tag, $style[`tag${tag.charAt(0).toUpperCase() + tag.slice(1)}`]]"
              >
                {{ getTagLabel(tag) }}
              </span>
            </div>
            
            <div :class="$style.cardActions">
              <div :class="$style.cardStats">
                <div :class="$style.statItem">
                  <span>📋</span>
                  <span>{{ notice.usageCount }}회 사용</span>
                </div>
                <div :class="$style.statItem">
                  <span>❤️</span>
                  <span>{{ notice.likeCount }}</span>
                </div>
              </div>
              <div :class="$style.actionButtons">
                <BaseButton variant="outline" size="sm" @click="editNotice(notice)">편집</BaseButton>
                <BaseButton variant="primary" size="sm" @click="useNotice(notice)">사용</BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 작성한 문구 탭 -->
        <div v-else-if="activeTab === 'created'" :class="$style.collectionGrid">
          <div 
            v-for="notice in filteredCreatedNotices" 
            :key="notice.id"
            :class="$style.collectionCard"
          >
            <div :class="$style.cardHeader">
              <div>
                <h3 :class="$style.cardTitle">{{ notice.title }}</h3>
                <div :class="$style.cardMeta">
                  {{ formatTimeAgo(notice.createdAt) }} 작성 • 나의 창작
                </div>
              </div>
              <div :class="$style.cardMenu">
                <button :class="$style.menuTrigger" @click="toggleMenu(notice.id)">⋮</button>
              </div>
            </div>
            
            <div :class="$style.cardContent">{{ notice.content }}</div>
            
            <div :class="$style.cardTags">
              <span 
                v-for="tag in notice.tags" 
                :key="tag"
                :class="[$style.tag, $style[`tag${tag.charAt(0).toUpperCase() + tag.slice(1)}`]]"
              >
                {{ getTagLabel(tag) }}
              </span>
            </div>
            
            <div :class="$style.cardActions">
              <div :class="$style.cardStats">
                <div :class="$style.statItem">
                  <span>👥</span>
                  <span>다른 교사 {{ notice.sharedCount }}명 사용</span>
                </div>
                <div :class="$style.statItem">
                  <span>❤️</span>
                  <span>{{ notice.likeCount }}</span>
                </div>
              </div>
              <div :class="$style.actionButtons">
                <BaseButton variant="outline" size="sm" @click="editNotice(notice)">수정</BaseButton>
                <BaseButton variant="primary" size="sm" @click="useNotice(notice)">사용</BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 공유한 문구 탭 -->
        <div v-else-if="activeTab === 'shared'">
          <div v-if="sharedNotices.length === 0" :class="$style.emptyState">
            <div :class="$style.emptyIcon">🌐</div>
            <h3 :class="$style.emptyTitle">아직 공유한 문구가 없어요</h3>
            <p :class="$style.emptyDescription">다른 선생님들과 좋은 문구를 공유해보세요.</p>
            <BaseButton variant="primary" @click="$router.push('/edit')">첫 문구 공유하기</BaseButton>
          </div>
          <div v-else :class="$style.collectionGrid">
            <!-- 공유한 문구 카드 내용 - 현재는 빈 배열이므로 표시되지 않음 -->
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

// 반응형 상태
const activeTab = ref('saved')
const selectedCategory = ref('')
const sortBy = ref('recent')
const dateFilter = ref('')
const openMenuId = ref<string | null>(null)

// 탭 정의
const tabs = computed(() => [
  { key: 'saved', label: '저장한 문구', count: savedNotices.value.length },
  { key: 'created', label: '작성한 문구', count: createdNotices.value.length },
  { key: 'shared', label: '공유한 문구', count: sharedNotices.value.length }
])

// 목업 데이터
const savedNotices = ref([
  {
    id: '1',
    title: '여름철 물놀이 안전수칙',
    content: '여름철 물놀이 시 다음 안전수칙을 반드시 지켜주세요.\n• 깊은 물에는 절대 들어가지 마세요\n• 혼자서 물놀이 하지 마세요\n• 물놀이 전 충분한 준비운동을 하세요',
    author: '박선생님',
    savedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
    tags: ['safety', 'health'],
    usageCount: 3,
    likeCount: 15
  },
  {
    id: '2',
    title: '규칙적인 생활습관',
    content: '방학 중에도 규칙적인 생활을 실천해보아요.\n• 일찍 자고 일찍 일어나기\n• 정해진 시간에 식사하기\n• 매일 운동하기',
    author: '이선생님',
    savedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1일 전
    tags: ['life', 'health'],
    usageCount: 7,
    likeCount: 12
  },
  {
    id: '3',
    title: '독서 습관 기르기',
    content: '매일 조금씩이라도 책을 읽는 습관을 길러보세요.\n• 하루 30분 이상 독서하기\n• 읽은 책에 대해 가족과 이야기하기\n• 독서일기 쓰기',
    author: '김선생님',
    savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
    tags: ['study', 'creative'],
    usageCount: 5,
    likeCount: 8
  }
])

const createdNotices = ref([
  {
    id: '4',
    title: '환경보호 실천하기',
    content: '지구를 위한 작은 실천을 시작해보아요.\n• 일회용품 사용 줄이기\n• 분리수거 정확히 하기\n• 대중교통 이용하기',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1주일 전
    tags: ['env', 'life'],
    sharedCount: 12,
    likeCount: 25
  }
])

const sharedNotices = ref([])

// 계산된 속성
const totalNoticesCount = computed(() => 
  savedNotices.value.length + createdNotices.value.length + sharedNotices.value.length
)

const filteredSavedNotices = computed(() => {
  let notices = [...savedNotices.value]
  
  // 카테고리 필터
  if (selectedCategory.value) {
    notices = notices.filter(notice => 
      notice.tags.includes(selectedCategory.value)
    )
  }
  
  // 정렬
  notices.sort((a, b) => {
    switch (sortBy.value) {
      case 'usage':
        return b.usageCount - a.usageCount
      case 'name':
        return a.title.localeCompare(b.title)
      case 'created':
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      default: // recent
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    }
  })
  
  return notices
})

const filteredCreatedNotices = computed(() => {
  let notices = [...createdNotices.value]
  
  if (selectedCategory.value) {
    notices = notices.filter(notice => 
      notice.tags.includes(selectedCategory.value)
    )
  }
  
  return notices
})

const filteredSharedNotices = computed(() => {
  return sharedNotices.value
})

// 메서드
const formatTimeAgo = (date: Date) => {
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
    return '어제'
  } else if (days < 7) {
    return `${days}일 전`
  } else {
    return `${Math.floor(days / 7)}주일 전`
  }
}

const getTagLabel = (tag: string) => {
  const tagLabels: { [key: string]: string } = {
    safety: '안전',
    health: '건강',
    life: '생활지도',
    study: '학습',
    creative: '창의',
    env: '환경'
  }
  return tagLabels[tag] || tag
}

const toggleMenu = (id: string) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const editNotice = (notice: any) => {
  console.log('Edit notice:', notice.title)
  router.push(`/edit?id=${notice.id}`)
}

const useNotice = (notice: any) => {
  navigator.clipboard.writeText(notice.content).then(() => {
    alert('문구가 클립보드에 복사되었습니다!')
  })
}

const deleteNotice = (notice: any) => {
  if (confirm(`"${notice.title}" 문구를 삭제하시겠습니까?`)) {
    const index = savedNotices.value.findIndex(n => n.id === notice.id)
    if (index > -1) {
      savedNotices.value.splice(index, 1)
    }
  }
  openMenuId.value = null
}

// 외부 클릭 시 메뉴 닫기
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.card-menu')) {
    openMenuId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style module>
.collectionPage {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 페이지 헤더 */
.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.pageTitle {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.pageSubtitle {
  color: #6b7280;
  margin-top: 8px;
  font-size: 16px;
}

.pageActions {
  display: flex;
  gap: 12px;
}

/* 탭 네비게이션 */
.tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
}

.tab {
  padding: 12px 0;
  cursor: pointer;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
  font-weight: 500;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  font-size: 16px;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab:hover {
  color: #2563eb;
}

/* 필터 및 정렬 */
.filters {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filterGroup {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filterLabel {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  min-width: 60px;
}

.selectField {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  min-width: 120px;
}

.selectField:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 컬렉션 그리드 */
.collectionGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.collectionCard {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.collectionCard:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.cardTitle {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.cardMeta {
  font-size: 14px;
  color: #6b7280;
}

.cardMenu {
  position: relative;
}

.menuTrigger {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.15s ease;
  font-size: 18px;
}

.menuTrigger:hover {
  background: #f3f4f6;
  color: #374151;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 120px;
}

.dropdown button {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  background: none;
  border: none;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.15s ease;
}

.dropdown button:hover {
  background: #f3f4f6;
}

.dropdown button:first-child {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.dropdown button:last-child {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.cardContent {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 16px;
  white-space: pre-line;
}

.cardTags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.tagSafety {
  background: #fef2f2;
  color: #dc2626;
}

.tagHealth {
  background: #f0fdf4;
  color: #16a34a;
}

.tagLife {
  background: #eff6ff;
  color: #2563eb;
}

.tagStudy {
  background: #fef3c7;
  color: #d97706;
}

.tagCreative {
  background: #fdf4ff;
  color: #a855f7;
}

.tagEnv {
  background: #ecfdf5;
  color: #059669;
}

.cardActions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cardStats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.statItem {
  display: flex;
  align-items: center;
  gap: 4px;
}

.actionButtons {
  display: flex;
  gap: 8px;
}

/* 빈 상태 */
.emptyState {
  text-align: center;
  padding: 64px 32px;
  color: #6b7280;
}

.emptyIcon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.emptyTitle {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.emptyDescription {
  font-size: 16px;
  margin: 0 0 24px 0;
}

/* 반응형 */
@media (max-width: 1024px) {
  .collectionGrid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .collectionPage {
    padding: 16px;
  }
  
  .pageHeader {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .filterGroup {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
  
  .selectField {
    min-width: auto;
  }
  
  .collectionGrid {
    grid-template-columns: 1fr;
  }
  
  .cardActions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .actionButtons {
    justify-content: stretch;
  }
  
  .actionButtons button {
    flex: 1;
  }
}
</style>
