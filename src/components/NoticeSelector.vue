<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">문구 선택</h2>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <SearchInput 
          v-model="searchQuery"
          placeholder="문구 검색..."
          @search="handleSearch"
        />
        
        <div class="notices-grid">
          <div
            v-for="notice in filteredNotices"
            :key="notice.id"
            class="notice-item"
            :class="{ selected: selectedIds.includes(notice.id) }"
            @click="toggleSelection(notice)"
          >
            <div class="notice-header">
              <div class="notice-tags">
                <CategoryTag 
                  v-for="tag in notice.tags"
                  :key="tag"
                  :category="tag"
                />
              </div>
              <div class="notice-likes">❤️ {{ notice.likeCount }}</div>
            </div>
            
            <h3 class="notice-title">{{ notice.title }}</h3>
            <p class="notice-preview">{{ notice.content.length > 50 ? notice.content.substring(0, 50) + '...' : notice.content }}</p>
            
            <div class="selection-indicator">
              <div v-if="selectedIds.includes(notice.id)" class="selected-check">✓</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="selection-count">{{ selectedIds.length }}개 선택됨</div>
        <div class="modal-actions">
          <BaseButton variant="secondary" @click="$emit('close')">
            취소
          </BaseButton>
          <BaseButton 
            variant="primary" 
            :disabled="selectedIds.length === 0"
            @click="handleConfirm"
          >
            추가 ({{ selectedIds.length }})
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
import SearchInput from './common/SearchInput.vue'
import { allNotices, type Notice } from '../data/notices'

interface Props {
  selectedNotices?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedNotices: () => []
})

const emit = defineEmits<{
  select: [notices: Notice[]]
  close: []
}>()

const searchQuery = ref('')
const selectedIds = ref<string[]>([...props.selectedNotices])

const filteredNotices = computed(() => {
  let notices = [...allNotices]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    notices = notices.filter(notice =>
      notice.title.toLowerCase().includes(query) ||
      notice.content.toLowerCase().includes(query)
    )
  }
  
  return notices
})

const toggleSelection = (notice: Notice) => {
  const index = selectedIds.value.indexOf(notice.id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(notice.id)
  }
}

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleConfirm = () => {
  const selectedNotices = allNotices.filter(notice => 
    selectedIds.value.includes(notice.id)
  )
  emit('select', selectedNotices)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  width: 2rem;
  height: 2rem;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  color: #6b7280;
}

.modal-close:hover {
  background: #e5e7eb;
}

.modal-body {
  flex: 1;
  padding: 1.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  overflow-y: auto;
}

.notice-item {
  position: relative;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.notice-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.notice-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.notice-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.notice-likes {
  color: #ef4444;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.notice-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.notice-preview {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.selection-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.selected-check {
  width: 1.5rem;
  height: 1.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.selection-count {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: 90vh;
  }
  
  .notices-grid {
    grid-template-columns: 1fr;
  }
}
</style>
