<template>
  <div class="simple-preview" :class="[
    `display-${props.displayMode || 'paper'}`,
    props.layoutMode ? `layout-${props.layoutMode}` : ''
  ]">
    <div class="notice-header">
      <h2 class="notice-date">{{ formattedDate }}</h2>
      <div class="block-count">
        <span v-if="props.layoutMode === 'slide'">
          {{ currentSlideIndex + 1 }} / {{ validNotices.length }}개 항목
        </span>
        <span v-else>{{ validNotices.length }}개 항목</span>
      </div>
    </div>
    
    <div v-if="validNotices.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p class="empty-text">편집할 문구를 추가해주세요</p>
    </div>
    
    <div v-else class="notice-body">

      
      <!-- 슬라이드 모드 네비게이션 버튼 -->
      <template v-if="props.layoutMode === 'slide' && validNotices.length > 1">
        <!-- 슬라이드 내용과 하단 네비게이션을 감싸는 컨테이너 추가 -->
      </template>
      
      <!-- 그리드 모드: 가로 스크롤 컨테이너 -->
      <div 
        v-if="props.layoutMode === 'grid'" 
        class="notice-items-container"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @touchstart="startDrag"
        @touchmove="onDrag"
        @touchend="endDrag"
      >
        <div 
          v-for="(notice, index) in validNotices"
          :key="notice.id"
          class="notice-item"
        >
          <!-- 제목 -->
          <div v-if="props.showTitle && notice.title && notice.title.trim()" class="item-title">
            <span v-if="format === 'numbered'" class="item-number">{{ index + 1 }}.</span>
            {{ notice.title }}
          </div>
          
          <!-- 내용 -->
          <div v-if="props.showContent && notice.content && notice.content.trim()" class="item-content">
            {{ notice.content }}
          </div>
          
          <!-- 하위 목록 -->
          <div v-if="props.showSubItems && hasValidSubItems(notice.subItems)" class="item-sub-list">
            <div 
              v-for="subItem in validSubItems(notice.subItems)"
              :key="subItem"
              class="item-sub-item"
            >
              <span v-if="format === 'bullet'" class="bullet">•</span>
              <span v-else class="dash">-</span>
              {{ subItem }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 기본/슬라이드 모드: 기존 방식 -->
      <div 
        v-else
        v-for="(notice, index) in displayNotices"
        :key="notice.id"
        class="notice-item"
      >
        <!-- 제목 -->
        <div v-if="props.showTitle && notice.title && notice.title.trim()" class="item-title">
          <span v-if="format === 'numbered'" class="item-number">{{ 
            props.layoutMode === 'slide' ? currentSlideIndex + 1 : getNoticeNumber(index)
          }}.</span>
          {{ notice.title }}
        </div>
        
        <!-- 내용 -->
        <div v-if="props.showContent && notice.content && notice.content.trim()" class="item-content">
          {{ notice.content }}
        </div>
        
        <!-- 하위 목록 -->
        <div v-if="props.showSubItems && hasValidSubItems(notice.subItems)" class="item-sub-list">
          <div 
            v-for="subItem in validSubItems(notice.subItems)"
            :key="subItem"
            class="item-sub-item"
          >
            <span v-if="format === 'bullet'" class="bullet">•</span>
            <span v-else class="dash">-</span>
            {{ subItem }}
          </div>
        </div>
      </div>
      
      <!-- 슬라이드 하단 네비게이션 -->
      <div v-if="props.layoutMode === 'slide' && validNotices.length > 1" class="slide-bottom-navigation">
        <button 
          @click="prevSlide" 
          :disabled="currentSlideIndex === 0"
          class="slide-nav-button prev"
        >
          ◀
        </button>
        
        <div class="slide-indicators">
          <button 
            v-for="(_, index) in validNotices"
            :key="index"
            @click="goToSlide(index)"
            class="slide-indicator"
            :class="{ active: index === currentSlideIndex }"
          />
        </div>
        
        <button 
          @click="nextSlide" 
          :disabled="currentSlideIndex === validNotices.length - 1"
          class="slide-nav-button next"
        >
          ▶
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Notice } from '../../data/notices'

