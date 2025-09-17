<template>
  <div class="notice-preview">
    <div class="preview-header">
      <h3 class="preview-title">📄 알림장 미리보기</h3>
      
      <div class="preview-actions">
        <select v-model="selectedFormat" class="format-select">
          <option 
            v-for="option in formatOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        
        <BaseButton 
          variant="outline" 
          size="sm"
          @click="openNewWindowPreview"
        >
          🔍 새 창 미리보기
        </BaseButton>
        
        <BaseButton 
          variant="outline" 
          size="sm"
          @click="copyToClipboard"
        >
          📋 복사
        </BaseButton>
      </div>
    </div>

    <!-- 요소 표시 컨트롤 패널 -->
    <div class="element-controls">
      <div class="control-section">
        <h4 class="control-title">표시 요소 선택</h4>
        <div class="control-grid">
          <label class="control-item">
            <input 
              type="checkbox" 
              v-model="elementVisibility.header"
              class="control-checkbox"
            />
            <span class="control-label">📋 제목 표시</span>
          </label>
          
          <label class="control-item">
            <input 
              type="checkbox" 
              v-model="elementVisibility.content"
              class="control-checkbox"
            />
            <span class="control-label">📝 내용 표시</span>
          </label>
          
          <label class="control-item">
            <input 
              type="checkbox" 
              v-model="elementVisibility.subItems"
              class="control-checkbox"
            />
            <span class="control-label">📌 하위 목록 표시</span>
          </label>
        </div>
      </div>
    </div>

    <div class="preview-content" ref="previewRef">
      <div class="notice-header">
        <h2 class="notice-date">{{ formattedDate }}</h2>
        <div class="block-count">{{ blocks.length }}개 항목</div>
      </div>
      
      <div v-if="blocks.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p class="empty-text">편집할 문구를 추가해주세요</p>
        <p class="empty-subtext">왼쪽에서 문구를 선택하거나 새로 작성하세요</p>
      </div>
      
      <div v-else class="notice-body">
        <div 
          v-for="(block, index) in sortedBlocks"
          :key="block.id"
          class="notice-item"
        >
          <div v-if="elementVisibility.header && block.title && block.title.trim()" class="item-header">
            <h4 class="item-title">
              <span v-if="selectedFormat === 'numbered'" class="item-number">
                {{ index + 1 }}.
              </span>
              {{ block.title }}
            </h4>
          </div>
          
          <p v-if="elementVisibility.content && block.content && block.content.trim()" class="item-content">{{ block.content }}</p>
          
          <ul v-if="elementVisibility.subItems && block.subItems && block.subItems.length > 0" class="item-sub-list">
            <li 
              v-for="subItem in block.subItems"
              :key="subItem"
              class="item-sub-item"
            >
              <span v-if="selectedFormat === 'bullet'" class="bullet">•</span>
              <span v-else class="dash">-</span>
              {{ subItem }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 통계 정보 -->
    <div v-if="blocks.length > 0" class="preview-stats">
      <div class="stat-item">
        <span class="stat-label">총 문구:</span>
        <span class="stat-value">{{ blocks.length }}개</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">예상 길이:</span>
        <span class="stat-value">{{ estimatedLength }}자</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">카테고리:</span>
        <span class="stat-value">{{ uniqueCategories.join(', ') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from './common/BaseButton.vue'
import type { EditBlock } from '../data/edit'
import { generateNoticeText, formatOptions } from '../data/edit'
import { openNewWindowPreview as openPreviewWindow, type PreviewOptions } from '../utils/previewWindow'

interface Props {
  blocks: EditBlock[]
}

const props = defineProps<Props>()

const selectedFormat = ref<'simple' | 'numbered' | 'bullet'>('simple')
const previewRef = ref<HTMLElement>()

// 요소 표시 상태 관리
const elementVisibility = ref({
  header: true,    // 제목 표시
  content: true,   // 내용 표시
  subItems: true   // 하위 목록 표시
})

// 정렬된 블록 목록
const sortedBlocks = computed(() => {
  return [...props.blocks].sort((a, b) => a.order - b.order)
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

// 예상 텍스트 길이
const estimatedLength = computed(() => {
  const text = generateCustomNoticeText()
  return text.length
})

// 고유 카테고리 목록
const uniqueCategories = computed(() => {
  const categories = new Set<string>()
  props.blocks.forEach(block => {
    block.tags.forEach(tag => categories.add(tag))
  })
  return Array.from(categories)
})

// 클립보드에 복사
const copyToClipboard = async () => {
  const text = generateCustomNoticeText()
  
  try {
    await navigator.clipboard.writeText(text)
    alert('클립보드에 복사되었습니다!')
  } catch (error) {
    console.error('복사 실패:', error)
    
    // 폴백: 텍스트 선택
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('클립보드에 복사되었습니다!')
  }
}

// 커스텀 텍스트 생성 (요소 표시 상태 반영)
const generateCustomNoticeText = () => {
  let text = `${formattedDate.value}\n\n`
  
  sortedBlocks.value.forEach((block, index) => {
    // 제목 추가
    if (elementVisibility.value.header && block.title && block.title.trim()) {
      if (selectedFormat.value === 'numbered') {
        text += `${index + 1}. ${block.title}`
      } else {
        text += block.title
      }
      text += '\n'
    }
    
    // 내용 추가
    if (elementVisibility.value.content && block.content && block.content.trim()) {
      text += `${block.content}\n`
    }
    
    // 하위 항목 추가
    if (elementVisibility.value.subItems && block.subItems && block.subItems.length > 0) {
      block.subItems.forEach(item => {
        if (selectedFormat.value === 'bullet') {
          text += `• ${item}\n`
        } else {
          text += `- ${item}\n`
        }
      })
    }
    
    text += '\n'
  })
  
  return text.trim()
}

// 새 창 미리보기
const openNewWindowPreview = () => {
  const options: PreviewOptions = {
    blocks: props.blocks,
    formattedDate: formattedDate.value,
    selectedFormat: selectedFormat.value,
    elementVisibility: elementVisibility.value
  }
  
  openPreviewWindow(options)
}
</script>

<style scoped>
.notice-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.preview-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.format-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.format-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.element-controls {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.control-section {
  max-width: 100%;
}

.control-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

.control-item:hover {
  background: #e5e7eb;
}

.control-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  cursor: pointer;
}

.control-label {
  font-size: 0.875rem;
  color: #374151;
  user-select: none;
  cursor: pointer;
}

.preview-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: white;
}

.notice-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #1f2937;
}

.notice-date {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.block-count {
  color: #6b7280;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.empty-subtext {
  font-size: 0.875rem;
}

.notice-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.notice-item {
  break-inside: avoid;
}

.item-header {
  margin-bottom: 0.75rem;
}

.item-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
  border-left: 4px solid #3b82f6;
  padding-left: 0.75rem;
}

.item-number {
  color: #3b82f6;
  margin-right: 0.5rem;
}

.item-content {
  color: #374151;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.7;
  margin-bottom: 1rem;
  padding-left: 1rem;
  background: #f9fafb;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border-left: 3px solid #e5e7eb;
}

.item-sub-list {
  list-style: none;
  padding-left: 1.5rem;
  margin: 0;
  background: #fef7f0;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-left: 3px solid #f59e0b;
}

.item-sub-item {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.bullet {
  color: #3b82f6;
  font-weight: bold;
  margin-right: 0.5rem;
}

.dash {
  color: #6b7280;
  margin-right: 0.5rem;
}

.preview-stats {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.stat-item {
  display: flex;
  gap: 0.25rem;
}

.stat-label {
  color: #6b7280;
}

.stat-value {
  color: #1f2937;
  font-weight: 500;
}

@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .preview-actions {
    align-self: stretch;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .control-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .preview-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
