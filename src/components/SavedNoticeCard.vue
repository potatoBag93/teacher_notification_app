<template>
  <BaseCard :class="$style.savedNoticeCard" hover>
    <div :class="$style.cardHeader">
      <div :class="$style.titleSection">
        <h3 :class="$style.title">{{ notice.title }}</h3>
        <div :class="$style.meta">
          <span :class="$style.author">{{ notice.author }}</span>
          <span :class="$style.separator">•</span>
          <span :class="$style.savedDate">
            {{ formatDate(notice.savedAt) }} 저장
          </span>
        </div>
      </div>
      
      <div :class="$style.actions">
        <button 
          :class="[$style.favoriteBtn, { [$style.favorited]: notice.isFavorite }]"
          @click.stop="$emit('toggleFavorite')"
          title="즐겨찾기"
        >
          {{ notice.isFavorite ? '❤️' : '🤍' }}
        </button>
        <button 
          :class="$style.actionBtn"
          @click.stop="$emit('edit')"
          title="편집"
        >
          ✏️
        </button>
        <button 
          :class="$style.actionBtn"
          @click.stop="$emit('remove')"
          title="컬렉션에서 제거"
        >
          🗑️
        </button>
      </div>
    </div>
    
    <div :class="$style.content">
      <p :class="$style.preview">{{ notice.preview }}</p>
      
      <div :class="$style.tags">
        <CategoryTag 
          v-for="tag in notice.tags" 
          :key="tag"
          :category="tag"
          size="small"
        />
      </div>
      
      <div v-if="notice.notes" :class="$style.notes">
        <div :class="$style.notesLabel">📝 메모</div>
        <p :class="$style.notesContent">{{ notice.notes }}</p>
      </div>
    </div>
    
    <div :class="$style.footer">
      <div :class="$style.stats">
        <span :class="$style.stat">
          <span :class="$style.statIcon">❤️</span>
          {{ notice.likeCount }}
        </span>
      </div>
      
      <div :class="$style.footerActions">
        <BaseButton 
          variant="ghost" 
          size="sm"
          @click="$emit('view')"
        >
          상세보기
        </BaseButton>
        <BaseButton 
          variant="primary" 
          size="sm"
          @click="$emit('use')"
        >
          사용하기
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from './common/BaseCard.vue'
import BaseButton from './common/BaseButton.vue'
import CategoryTag from './common/CategoryTag.vue'
import type { SavedNotice } from '@/data/collection'

interface Props {
  notice: SavedNotice
}

defineProps<Props>()

const emit = defineEmits<{
  toggleFavorite: []
  edit: []
  remove: []
  view: []
  use: []
}>()

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}
</script>

<style module>
.savedNoticeCard {
  padding: 20px;
  transition: all 0.3s ease;
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.titleSection {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.author {
  font-weight: 500;
}

.separator {
  color: #d1d5db;
}

.savedDate {
  color: #9ca3af;
}

.actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  flex-shrink: 0;
}

.savedNoticeCard:hover .actions {
  opacity: 1;
}

.favoriteBtn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.favoriteBtn:hover {
  background: #fef3c7;
  transform: scale(1.1);
}

.favoriteBtn.favorited {
  background: #fef3c7;
}

.actionBtn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.actionBtn:hover {
  background: #e5e7eb;
  transform: scale(1.1);
}

.content {
  margin-bottom: 16px;
}

.preview {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.notes {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid #3b82f6;
}

.notesLabel {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.notesContent {
  font-size: 14px;
  color: #374151;
  margin: 0;
  line-height: 1.4;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
}

.statIcon {
  font-size: 12px;
}

.footerActions {
  display: flex;
  gap: 8px;
}

@media (max-width: 640px) {
  .cardHeader {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .actions {
    align-self: flex-end;
    opacity: 1;
  }
  
  .footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .footerActions {
    justify-content: stretch;
  }
  
  .footerActions button {
    flex: 1;
  }
}
</style>
