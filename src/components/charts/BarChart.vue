<template>
  <div :class="$style.chart">
    <h3 :class="$style.title">{{ title }}</h3>
    <div :class="$style.chartContainer">
      <svg :class="$style.svg" viewBox="0 0 400 150">
        <!-- Grid lines -->
        <defs>
          <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="400" height="150" fill="url(#grid)" />
        
        <!-- Chart area -->
        <g transform="translate(40, 20)">
          <!-- Y-axis -->
          <line x1="0" y1="0" x2="0" y2="110" stroke="#e5e7eb" stroke-width="2"/>
          
          <!-- X-axis -->
          <line x1="0" y1="110" x2="320" y2="110" stroke="#e5e7eb" stroke-width="2"/>
          
          <!-- Data bars -->
          <g v-for="(item, index) in chartData" :key="index">
            <rect
              :x="index * barWidth + barPadding"
              :y="110 - item.height"
              :width="barWidth - barPadding * 2"
              :height="item.height"
              :fill="barColor"
              :class="$style.bar"
              rx="2"
            />
            <text
              :x="index * barWidth + barWidth / 2"
              y="125"
              text-anchor="middle"
              :class="$style.label"
              font-size="10"
              fill="#6b7280"
            >
              {{ formatDate(item.date) }}
            </text>
            <text
              :x="index * barWidth + barWidth / 2"
              :y="110 - item.height - 5"
              text-anchor="middle"
              :class="$style.value"
              font-size="10"
              fill="#374151"
            >
              {{ item.count }}
            </text>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UsageHistory } from '@/data/dashboard'

interface Props {
  title: string
  data: UsageHistory[]
  barColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  barColor: '#3b82f6'
})

const maxValue = computed(() => 
  Math.max(...props.data.map(item => item.count), 1)
)

const barWidth = computed(() => 320 / props.data.length)
const barPadding = 2

const chartData = computed(() => 
  props.data.map(item => ({
    ...item,
    height: (item.count / maxValue.value) * 90
  }))
)

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<style module>
.chart {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
  text-align: center;
}

.chartContainer {
  width: 100%;
  height: 200px;
}

.svg {
  width: 100%;
  height: 100%;
}

.bar {
  transition: opacity 0.3s ease;
}

.bar:hover {
  opacity: 0.8;
}

.label {
  font-family: system-ui, sans-serif;
}

.value {
  font-family: system-ui, sans-serif;
  font-weight: 500;
}
</style>
