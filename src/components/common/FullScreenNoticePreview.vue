<template>
  <div class="fullscreen-overlay" @click="closeOverlay">
    <div class="fullscreen-container" @click.stop>
      <!-- 간소화된 헤더 -->
      <div class="fullscreen-header" :class="{ 'header-minimized': showMinimizedHeader }">
        <!-- 확장된 헤더 -->
        <div v-if="!showMinimizedHeader" class="header-expanded">
          <div class="header-left">
            <h2 class="preview-title">📋 미리보기</h2>
            
            <!-- 레이아웃 모드 선택 -->
            <div class="layout-selector">
              <label class="layout-label">
                <input 
                  type="radio" 
                  v-model="layoutMode" 
                  value="grid" 
                  class="layout-radio"
                />
                📊 그리드
              </label>
              <label class="layout-label">
                <input 
                  type="radio" 
                  v-model="layoutMode" 
                  value="slide" 
                  class="layout-radio"
                />
                📽️ 슬라이드
              </label>
              <label class="layout-label">
                <input 
                  type="radio" 
                  v-model="layoutMode" 
                  value="postit-modern" 
                  class="layout-radio"
                />
                🟨 모던 포스트잇
              </label>
              <label class="layout-label">
                <input 
                  type="radio" 
                  v-model="layoutMode" 
                  value="chalkboard-modern" 
                  class="layout-radio"
                />
                � 모던 칠판
              </label>
            </div>
          </div>
          
          <div class="header-center">
            <!-- 표시 옵션 체크박스 -->
            <div class="display-options">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="showTitle" 
                  class="option-checkbox"
                />
                📝 제목 표시
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="showContent" 
                  class="option-checkbox"
                />
                📄 내용 표시
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="showSubItems" 
                  class="option-checkbox"
                />
                📌 세부항목 표시
              </label>
            </div>
          </div>
          
          <div class="header-right">
            <!-- 스타일 옵션 -->
            <div class="style-options">
              <label class="option-label">
                🎨 스타일:
                <select v-model="format" class="option-select">
                  <option value="simple">간단</option>
                  <option value="numbered">번호</option>
                  <option value="bullet">불릿</option>
                </select>
              </label>
              
              <label class="option-label">
                🎯 테마:
                <select v-model="theme" class="option-select">
                  <option value="light">밝음</option>
                  <option value="dark">어둠</option>
                  <option value="paper">종이</option>
                </select>
              </label>
              
              <label class="option-label">
                📏 크기:
                <div class="size-control">
                  <span class="size-label">A</span>
                  <input 
                    type="range" 
                    v-model="fontSize" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    class="size-slider"
                  />
                  <span class="size-label large">A</span>
                </div>
              </label>
            </div>
            
            <!-- 헤더 최소화 버튼 (전체화면이 아닐 때만 표시) -->
            <button 
              v-if="!isFullscreen"
              @click="toggleFullscreen" 
              class="fullscreen-btn"
              :title="isFullscreen ? '전체화면 종료' : '전체화면'"
            >
              �
            </button>
            
            <!-- 진짜 전체화면 버튼 -->
            <button 
              @click="toggleFullscreen" 
              class="fullscreen-btn"
              :title="isFullscreen ? '전체화면 종료' : '전체화면'"
            >
              <svg v-if="!isFullscreen" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
              <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            </button>
            
            <button @click="closeOverlay" class="close-btn">
              ❌
            </button>
          </div>
        </div>

        <!-- 최소화된 헤더 -->
        <div v-else class="header-minimized-content">
          <!-- 크기 조절 (전체화면에서 가장 중요) -->
          <div class="size-control-quick">
            <span class="size-label-mini">📏</span>
            <input 
              type="range" 
              v-model="fontSize" 
              min="0.5" 
              max="2.0" 
              step="0.1" 
              class="size-slider-quick"
              :title="`크기: ${Math.round(fontSize * 100)}%`"
            />
          </div>
          
          <!-- 레이아웃 토글 -->
          <button 
            @click="layoutMode = layoutMode === 'grid' ? 'slide' : 'grid'"
            class="mini-control-btn"
            :title="layoutMode === 'grid' ? '슬라이드 모드로 변경' : '그리드 모드로 변경'"
          >
            {{ layoutMode === 'grid' ? '📊' : '📽️' }}
          </button>
          
          <!-- 설정 드롭다운 -->
          <div class="mini-settings" @click.stop>
            <button 
              @click="showSettingsDropdown = !showSettingsDropdown"
              class="mini-control-btn"
              title="설정"
            >
              ⚙️
            </button>
            <div v-if="showSettingsDropdown" class="settings-dropdown">
              <div class="settings-section">
                <label><input type="checkbox" v-model="showTitle"> 📝 제목</label>
                <label><input type="checkbox" v-model="showContent"> 📄 내용</label>
                <label><input type="checkbox" v-model="showSubItems"> 📌 세부항목</label>
              </div>
              <div class="settings-section">
                <select v-model="format" class="mini-select">
                  <option value="simple">간단</option>
                  <option value="numbered">번호</option>
                  <option value="bullet">불릿</option>
                </select>
                <select v-model="theme" class="mini-select">
                  <option value="light">밝음</option>
                  <option value="dark">어둠</option>
                  <option value="paper">종이</option>
                </select>
              </div>
              <div class="settings-section">
                <label class="size-control-mini">
                  📏 크기: {{ Math.round(fontSize * 100) }}%
                  <input 
                    type="range" 
                    v-model="fontSize" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    class="size-slider-mini"
                  />
                </label>
              </div>
            </div>
          </div>

          <!-- 헤더 확장 버튼 (전체화면이 아닐 때만 표시) -->
          <button 
            v-if="!isFullscreen"
            @click="toggleHeaderMinimize" 
            class="mini-control-btn"
            title="헤더 확장"
          >
            �
          </button>
          
          <!-- 전체화면 버튼 -->
          <button 
            @click="toggleFullscreen" 
            class="mini-control-btn"
            :title="isFullscreen ? '전체화면 종료' : '전체화면'"
          >
            <svg v-if="!isFullscreen" class="icon-mini" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            <svg v-else class="icon-mini" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
          </button>
          
          <!-- 닫기 버튼 -->
          <button @click="closeOverlay" class="mini-control-btn">
            ❌
          </button>
        </div>
      </div>
      
      <!-- 메인 콘텐츠 -->
      <div class="fullscreen-content">
        <div class="preview-wrapper" :class="[
          `theme-${theme}`, 
          `layout-${layoutMode}`,
          `display-${getDisplayMode(layoutMode)}`
        ]" :style="{ '--font-size-scale': fontSize }">
          <!-- 알림장 헤더 -->
          <div class="notice-header">
            <h2 class="notice-date">{{ formattedDate }}</h2>
            <div class="block-count">
              <span v-if="layoutMode === 'slide'">
                {{ currentSlideIndex + 1 }} / {{ validNotices.length }}개 항목
              </span>
              <span v-else>{{ validNotices.length }}개 항목</span>
            </div>
          </div>
          
          <!-- 빈 상태 -->
          <div v-if="validNotices.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p class="empty-text">편집할 문구를 추가해주세요</p>
          </div>
          
          <!-- 알림장 내용 -->
          <div v-else>
            <div v-if="layoutMode === 'grid' || layoutMode === 'slide'" class="notice-body">
              <!-- 그리드/슬라이드 기존 구현 -->
              <div 
                v-if="layoutMode === 'grid'" 
                class="notice-items-container"
                :class="{ 'center-align': shouldCenterAlign, 'uniform-height': true }"
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
                  <div v-if="showTitle && notice.title && notice.title.trim()" class="item-title">
                    <span v-if="format === 'numbered'" class="item-number">{{ index + 1 }}</span>
                    {{ notice.title }}
                  </div>
                  <!-- 내용 -->
                  <div v-if="showContent && notice.content && notice.content.trim()" class="item-content">
                    {{ notice.content }}
                  </div>
                  <!-- 하위 목록 -->
                  <div v-if="showSubItems && hasValidSubItems(notice.subItems)" class="item-sub-list">
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
              <!-- 슬라이드 모드: 기존 방식 -->
              <div 
                v-else
                v-for="(notice, index) in displayNotices"
                :key="notice.id"
                class="notice-item"
              >
                <!-- 제목 -->
                <div v-if="showTitle && notice.title && notice.title.trim()" class="item-title">
                  <span v-if="format === 'numbered'" class="item-number">{{ currentSlideIndex + 1 }}</span>
                  {{ notice.title }}
                </div>
                <!-- 내용 -->
                <div v-if="showContent && notice.content && notice.content.trim()" class="item-content">
                  {{ notice.content }}
                </div>
                <!-- 하위 목록 -->
                <div v-if="showSubItems && hasValidSubItems(notice.subItems)" class="item-sub-list">
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
              <div v-if="layoutMode === 'slide' && validNotices.length > 1" class="slide-bottom-navigation">
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
            <PostitModernPreview v-else-if="layoutMode === 'postit-modern'" :notices="validNotices" />
            <ChalkboardModernPreview v-else-if="layoutMode === 'chalkboard-modern'" :notices="validNotices" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'

