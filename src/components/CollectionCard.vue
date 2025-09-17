<template>
  <BaseCard :class="$style.collectionCard" hover click @click="$emit('click')">
    <div :class="$style.cardHeader">
      <div :class="[$style.icon, { [$style.defaultCollection]: collection.isDefault }]">
        {{ collection.icon }}
      </div>
      <div :class="$style.actions">
        <button 
          v-if="!collection.isDefault"
          :class="$style.actionBtn"
          @click.stop="$emit('edit')"
          title="편집"
        >
          ✏️
        </button>
        <button 
          v-if="!collection.isDefault"
          :class="$style.actionBtn"
          @click.stop="$emit('delete')"
          title="삭제"
        >
          🗑️
        </button>
      </div>
    </div>
    
    <div :class="$style.cardContent">
      <h3 :class="$style.name">{{ collection.name }}</h3>
      <p :class="$style.description">{{ collection.description }}</p>
      
      <div :class="$style.stats">
        <div :class="$style.statItem">
          <span :class="$style.statIcon">📝</span>
          <span :class="$style.statValue">{{ stats.noticeCount }}</span>
          <span :class="$style.statLabel">문구</span>
        </div>
        <div :class="$style.statItem">
          <span :class="$style.statIcon">❤️</span>
          <span :class="$style.statValue">{{ stats.totalLikes }}</span>
          <span :class="$style.statLabel">좋아요</span>
        </div>
        <div :class="$style.statItem">
          <span :class="$style.statIcon">🏷️</span>
          <span :class="$style.statValue">{{ stats.categories }}</span>
          <span :class="$style.statLabel">태그</span>
        </div>
      </div>
      
      <div v-if="stats.lastUpdated" :class="$style.lastUpdated">
        마지막 업데이트: {{ formatDate(stats.lastUpdated) }}
      </div>
    </div>
    
    <div 
      :class="$style.colorBar"
      :style="{ backgroundColor: collection.color }"
    ></div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from './common/BaseCard.vue'
import type { Collection } from '@/data/collection'
import { getCollectionStats } from '@/data/collection'

interface Props {
  collection: Collection
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
  edit: []
  delete: []
}>()

const stats = computed(() => getCollectionStats(props.collection.id))

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}
</script>

<style module>
.collectionCard {
  position: relative;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  overflow: hidden;
}

.collectionCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.icon.defaultCollection {
  background: linear-gradient(135deg, #fef3c7, #fbbf24);
}

.actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.collectionCard:hover .actions {
  opacity: 1;
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

.cardContent {
  flex: 1;
}

.name {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.statItem {
  display: flex;
  align-items: center;
  gap: 4px;
}

.statIcon {
  font-size: 14px;
}

.statValue {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.statLabel {
  font-size: 12px;
  color: #9ca3af;
}

.lastUpdated {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 12px;
}

.colorBar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.collectionCard:hover .colorBar {
  opacity: 1;
}

@media (max-width: 640px) {
  .stats {
    gap: 16px;
  }
  
  .statItem {
    gap: 2px;
  }
  
  .statValue {
    font-size: 14px;
  }
}
</style>
