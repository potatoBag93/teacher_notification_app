<template>
  <div :class="$style.achievement">
    <div :class="[$style.icon, { [$style.unlocked]: achievement.unlocked }]">
      {{ achievement.icon }}
    </div>
    <div :class="$style.content">
      <h4 :class="[$style.title, { [$style.unlocked]: achievement.unlocked }]">
        {{ achievement.title }}
      </h4>
      <p :class="$style.description">{{ achievement.description }}</p>
      <div v-if="achievement.unlocked && achievement.unlockedAt" :class="$style.date">
        {{ formatDate(achievement.unlockedAt) }} 달성
      </div>
    </div>
    <div v-if="achievement.unlocked" :class="$style.badge">
      ✓
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Achievement } from '@/data/dashboard'

interface Props {
  achievement: Achievement
}

defineProps<Props>()

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}
</script>

<style module>
.achievement {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #f3f4f6;
  transition: all 0.3s ease;
}

.achievement:hover {
  border-color: #e5e7eb;
  transform: translateY(-1px);
}

.icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f9fafb;
  filter: grayscale(100%);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.icon.unlocked {
  filter: none;
  opacity: 1;
  background: #fef3c7;
}

.content {
  flex: 1;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #9ca3af;
  transition: color 0.3s ease;
}

.title.unlocked {
  color: #1f2937;
}

.description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.date {
  font-size: 12px;
  color: #f59e0b;
  font-weight: 500;
}

.badge {
  width: 24px;
  height: 24px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}
</style>
