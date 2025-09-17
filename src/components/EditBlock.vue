<template>
  <div 
    class="edit-block"
    :class="{ 
      'block-editing': isEditing, 
      'block-dragging': isDragging 
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >


    <!-- 블록 헤더 -->
    <div class="block-header">
      <div class="block-info">
        <h3 v-if="!isEditing" class="edit-title">{{ block.title }}</h3>
        <input 
          v-else
          v-model="editedTitle"
          class="edit-title-input"
          placeholder="제목을 입력하세요"
          @blur="saveTitle"
          @keydown.enter="saveTitle"
        />
        
        <div class="block-tags">
          <CategoryTag 
            v-for="tag in block.tags"
            :key="tag"
            :category="tag"
          />
        </div>
      </div>
      
      <div class="block-actions">
        <BaseButton 
          variant="ghost" 
          size="sm"
          @click="toggleEdit"
        >
          {{ isEditing ? '완료' : '편집' }}
        </BaseButton>
        <BaseButton 
          variant="ghost" 
          size="sm"
          @click="$emit('remove')"
        >
          삭제
        </BaseButton>
      </div>
    </div>

    <!-- 블록 콘텐츠 -->
    <div class="block-content">
      <div v-if="!isEditing" class="content-display">
        <p class="edit-content">{{ block.content }}</p>
        <ul v-if="block.subItems && block.subItems.length > 0" class="edit-sub-items">
          <li v-for="item in block.subItems" :key="item">{{ item }}</li>
        </ul>
      </div>
      
      <div v-else class="content-edit">
        <textarea
          v-model="editedContent"
          class="edit-content-textarea"
          placeholder="내용을 입력하세요"
          @blur="saveContent"
        />
        
        <div class="edit-sub-items-edit">
          <label class="edit-sub-items-label">세부 항목:</label>
          <div 
            v-for="(item, index) in editedSubItems"
            :key="index"
            class="edit-sub-item-edit"
          >
            <input
              v-model="editedSubItems[index]"
              class="edit-sub-item-input"
              placeholder="세부 항목"
              @blur="saveSubItems"
            />
            <BaseButton 
              variant="ghost" 
              size="sm"
              @click="removeSubItem(index)"
            >
              ×
            </BaseButton>
          </div>
          <BaseButton 
            variant="ghost" 
            size="sm"
            @click="addSubItem"
          >
            + 항목 추가
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from './common/BaseButton.vue'
import CategoryTag from './common/CategoryTag.vue'
import type { EditBlock } from '../data/edit'

interface Props {
  block: EditBlock
  isDragging?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [block: EditBlock]
  remove: []
  dragStart: [blockId: string]
  dragEnd: []
}>()

const isEditing = ref(false)
const editedTitle = ref(props.block.title)
const editedContent = ref(props.block.content)
const editedSubItems = ref(props.block.subItems ? [...props.block.subItems] : [])

const toggleEdit = () => {
  if (isEditing.value) {
    saveAll()
  }
  isEditing.value = !isEditing.value
}

const saveTitle = () => {
  if (editedTitle.value !== props.block.title) {
    emit('update', {
      ...props.block,
      title: editedTitle.value
    })
  }
}

const saveContent = () => {
  if (editedContent.value !== props.block.content) {
    emit('update', {
      ...props.block,
      content: editedContent.value
    })
  }
}

const saveSubItems = () => {
  const filteredItems = editedSubItems.value.filter(item => item.trim() !== '')
  emit('update', {
    ...props.block,
    subItems: filteredItems.length > 0 ? filteredItems : undefined
  })
}

const saveAll = () => {
  const filteredItems = editedSubItems.value.filter(item => item.trim() !== '')
  emit('update', {
    ...props.block,
    title: editedTitle.value,
    content: editedContent.value,
    subItems: filteredItems.length > 0 ? filteredItems : undefined
  })
}

const addSubItem = () => {
  editedSubItems.value.push('')
}

const removeSubItem = (index: number) => {
  editedSubItems.value.splice(index, 1)
  saveSubItems()
}

const handleDragStart = (e: DragEvent) => {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', props.block.id)
  }
  emit('dragStart', props.block.id)
}

const handleDragEnd = () => {
  emit('dragEnd')
}
</script>

<style scoped>
.edit-block {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #667eea;
  transition: all 300ms ease;
  position: relative;
  cursor: move;
  user-select: none;
  transform: translateY(0);
}

.edit-block:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

.block-editing {
  border-left-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.block-dragging {
  opacity: 0.8;
  transform: rotate(3deg) scale(1.05) translateY(-10px);
  z-index: 1000;
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
  transition: none;
}

.edit-block:hover .drag-handle {
  opacity: 1;
}


.block-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.block-info {
  flex: 1;
}

.block-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.edit-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.edit-title-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  background: white;
}

.edit-title-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.block-tags {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.block-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.block-content {
  margin-left: 0;
}

.content-display {
  color: #374151;
}

.edit-content {
  line-height: 1.5;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.edit-sub-items {
  list-style: none;
  padding-left: 0;
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.edit-sub-items li {
  margin-bottom: 0.375rem;
  padding-left: 1rem;
  position: relative;
  line-height: 1.4;
}

.edit-sub-items li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.content-edit {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-content-textarea {
  width: 100%;
  min-height: 4rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  resize: vertical;
  font-family: inherit;
  background: white;
}

.edit-content-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.edit-sub-items-edit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-sub-items-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.edit-sub-item-edit {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.edit-sub-item-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.edit-sub-item-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .block-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .block-actions {
    align-self: flex-end;
  }
}
</style>