interface Props {
  notices: Notice[]
  format: 'simple' | 'numbered' | 'bullet'
  theme: 'light' | 'dark' | 'paper'
  displayMode?: 'paper' | 'board' | 'presentation'
  layoutMode?: 'grid' | 'slide'
  showTitle?: boolean
  showContent?: boolean
  showSubItems?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTitle: true,
  showContent: true,
  showSubItems: true
})

// 슬라이드 모드를 위한 현재 인덱스
const currentSlideIndex = ref(0)

// 그리드 모드를 위한 현재 페이지
const currentGridPage = ref(0)
const itemsPerPage = computed(() => 4) // 한 페이지에 4개씩

// 드래그 스크롤을 위한 상태
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)
const containerRef = ref<HTMLElement | null>(null)

// 유효한 문구들만 필터링
const validNotices = computed(() => {
  return props.notices.filter(notice => {
    const hasTitle = props.showTitle && notice.title && notice.title.trim()
    const hasContent = props.showContent && notice.content && notice.content.trim()
    const hasSubItems = props.showSubItems && hasValidSubItems(notice.subItems)
    return hasTitle || hasContent || hasSubItems
  })
})

// 현재 표시할 문구들
const displayNotices = computed(() => {
  if (props.layoutMode === 'slide') {
    // 슬라이드 모드: 현재 인덱스의 문구만 표시
    return validNotices.value.slice(currentSlideIndex.value, currentSlideIndex.value + 1)
  }
  // 그리드 모드와 기본 모드: 모든 항목 표시
  return validNotices.value
})

// 그리드 모드 총 페이지 수
const totalGridPages = computed(() => {
  return Math.ceil(validNotices.value.length / itemsPerPage.value)
})

// 현재 날짜 포맷
const formattedDate = computed(() => {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }) + ' 알림장'
})

// 유효한 하위 항목이 있는지 확인
const hasValidSubItems = (subItems: string[] | undefined): boolean => {
  return !!(subItems && subItems.some(item => item && item.trim()))
}

// 유효한 하위 항목들만 반환
const validSubItems = (subItems: string[] | undefined): string[] => {
  if (!subItems) return []
  return subItems.filter(item => item && item.trim())
}

// 슬라이드 네비게이션
const nextSlide = () => {
  if (currentSlideIndex.value < validNotices.value.length - 1) {
    currentSlideIndex.value++
  }
}

const prevSlide = () => {
  if (currentSlideIndex.value > 0) {
    currentSlideIndex.value--
  }
}

const goToSlide = (index: number) => {
  currentSlideIndex.value = index
}



const goToGridPage = (page: number) => {
  currentGridPage.value = page
}

// 문구 번호 계산 (그리드 페이지를 고려)
const getNoticeNumber = (displayIndex: number) => {
  if (props.layoutMode === 'grid') {
    return currentGridPage.value * itemsPerPage.value + displayIndex + 1
  }
  return displayIndex + 1
}

// 드래그 스크롤 함수들
const startDrag = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true
  const container = e.currentTarget as HTMLElement
  containerRef.value = container
  
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  startX.value = clientX - container.offsetLeft
  scrollLeft.value = container.scrollLeft
  
  container.style.cursor = 'grabbing'
  container.style.userSelect = 'none'
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !containerRef.value) return
  
  e.preventDefault()
  const container = containerRef.value
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  const x = clientX - container.offsetLeft
  const walk = (x - startX.value) * 2 // 스크롤 속도 조정
  container.scrollLeft = scrollLeft.value - walk
}

const endDrag = () => {
  if (!containerRef.value) return
  
  isDragging.value = false
  containerRef.value.style.cursor = 'grab'
  containerRef.value.style.userSelect = 'auto'
  containerRef.value = null
}
</script>

<style scoped>
.simple-preview {
  width: 100%;
  height: 100%;
  padding: 1rem;
  position: relative;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
  background: #f8fafc;
  border-radius: 0.75rem;
}

.notice-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin: -1rem -1rem 2rem -1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.notice-date {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
}

.block-count {
  opacity: 0.9;
  font-size: 0.875rem;
  color: #dbeafe;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  opacity: 0.7;
  background: #ffffff;
  border-radius: 0.75rem;
  border: 2px dashed #cbd5e1;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 500;
  color: #64748b;
}

