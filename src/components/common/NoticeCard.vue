<template>
  <BaseCard 
    class="notice-card"
    :class="{
      'selected': isSelected,
      'selecting-mode': isSelectingMode
    }"
    :hover="true"
    :clickable="clickable"
    @click="$emit('click')"
  >
    <!-- 카드 헤더 -->
    <div class="notice-header">
      <div class="notice-tags">
        <!-- 메인 카테고리 태그 -->
        <div class="main-tags">
          <CategoryTag 
            v-for="tag in tags" 
            :key="tag"
            :category="tag"
            :clickable="false"
          />
        </div>
        
        <!-- 서브 태그 -->
        
      </div>
      <div class="notice-meta">
        <span v-if="isRecommended" class="recommended-badge">오늘 추천</span>
        <span v-if="isPopular" class="popular-badge">인기</span>
        <span class="like-count">❤️ {{ likeCount }}</span>
      </div>
    </div>

    <!-- 카드 콘텐츠 -->
    <div class="notice-content">
      <h3 class="notice-title">{{ title }}</h3>
      <div class="notice-text">
        {{ content }}
        <ul class="notice-sub-items">
          <li v-for="item in subItems" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>

    <!-- 카드 푸터 -->
    <div v-if="showFooter" class="notice-footer">
    
        <div v-if="subTags && subTags.length > 0" class="sub-tags">
          <span 
            v-for="subTag in subTags" 
            :key="subTag"
            class="sub-tag hashtag"
            :style="getSubTagStyle(subTag)"
          >
            #{{ subTag }}
          </span>
        </div>
      </div>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from './BaseCard.vue'
import BaseButton from './BaseButton.vue'
import CategoryTag from './CategoryTag.vue'
import { getMainCategoryFromSubTag, getCategoryMeta, type Category } from '../../constants/categories'

interface Props {
  title: string
  content: string
  tags: Category[]
  subTags?: string[]          // 서브 태그 추가
  author: string
  likeCount: number
  subItems: string[]           // 필수 문자열 배열
  createdAt?: Date
  isRecommended?: boolean
  isPopular?: boolean
  clickable?: boolean
  isSelected?: boolean
  isSelectingMode?: boolean
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: false,
  isRecommended: false,
  isPopular: false,
  isSelected: false,
  isSelectingMode: false,
  showFooter: true
})


// 서브 태그 스타일 계산
const getSubTagStyle = (subTag: string) => {
  const mainCategory = getMainCategoryFromSubTag(subTag)
  if (mainCategory) {
    const meta = getCategoryMeta(mainCategory)
    return {
      color: meta.color,
      backgroundColor: 'transparent'
    }
  }
  // 기본 스타일
  return {
    color: '#6b7280',
    backgroundColor: 'transparent'
  }
}
</script>

<style scoped>
.notice-card {
  min-height: 120px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  border: 2px solid transparent; /* 항상 2px border 유지 */
}

.notice-card.selecting-mode {
  border-color: #e5e7eb;
  cursor: pointer;
}

.notice-card.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f0f7ff 0%, #e1f0ff 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  position: relative;
}

.notice-card.selected::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-top: 20px solid #3b82f6;
  z-index: 1;
}

.notice-card.selected::after {
  content: '✓';
  position: absolute;
  top: 4px;
  right: 4px;
  color: white;
  font-size: 14px;
  font-weight: bold;
  z-index: 2;
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.notice-tags {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.main-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sub-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.sub-tag {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: 1px solid;
  cursor: default;
  line-height: 1.2;
  white-space: nowrap;
}

.sub-tag.hashtag {
  background: none;
  border: none;
  padding: 0.125rem 0.25rem;
  font-weight: 600;
  font-style: italic;
  border-radius: 0;
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.recommended-badge {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.popular-badge {
  background: #f59e0b;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.like-count {
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
}

.notice-content {
  margin-bottom: 1rem;
}

.notice-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.notice-text {
  color: #4b5563;
  line-height: 1.5;
  font-size: 0.875rem;
}

.notice-sub-items {
  margin-top: 0.5rem;
  padding-left: 1rem;
  list-style: disc;
}

.notice-sub-items li {
  margin-bottom: 0.25rem;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  gap: 1rem;
}

.notice-author {
  color: #6b7280;
  font-size: 0.875rem;
  flex: 1;
}

.notice-date {
  color: #9ca3af;
  font-size: 0.875rem;
}

.notice-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .notice-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .notice-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .notice-actions {
    align-self: stretch;
    justify-content: flex-end;
  }
}
</style>