import PostitModernPreview from '../preview/PostitModernPreview.vue'
import ChalkboardModernPreview from '../preview/ChalkboardModernPreview.vue'
import type { Notice } from '../../data/notices'

interface Props {
  notices: Notice[]
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 컨트롤 상태
const layoutMode = ref<'grid' | 'slide' | 'postit-modern' | 'chalkboard-modern'>('grid')
const format = ref<'simple' | 'numbered' | 'bullet'>('numbered')
const theme = ref<'light' | 'dark' | 'paper'>('light')
const isFullscreen = ref(false)

// UI 상태
const showMinimizedHeader = ref(false)
const showSettingsDropdown = ref(false)

// 표시 옵션
const showTitle = ref(true)
const showContent = ref(true)
const showSubItems = ref(true)

// 크기 조절 옵션
const fontSize = ref(1) // 기본 크기 배율 (0.5 ~ 2.0)

// 슬라이드 모드를 위한 현재 인덱스
const currentSlideIndex = ref(0)

// 드래그 스크롤을 위한 상태
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)
const containerRef = ref<HTMLElement | null>(null)

// 유효한 문구들만 필터링
const validNotices = computed(() => {
  return props.notices.filter(notice => {
    const hasTitle = showTitle.value && notice.title && notice.title.trim()
    const hasContent = showContent.value && notice.content && notice.content.trim()
    const hasSubItems = showSubItems.value && hasValidSubItems(notice.subItems)
    return hasTitle || hasContent || hasSubItems
  })
})