.notice-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

/* 그리드 모드일 때 가로 배치 */
.simple-preview.layout-grid .notice-body {
  flex-direction: column;
  overflow: hidden;
}

.simple-preview.layout-grid .notice-items-container {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 1rem 0;
  scrollbar-width: thin;
  scrollbar-color: #3b82f6 transparent;
  cursor: grab;
  user-select: none;
}

.simple-preview.layout-grid .notice-items-container:active {
  cursor: grabbing;
}

.simple-preview.layout-grid .notice-items-container::-webkit-scrollbar {
  height: 6px;
}

.simple-preview.layout-grid .notice-items-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 0.375rem;
}

.simple-preview.layout-grid .notice-items-container::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 0.375rem;
}

.simple-preview.layout-grid .notice-items-container::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}

.simple-preview.layout-grid .notice-item {
  flex: 0 0 calc(33.333% - 1rem);
  min-width: 280px;
  max-width: 350px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #3b82f6;
}

.simple-preview.layout-grid .notice-item:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transform: translateY(-2px);
  border-left-color: #2563eb;
}

.notice-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  border-left: 4px solid #3b82f6;
  transition: all 0.3s ease;
}

.notice-item:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transform: translateY(-1px);
}

.item-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  color: #1e40af;
  display: flex;
  align-items: center;
}

.item-number {
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  margin-right: 0.75rem;
}

.item-content {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.item-sub-list {
  margin-left: 1rem;
}

.item-sub-item {
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 0.25rem;
  opacity: 0.8;
}

.bullet, .dash {
  font-weight: bold;
  margin-right: 0.5rem;
  opacity: 0.7;
}


/* 슬라이드 네비게이션은 FullScreenPreview에서 처리 */

/* 슬라이드 하단 네비게이션 */
.slide-bottom-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem 0;
}

.slide-nav-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 0.75rem;
  width: 44px;
  height: 44px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.1);
  font-weight: 600;
}

.slide-nav-button:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.slide-nav-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

.slide-indicators {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.slide-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #cbd5e1;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slide-indicator.active {
  background: #3b82f6;
  border-color: #3b82f6;
  transform: scale(1.25);
  box-shadow: 0 0 0 2px #bfdbfe;
}

/* 테마별 스타일 조정 */
:deep(.theme-dark) .item-content {
  background: rgba(255, 255, 255, 0.1);
}

:deep(.theme-paper) .item-content {
  background: rgba(69, 26, 3, 0.05);
}

/* 전자칠판 모드 스타일 */
.simple-preview.display-board,
.simple-preview.display-presentation {
  padding: 2rem;
}

.display-board .notice-header,
.display-presentation .notice-header {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 4px solid currentColor;
}

.display-board .notice-date,
.display-presentation .notice-date {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.display-board .block-count,
.display-presentation .block-count {
  font-size: 1.2rem;
  font-weight: 600;
}

.display-board .notice-body,
.display-presentation .notice-body {
  gap: 3rem;
}

.display-board .notice-item,
.display-presentation .notice-item {
  border-left: 6px solid #3b82f6;
  padding-left: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.display-board .item-title,
.display-presentation .item-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #1e40af;
}

.display-board .item-content,
.display-presentation .item-content {
  font-size: 1.4rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 0.8rem;
  border: 2px solid rgba(59, 130, 246, 0.2);
}

.display-board .item-sub-list,
.display-presentation .item-sub-list {
  margin-left: 2rem;
  margin-top: 1.5rem;
}

.display-board .item-sub-item,
.display-presentation .item-sub-item {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 0.6rem;
  border-left: 4px solid #10b981;
  font-weight: 500;
}

/* 발표 모드는 더 크게 */
.display-presentation .notice-date {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
}

.display-presentation .block-count {
  font-size: 1.5rem;
}

.display-presentation .item-title {
  font-size: 2.8rem;
  margin-bottom: 2rem;
}

.display-presentation .item-content {
  font-size: 1.8rem;
  line-height: 2;
  padding: 2rem;
  margin-bottom: 2rem;
}

.display-presentation .item-sub-item {
  font-size: 1.6rem;
  line-height: 2;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
}
</style>