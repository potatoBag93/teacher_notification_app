<template>
  <!-- Panel Overlay -->
  <div 
    v-if="show" 
    class="panel-overlay" 
    @click="$emit('close')"
  ></div>

  <!-- Selected Notice Panel -->
  <div 
    v-if="show" 
    class="selected-notice-panel"
    :class="{ show: show }"
  >
    <div class="panel-header">
      <div class="panel-title">
        ✅ 선택한 문구 
        <span class="selection-counter">{{ notices.length }}</span>
      </div>
      <button class="panel-close" @click="$emit('close')">×</button>
    </div>
    
    <div class="selected-notices-list" ref="selectedNoticesList">
      <template v-for="(notice, index) in notices" :key="notice.id">
        <!-- 드롭 영역 (첫 번째 카드 위에) -->
        <div 
          v-if="index === 0"
          class="drop-zone"
          :class="{ active: isDragging }"
          @dragover.prevent
          @dragenter.prevent="handleDropZoneDragEnter($event, 0)"
          @drop="handleDropZoneDrop($event, 0)"
        ></div>
        
        <!-- 선택된 문구 카드 -->
        <SelectedNoticeCard
          :notice="notice"
          :index="index"
          :is-dragging="draggedIndex === index"
          :draggable="true"
          :removable="true"
          :data-index="index"
          @dragstart="handleDragStart($event, index)"
          @dragend="handleDragEnd"
          @remove="$emit('remove', notice.id)"
        />
        
        <!-- 드롭 영역 (각 카드 아래) -->
        <div 
          class="drop-zone"
          :class="{ active: isDragging }"
          @dragover.prevent
          @dragenter.prevent="handleDropZoneDragEnter($event, index + 1)"
          @drop="handleDropZoneDrop($event, index + 1)"
        ></div>
      </template>
    </div>
    
    <div class="panel-actions">
      <BaseButton variant="outline" @click="$emit('clear')">
        모두 해제
      </BaseButton>
      <BaseButton variant="secondary" @click="$emit('close')">
        닫기
      </BaseButton>
      <BaseButton variant="secondary" @click="$emit('preview')">
  알뭐 띄우기
      </BaseButton>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'
import SelectedNoticeCard from './SelectedNoticeCard.vue'
import type { Notice } from '../../data/notices'

interface Props {
  notices: Notice[]
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'clear'): void
  (e: 'copy-all'): void
  (e: 'use-in-editor'): void
  (e: 'preview'): void
  (e: 'remove', noticeId: string): void
  (e: 'reorder', fromIndex: number, toIndex: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 드래그 앤 드롭 상태
const isDragging = ref(false)
const draggedIndex = ref<number | null>(null)

// 드래그 앤 드롭 메서드
const handleDragStart = (event: DragEvent, index: number) => {
  isDragging.value = true
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

const handleDragEnd = () => {
  isDragging.value = false
  draggedIndex.value = null
}

const handleDropZoneDragEnter = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  // 드롭 영역 하이라이트 로직은 CSS로 처리
}

const handleDropZoneDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  
  if (draggedIndex.value === null) return
  
  let insertIndex = targetIndex
  if (targetIndex > draggedIndex.value) {
    insertIndex = targetIndex - 1
  }
  
  // 부모에게 순서 변경 이벤트 전달
  emit('reorder', draggedIndex.value, insertIndex)
  
  // 드래그 상태 리셋
  isDragging.value = false
  draggedIndex.value = null
}
</script>

<style scoped>
/* 패널 오버레이 */
.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100% - 420px);
  height: 100%;
  background: transparent;
  z-index: 190;
  pointer-events: none;
}

/* 선택된 문구 패널 */
.selected-notice-panel {
  position: fixed;
  top: 0;
  right: -420px;
  width: 420px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-left: 2px solid #667eea;
  box-shadow: -10px 0 40px rgba(102, 126, 234, 0.3);
  transition: all 300ms ease;
  z-index: 200;
  overflow-y: auto;
  padding: 1.5rem;
}

.selected-notice-panel.show {
  right: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selection-counter {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.panel-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 200ms ease;
}

.panel-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.selected-notices-list {
  margin-bottom: 1rem;
}

/* 드롭 영역 */
.drop-zone {
  height: 2px;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  border-radius: 1px;
  margin: 0.5rem 0;
  opacity: 0;
  transform: scaleX(0);
  transition: all 300ms ease;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 300ms ease;
}

.drop-zone::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: rgba(118, 75, 162, 0.3);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 300ms ease;
}

.drop-zone.active {
  opacity: 1;
  transform: scaleX(1);
  height: 20px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 10px;
  margin: 1.5rem 0;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.drop-zone.active::before {
  width: 24px;
  height: 24px;
  background: #667eea;
  border: 3px solid white;
  left: -12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.drop-zone.active::after {
  width: 24px;
  height: 24px;
  background: #764ba2;
  border: 3px solid white;
  right: -12px;
  box-shadow: 0 2px 8px rgba(118, 75, 162, 0.4);
}

.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: sticky;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .panel-overlay {
    display: none;
  }

  .selected-notice-panel {
    width: 100%;
    right: -100%;
  }
}
</style>