// 현재 표시할 문구들 (슬라이드 모드용)
const displayNotices = computed(() => {
  if (layoutMode.value === 'slide') {
    return validNotices.value.slice(currentSlideIndex.value, currentSlideIndex.value + 1)
  }
  return validNotices.value
})

// 가운데 정렬 여부 (1-3개일 때만)
const shouldCenterAlign = computed(() => {
  return validNotices.value.length <= 3
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
  const walk = (x - startX.value) * 2
  container.scrollLeft = scrollLeft.value - walk
}

const endDrag = () => {
  if (!containerRef.value) return
  
  isDragging.value = false
  containerRef.value.style.cursor = 'grab'
  containerRef.value.style.userSelect = 'auto'
  containerRef.value = null
}

// 전체화면 기능
const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      isFullscreen.value = true
      showMinimizedHeader.value = true // 전체화면 시 자동으로 헤더 간소화
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
      showMinimizedHeader.value = false // 전체화면 해제 시 헤더 복원
    }
  } catch (error) {
    console.warn('Fullscreen API not supported:', error)
  }
}

// 헤더 최소화 토글 (전체화면이 아닐 때만 사용)
const toggleHeaderMinimize = () => {
  if (!isFullscreen.value) {
    showMinimizedHeader.value = !showMinimizedHeader.value
  }
  showSettingsDropdown.value = false // 설정 드롭다운 닫기
}

// 전체화면 상태 변화 감지
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
  if (isFullscreen.value) {
    showMinimizedHeader.value = true // 전체화면 진입 시 자동 간소화
  } else {
    showMinimizedHeader.value = false // 전체화면 해제 시 복원
  }
}

