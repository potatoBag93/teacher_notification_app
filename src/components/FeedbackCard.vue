<template>
  <BaseCard :class="$style.feedbackCard" hover>
    <div :class="$style.cardHeader">
      <div :class="$style.typeSection">
        <span 
          :class="$style.typeIcon"
          :style="{ backgroundColor: typeInfo.color }"
        >
          {{ typeInfo.icon }}
        </span>
        <div :class="$style.typeInfo">
          <span :class="$style.typeLabel">{{ typeInfo.label }}</span>
          <span :class="[$style.status, $style[feedback.status]]">
            {{ getStatusText(feedback.status) }}
          </span>
        </div>
      </div>
      
      <div :class="$style.meta">
        <span :class="$style.date">
          {{ formatDate(feedback.createdAt) }}
        </span>
        <span 
          v-if="feedback.priority !== 'low'"
          :class="[$style.priority, $style[feedback.priority]]"
        >
          {{ getPriorityText(feedback.priority) }}
        </span>
      </div>
    </div>
    
    <div :class="$style.content">
      <h3 :class="$style.title">{{ feedback.title }}</h3>
      <p :class="$style.description">{{ feedback.description }}</p>
      
      <div v-if="feedback.tags.length > 0" :class="$style.tags">
        <span 
          v-for="tag in feedback.tags"
          :key="tag"
          :class="$style.tag"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
    
    <div v-if="feedback.adminResponse" :class="$style.response">
      <div :class="$style.responseHeader">
        <span :class="$style.responseIcon">💬</span>
        <span :class="$style.responseLabel">관리자 답변</span>
        <span :class="$style.responseDate">
          {{ formatDate(feedback.adminResponseAt!) }}
        </span>
      </div>
      <p :class="$style.responseContent">{{ feedback.adminResponse }}</p>
    </div>
    
    <div :class="$style.footer">
      <div :class="$style.author">
        <span :class="$style.authorIcon">👤</span>
        {{ feedback.userName || '익명' }}
      </div>
      
      <div :class="$style.actions">
        <button 
          :class="[$style.voteBtn, { [$style.voted]: feedback.hasVoted }]"
          @click="$emit('vote')"
          :disabled="feedback.hasVoted"
        >
          <span :class="$style.voteIcon">
            {{ feedback.hasVoted ? '❤️' : '🤍' }}
          </span>
          <span :class="$style.voteCount">{{ feedback.votes }}</span>
        </button>
        
        <button 
          :class="$style.shareBtn"
          @click="$emit('share')"
          title="공유하기"
        >
          📤
        </button>
        
        <button 
          v-if="canEdit"
          :class="$style.editBtn"
          @click="$emit('edit')"
          title="수정하기"
        >
          ✏️
        </button>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from './common/BaseCard.vue'
import type { Feedback, FeedbackStatus, FeedbackPriority } from '@/data/feedback'
import { feedbackTypes } from '@/data/feedback'

interface Props {
  feedback: Feedback
  canEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: false
})

const emit = defineEmits<{
  vote: []
  share: []
  edit: []
}>()

const typeInfo = computed(() => {
  return feedbackTypes.find(type => type.key === props.feedback.type) || feedbackTypes[5]
})

const getStatusText = (status: FeedbackStatus): string => {
  const statusMap = {
    pending: '대기중',
    'in-progress': '진행중',
    completed: '완료',
    rejected: '거절됨'
  }
  return statusMap[status]
}

const getPriorityText = (priority: FeedbackPriority): string => {
  const priorityMap = {
    low: '낮음',
    medium: '보통',
    high: '높음',
    urgent: '긴급'
  }
  return priorityMap[priority]
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style module>
.feedbackCard {
  padding: 20px;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.feedbackCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.typeSection {
  display: flex;
  align-items: center;
  gap: 12px;
}

.typeIcon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  font-weight: bold;
}

.typeInfo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.typeLabel {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  width: fit-content;
}

.status.pending {
  background: #fef3c7;
  color: #92400e;
}

.status.inProgress {
  background: #dbeafe;
  color: #1e40af;
}

.status.completed {
  background: #dcfce7;
  color: #166534;
}

.status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.date {
  font-size: 12px;
  color: #9ca3af;
}

.priority {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority.medium {
  background: #fef3c7;
  color: #92400e;
}

.priority.high {
  background: #fed7d7;
  color: #c53030;
}

.priority.urgent {
  background: #fecaca;
  color: #991b1b;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.content {
  margin-bottom: 16px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.description {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 12px;
  color: #6366f1;
  background: #e0e7ff;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.response {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 3px solid #10b981;
}

.responseHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.responseIcon {
  font-size: 14px;
}

.responseLabel {
  font-size: 12px;
  font-weight: 600;
  color: #059669;
}

.responseDate {
  font-size: 11px;
  color: #6b7280;
  margin-left: auto;
}

.responseContent {
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

.author {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.authorIcon {
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 8px;
}

.voteBtn,
.shareBtn,
.editBtn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.voteBtn {
  background: #f3f4f6;
  color: #374151;
}

.voteBtn:hover:not(:disabled) {
  background: #fef3c7;
  transform: scale(1.05);
}

.voteBtn.voted {
  background: #fef3c7;
  color: #92400e;
}

.voteBtn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.voteIcon {
  font-size: 14px;
}

.voteCount {
  font-weight: 600;
}

.shareBtn,
.editBtn {
  background: #e5e7eb;
  color: #4b5563;
  padding: 8px;
  font-size: 14px;
}

.shareBtn:hover,
.editBtn:hover {
  background: #d1d5db;
  transform: scale(1.1);
}

@media (max-width: 640px) {
  .cardHeader {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .meta {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .actions {
    justify-content: center;
  }
}
</style>
