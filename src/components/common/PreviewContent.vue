<template>
  <div class="preview-content">
    <div class="notice-header">
      <h2 class="notice-date">{{ formattedDate }}</h2>
      <div class="block-count">{{ notices.length }}개 항목</div>
    </div>
    
    <div v-if="notices.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p class="empty-text">편집할 문구를 추가해주세요</p>
      <p class="empty-subtext">왼쪽에서 문구를 선택하거나 새로 작성하세요</p>
    </div>
    
    <div v-else class="notice-body">
      <div 
        v-for="(notice, index) in sortedNotices"
        :key="notice.id"
        class="notice-item"
      >
        <!-- 제목 -->
        <div v-if="notice.title && notice.title.trim()" class="item-header">
          <h4 class="item-title">
            <span v-if="format === 'numbered'" class="item-number">
              {{ index + 1 }}.
            </span>
            {{ notice.title }}
          </h4>
        </div>
        
        <!-- 내용 -->
        <p v-if="notice.content && notice.content.trim()" class="item-content">
          {{ notice.content }}
        </p>
        
        <!-- 하위 목록 -->
        <ul v-if="notice.subItems && notice.subItems.length > 0 && hasValidSubItems(notice.subItems)" class="item-sub-list">
          <li 
            v-for="subItem in notice.subItems.filter(item => item && item.trim())"
            :key="subItem"
            class="item-sub-item"
          >
            <span v-if="format === 'bullet'" class="bullet">•</span>
            <span v-else class="dash">-</span>
            {{ subItem }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Notice } from '../../data/notices'

interface Props {
  notices: Notice[]
  format: 'simple' | 'numbered' | 'bullet'
  theme: 'light' | 'dark' | 'paper'
}

const props = defineProps<Props>()

// 정렬된 문구 목록 (content가 있는 것만)
const sortedNotices = computed(() => {
  return props.notices.filter(notice => 
    (notice.title && notice.title.trim()) || 
    (notice.content && notice.content.trim()) ||
    (notice.subItems && hasValidSubItems(notice.subItems))
  )
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
</script>

<style scoped>
.preview-content {
  width: 100%;
  height: 100%;
}

.notice-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid currentColor;
}

.notice-date {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.block-count {
  opacity: 0.7;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  opacity: 0.6;
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
  margin: 0;
  line-height: 1.4;
  border-left: 4px solid currentColor;
  padding-left: 0.75rem;
}

.item-number {
  margin-right: 0.5rem;
  opacity: 0.8;
}

.item-content {
  font-size: 1rem;
  line-height: 1.7;
  margin: 0 0 1rem 0;
  padding-left: 1rem;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border-left: 3px solid rgba(0, 0, 0, 0.2);
}

.item-sub-list {
  list-style: none;
  padding-left: 1.5rem;
  margin: 0;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-left: 3px solid rgba(0, 0, 0, 0.15);
}

.item-sub-item {
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.item-sub-item:last-child {
  margin-bottom: 0;
}

.bullet, .dash {
  font-weight: bold;
  margin-right: 0.5rem;
  opacity: 0.7;
}

/* 테마별 스타일 조정 */
:deep(.theme-dark) .item-content {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 255, 255, 0.3);
}

:deep(.theme-dark) .item-sub-list {
  background: rgba(255, 255, 255, 0.05);
  border-left-color: rgba(255, 255, 255, 0.2);
}

:deep(.theme-paper) .item-content {
  background: rgba(69, 26, 3, 0.05);
  border-left-color: rgba(69, 26, 3, 0.2);
}

:deep(.theme-paper) .item-sub-list {
  background: rgba(69, 26, 3, 0.03);
  border-left-color: rgba(69, 26, 3, 0.15);
}
</style>