// 디스플레이 모드 계산
const getDisplayMode = (mode: string) => {
  switch (mode) {
    case 'slide':
      return 'presentation'
    case 'grid':
      return 'board'
    case 'postit-modern':
      return 'postit-modern'
    case 'chalkboard-modern':
      return 'chalkboard-modern'
    default:
      return 'paper'
  }
}

// 오버레이 닫기
const closeOverlay = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
  emit('close')
}

// 문구 변경 시 슬라이드 인덱스 초기화
watch(() => props.notices, () => {
  currentSlideIndex.value = 0
}, { immediate: true })

// 레이아웃 모드 변경 시에도 슬라이드 인덱스 초기화
watch(layoutMode, () => {
  currentSlideIndex.value = 0
})

// ESC 키로 닫기
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && !document.fullscreenElement) {
    closeOverlay()
  }
}

// 이벤트 리스너 등록
document.addEventListener('fullscreenchange', handleFullscreenChange)
document.addEventListener('keydown', handleKeydown)

// 컴포넌트 언마운트 시 이벤트 리스너 정리
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('keydown', handleKeydown)
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
})
</script>

<style scoped>
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.fullscreen-container {
  width: 95vw;
  height: 95vh;
  background: white;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease-out;
}

.fullscreen-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.fullscreen-header:not(.header-minimized) {
  padding: 1rem 1.5rem;
  gap: 2rem;
}

.fullscreen-header.header-minimized {
  padding: 0.5rem 1rem;
}

/* 확장된 헤더 스타일 */
.header-expanded {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;
}

/* 최소화된 헤더 스타일 */
.header-minimized-content {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  gap: 0.5rem;
  position: relative;
}

.mini-control-btn {
  background: #2563eb;
  border: 1px solid #1d4ed8;
  color: white;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  min-width: 36px;
  min-height: 36px;
}

.mini-control-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
}

.icon-mini {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

/* 설정 드롭다운 */
.mini-settings {
  position: relative;
}

.settings-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  color: #374151;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  min-width: 200px;
  z-index: 1000;
  margin-top: 0.5rem;
}

