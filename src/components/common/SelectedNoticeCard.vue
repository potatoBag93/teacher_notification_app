<template>
  <div 
    class="selected-content"
    :class="{ dragging: isDragging }"
    :draggable="draggable"
    @dragstart="$emit('dragstart', $event)"
    @dragend="$emit('dragend', $event)"
  >
    <div class="selected-content-header">
      <div class="selected-content-left">
        <div class="selected-content-number">#{{ index + 1 }}</div>
      </div>
      <button 
        v-if="removable" 
        class="selected-content-remove" 
        @click="$emit('remove')"
      >
        ×
      </button>
    </div>
    
    <div class="selected-content-tags">
      <CategoryTag
        v-for="tag in notice.tags" 
        :key="tag"
        :category="tag"
        :clickable="false"
      />
    </div>
    
    <div class="selected-content-text">{{ notice.content }}</div>
    
    <div v-if="notice.subItems?.length" class="selected-sub-items">
      <div v-for="item in notice.subItems" :key="item" class="selected-item">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CategoryTag from './CategoryTag.vue'
import { type Category } from '../../constants/categories'

interface Notice {
  id: string
  title: string
  content: string
  tags: Category[]
  subItems: string[]
}

interface Props {
  notice: Notice
  index: number
  isDragging?: boolean
  draggable?: boolean
  removable?: boolean
}

defineProps<Props>()

defineEmits<{
  dragstart: [event: DragEvent]
  dragend: [event: DragEvent]
  remove: []
}>()
</script>

<style scoped>
.selected-content {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #667eea;
  transition: all 300ms ease;
  position: relative;
  cursor: move;
  user-select: none;
  transform: translateY(0);
}

.selected-content:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

.selected-content.dragging {
  opacity: 0.8;
  transform: rotate(3deg) scale(1.05) translateY(-10px);
  z-index: 1000;
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
  transition: none;
}

.selected-content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.selected-content-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-content-number {
  font-size: 0.75rem;
  color: #667eea;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  min-width: fit-content;
}

.selected-content-remove {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 200ms ease;
  opacity: 0.7;
}

.selected-content-remove:hover {
  background: rgba(220, 38, 38, 0.1);
  opacity: 1;
  transform: scale(1.1);
}

.selected-content-tags {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.selected-content-text {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #374151;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.selected-sub-items {
  font-size: 0.75rem;
  color: #6b7280;
}

.selected-item {
  margin-bottom: 0.375rem;
  padding-left: 1rem;
  position: relative;
  line-height: 1.4;
}

.selected-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}
</style>