.settings-section {
  margin-bottom: 0.75rem;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.settings-section label:last-child {
  margin-bottom: 0;
}

.mini-select {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.mini-select:last-child {
  margin-bottom: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.preview-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.layout-selector {
  display: flex;
  gap: 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.layout-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.layout-label:hover {
  background: #e5e7eb;
}

.layout-radio {
  accent-color: #10b981;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.display-options {
  display: flex;
  gap: 1.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.checkbox-label:hover {
  background: #e5e7eb;
}

.option-checkbox {
  accent-color: #10b981;
  transform: scale(1.2);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.style-options {
  display: flex;
  gap: 1rem;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-weight: 500;
}

.option-select {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.option-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* 크기 조절 컨트롤 */
.size-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
}

.size-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
}

.size-label.large {
  font-size: 1rem;
}

.size-slider {
  width: 80px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.size-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #2563eb;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.size-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #2563eb;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 미니 크기 조절 컨트롤 */
.size-control-mini {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.size-slider-mini {
  width: 100%;
  height: 3px;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.size-slider-mini::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  background: #2563eb;
  border-radius: 50%;
  cursor: pointer;
}

.size-slider-mini::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #2563eb;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* 빠른 크기 조절 (전체화면용) */
.size-control-quick {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(37, 99, 235, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #2563eb;
}

.size-label-mini {
  font-size: 1rem;
  color: #2563eb;
}

.size-slider-quick {
  width: 100px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.size-slider-quick::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #2563eb;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.size-slider-quick::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #2563eb;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.fullscreen-btn,
.close-btn {
  background: #2563eb;
  border: 1px solid #1d4ed8;
  color: white;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  min-width: 36px;
  min-height: 36px;
}

.fullscreen-btn:hover,
.close-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fullscreen-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.preview-wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 1rem;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
  background: #f8fafc;
  --font-size-scale: 1;
  display: flex;
  flex-direction: column;
}

/* 전체화면에서 패딩 최적화 */
.header-minimized + .fullscreen-content .preview-wrapper {
  padding: calc(0.5rem + (0.5rem * var(--font-size-scale)));
}

/* 테마별 스타일 */
.theme-light {
  background: #ffffff;
  color: #1f2937;
}

.theme-dark {
  background: #1f2937;
  color: #f9fafb;
}

.theme-paper {
  background: linear-gradient(45deg, #fef7cd 0%, #fff4e6 100%);
  color: #451a03;
}

/* 알림장 헤더 */
.notice-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* 헤더가 최소화되었을 때 알림장 헤더 크기 증가 */
.header-minimized + .fullscreen-content .notice-header {
  padding: 2rem;
  margin-bottom: 2.5rem;
}

.notice-date {
  font-size: calc(2rem * var(--font-size-scale));
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
  transition: font-size 0.3s ease;
}

/* 헤더가 최소화되었을 때 날짜 크기 증가 */
.header-minimized + .fullscreen-content .notice-date {
  font-size: calc(2.75rem * var(--font-size-scale));
  margin-bottom: 0.75rem;
}

.block-count {
  opacity: 0.9;
  font-size: calc(1.125rem * var(--font-size-scale));
  color: #dbeafe;
  transition: font-size 0.3s ease;
}

/* 헤더가 최소화되었을 때 항목 수 크기 증가 */
.header-minimized + .fullscreen-content .block-count {
  font-size: calc(1.375rem * var(--font-size-scale));
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
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
  font-size: calc(1.375rem * var(--font-size-scale));
  font-weight: 500;
  color: #64748b;
}

/* 알림장 본문 */
.notice-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  flex: 1;
}

/* 슬라이드 모드에서 flex 구조 최적화 */
.layout-slide .notice-body {
  height: 100%;
  justify-content: space-between;
}

/* 그리드 모드 - 가로 스크롤 */
.layout-grid .notice-body {
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  display: flex;
}

.layout-grid .notice-items-container {
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
  /* 기본적으로는 왼쪽 정렬 */
  justify-content: flex-start;
  /* 스크롤 영역 높이 최적화 */
  flex: 1;
  align-items: center;
}

/* 1-3개일 때만 가운데 정렬 */
.layout-grid .notice-items-container.center-align {
  justify-content: center;
}

.layout-grid .notice-items-container:active {
  cursor: grabbing;
}

.layout-grid .notice-items-container::-webkit-scrollbar {
  height: calc(6px * var(--font-size-scale));
}

.layout-grid .notice-items-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 0.375rem;
  margin: 0 1rem;
}

.layout-grid .notice-items-container::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 0.375rem;
  min-width: 40px;
}

.layout-grid .notice-items-container::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}

.layout-grid .notice-item {
  flex: 0 0 auto;
  min-width: calc(320px + (80px * var(--font-size-scale)));
  max-width: calc(400px + (100px * var(--font-size-scale)));
  transition: all 0.3s ease;
  /* 높이 자동 조절 */
  height: auto;
  max-height: 80vh;
  overflow-y: auto;
}

/* 통일된 높이 적용 */
.layout-grid .notice-items-container.uniform-height {
  align-items: stretch;
}

.layout-grid .notice-items-container.uniform-height .notice-item {
  height: calc(400px + (200px * var(--font-size-scale)));
  min-height: calc(300px + (150px * var(--font-size-scale)));
  max-height: calc(500px + (250px * var(--font-size-scale)));
  display: flex;
  flex-direction: column;
}

/* 카드 내부 컨텐츠 레이아웃 최적화 */
.layout-grid .notice-items-container.uniform-height .notice-item .item-title {
  flex-shrink: 0;
}

.layout-grid .notice-items-container.uniform-height .notice-item .item-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.layout-grid .notice-items-container.uniform-height .notice-item .item-content::-webkit-scrollbar {
  width: 4px;
}

.layout-grid .notice-items-container.uniform-height .notice-item .item-content::-webkit-scrollbar-track {
  background: transparent;
}

.layout-grid .notice-items-container.uniform-height .notice-item .item-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.layout-grid .notice-items-container.uniform-height .notice-item .item-sub-list {
  flex-shrink: 0;
  margin-top: auto;
}

/* 헤더가 최소화되었을 때 그리드 아이템 크기 증가 */
.header-minimized + .fullscreen-content .layout-grid .notice-item {
  min-width: calc(360px + (120px * var(--font-size-scale)));
  max-width: calc(450px + (150px * var(--font-size-scale)));
  max-height: 85vh;
}

/* 헤더 최소화 시 통일된 높이 */
.header-minimized + .fullscreen-content .layout-grid .notice-items-container.uniform-height .notice-item {
  height: calc(450px + (250px * var(--font-size-scale)));
  min-height: calc(350px + (200px * var(--font-size-scale)));
  max-height: calc(600px + (300px * var(--font-size-scale)));
}

/* 그리드 모드 전용 스타일 - 더 큰 글자 */
.layout-grid .item-title {
  font-size: calc(1.75rem * var(--font-size-scale));
  margin-bottom: 1rem;
}

.layout-grid .item-number {
  width: calc(32px * var(--font-size-scale));
  height: calc(32px * var(--font-size-scale));
  font-size: calc(1.125rem * var(--font-size-scale));
  margin-right: 1rem;
}

.layout-grid .item-content {
  font-size: calc(1.25rem * var(--font-size-scale));
  line-height: 1.7;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.layout-grid .item-sub-item {
  font-size: calc(1.125rem * var(--font-size-scale));
  line-height: 1.6;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 헤더가 최소화되었을 때 그리드 모드 더 크게 */
.header-minimized + .fullscreen-content .layout-grid .item-title {
  font-size: calc(2rem * var(--font-size-scale));
  margin-bottom: 1.25rem;
}

.header-minimized + .fullscreen-content .layout-grid .item-number {
  width: calc(36px * var(--font-size-scale));
  height: calc(36px * var(--font-size-scale));
  font-size: calc(1.25rem * var(--font-size-scale));
  margin-right: 1.25rem;
}

.header-minimized + .fullscreen-content .layout-grid .item-content {
  font-size: calc(1.375rem * var(--font-size-scale));
  line-height: 1.8;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
}

.header-minimized + .fullscreen-content .layout-grid .item-sub-item {
  font-size: calc(1.25rem * var(--font-size-scale));
  line-height: 1.7;
  margin-bottom: 0.75rem;
  padding: 0.75rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layout-grid .notice-item:hover {
  transform: translateY(-2px);
  border-left-color: #2563eb;
}

/* 공통 notice-item 스타일 */
.notice-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  border-left: 4px solid #3b82f6;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* 그리드 모드에서만 내부 요소 배치 최적화 */
.layout-grid .notice-item {
  justify-content: flex-start;
}

.layout-grid .notice-item .item-content {
  margin-bottom: auto;
}

.notice-item:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transform: translateY(-1px);
}

.item-title {
  font-size: calc(1.5rem * var(--font-size-scale));
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  color: #1e40af;
  display: flex;
  align-items: center;
  transition: font-size 0.3s ease;
}

/* 헤더가 최소화되었을 때 제목 크기 증가 */
.header-minimized + .fullscreen-content .item-title {
  font-size: calc(1.75rem * var(--font-size-scale));
  margin-bottom: 1rem;
}

.item-number {
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  width: calc(28px * var(--font-size-scale));
  height: calc(28px * var(--font-size-scale));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(1rem * var(--font-size-scale));
  font-weight: 600;
  margin-right: 0.75rem;
  transition: all 0.3s ease;
}

/* 헤더가 최소화되었을 때 번호 크기 증가 */
.header-minimized + .fullscreen-content .item-number {
  width: calc(32px * var(--font-size-scale));
  height: calc(32px * var(--font-size-scale));
  font-size: calc(1.125rem * var(--font-size-scale));
  margin-right: 1rem;
}

.item-content {
  font-size: calc(1.125rem * var(--font-size-scale));
  line-height: 1.6;
  margin-bottom: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  color: #475569;
  transition: all 0.3s ease;
}

/* 헤더가 최소화되었을 때 내용 크기 증가 */
.header-minimized + .fullscreen-content .item-content {
  font-size: calc(1.25rem * var(--font-size-scale));
  line-height: 1.7;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.item-sub-list {
  margin-left: 1rem;
  margin-top: auto;
  padding-top: 1rem;
}

.item-sub-item {
  font-size: calc(1rem * var(--font-size-scale));
  line-height: 1.5;
  margin-bottom: 0.25rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bullet, .dash {
  font-weight: bold;
  margin-right: 0.5rem;
  opacity: 0.7;
}

/* 슬라이드 하단 네비게이션 */
.slide-bottom-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: auto;
  padding: 1rem 0;
  flex-shrink: 0;
}

/* 전체화면에서 네비게이션 위치 조정 */
.header-minimized + .fullscreen-content .slide-bottom-navigation {
  margin-top: 2rem;
  padding: 2rem 0 1rem 0;
}

.slide-nav-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 0.75rem;
  width: calc(44px * var(--font-size-scale));
  height: calc(44px * var(--font-size-scale));
  font-size: calc(1.1rem * var(--font-size-scale));
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.1);
  font-weight: 600;
}

/* 헤더가 최소화되었을 때 슬라이드 버튼 크기 증가 */
.header-minimized + .fullscreen-content .slide-nav-button {
  width: calc(52px * var(--font-size-scale));
  height: calc(52px * var(--font-size-scale));
  font-size: calc(1.25rem * var(--font-size-scale));
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
  width: calc(12px * var(--font-size-scale));
  height: calc(12px * var(--font-size-scale));
  border-radius: 50%;
  background: #cbd5e1;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 헤더가 최소화되었을 때 인디케이터 크기 증가 */
.header-minimized + .fullscreen-content .slide-indicator {
  width: calc(14px * var(--font-size-scale));
  height: calc(14px * var(--font-size-scale));
}

.slide-indicator.active {
  background: #3b82f6;
  border-color: #3b82f6;
  transform: scale(1.25);
  box-shadow: 0 0 0 2px #bfdbfe;
}

/* 슬라이드 모드 레이아웃 */
.layout-slide {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  padding: 1rem 2rem;
  height: 100%;
}

/* 전체화면에서 슬라이드 모드 최적화 */
.header-minimized + .fullscreen-content .layout-slide {
  justify-content: center;
  padding: 2rem 3rem;
}

/* 슬라이드 모드에서 notice-item 높이 최적화 */
.layout-slide .notice-item {
  width: 100%;
  max-width: none;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 전자칠판/발표 모드 스타일 */
.display-board,
.display-presentation {
  padding: 2rem;
}

.display-board .notice-header,
.display-presentation .notice-header {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
}

.display-board .notice-date,
.display-presentation .notice-date {
  font-size: calc(2.5rem * var(--font-size-scale));
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.display-board .block-count,
.display-presentation .block-count {
  font-size: calc(1.2rem * var(--font-size-scale));
  font-weight: 600;
}

.display-board .notice-body,
.display-presentation .notice-body {
  gap: 3rem;
}

.display-board .notice-item,
.display-presentation .notice-item {
  border-left: 6px solid #3b82f6;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.display-board .item-title,
.display-presentation .item-title {
  font-size: calc(2rem * var(--font-size-scale));
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #1e40af;
}

.display-board .item-content,
.display-presentation .item-content {
  font-size: calc(1.4rem * var(--font-size-scale));
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
  font-size: calc(1.2rem * var(--font-size-scale));
  line-height: 1.8;
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 0.6rem;
  border-left: 4px solid #10b981;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 발표 모드는 더 크게 */
.display-presentation .notice-date {
  font-size: calc(3.5rem * var(--font-size-scale));
  margin-bottom: 1.5rem;
}

.display-presentation .block-count {
  font-size: calc(1.5rem * var(--font-size-scale));
}

.display-presentation .item-title {
  font-size: calc(2.8rem * var(--font-size-scale));
  margin-bottom: 2rem;
}

.display-presentation .item-content {
  font-size: calc(1.8rem * var(--font-size-scale));
  line-height: 2;
  padding: 2rem;
  margin-bottom: 2rem;
}

.display-presentation .item-sub-item {
  font-size: calc(1.6rem * var(--font-size-scale));
  line-height: 2;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
}

/* 테마별 컨텐츠 스타일 */
.theme-dark .item-content {
  background: rgba(255, 255, 255, 0.1);
}

.theme-paper .item-content {
  background: rgba(69, 26, 3, 0.05);
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .fullscreen-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  
  .fullscreen-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .header-left,
  .header-center,
  .header-right {
    width: 100%;
    justify-content: center;
  }
  
  .display-options,
  .style-options {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}

/* 애니메이션 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to { 
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>