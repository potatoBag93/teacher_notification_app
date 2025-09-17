<template>
  <div :class="$style.chart">
    <h3 :class="$style.title">{{ title }}</h3>
    <div :class="$style.chartContainer">
      <svg 
        :class="$style.svg" 
        viewBox="0 0 200 200"
        :style="{ transform: 'rotate(-90deg)' }"
      >
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#e5e7eb"
          stroke-width="12"
        />
        <circle
          v-for="(segment, index) in chartSegments"
          :key="index"
          cx="100"
          cy="100"
          r="80"
          fill="none"
          :stroke="segment.color"
          stroke-width="12"
          :stroke-dasharray="`${segment.length} ${circumference - segment.length}`"
          :stroke-dashoffset="segment.offset"
          :class="$style.segment"
          stroke-linecap="round"
        />
      </svg>
      <div :class="$style.centerText">
        <div :class="$style.total">{{ total }}</div>
        <div :class="$style.label">총 사용</div>
      </div>
    </div>
    <div :class="$style.legend">
      <div 
        v-for="item in data" 
        :key="item.category"
        :class="$style.legendItem"
      >
        <div 
          :class="$style.legendColor"
          :style="{ backgroundColor: item.color }"
        ></div>
        <span :class="$style.legendText">{{ item.category }}</span>
        <span :class="$style.legendValue">{{ item.count }}회</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryUsage } from '@/data/dashboard'

interface Props {
  title: string
  data: CategoryUsage[]
}

const props = defineProps<Props>()

const total = computed(() => 
  props.data.reduce((sum, item) => sum + item.count, 0)
)

const circumference = 2 * Math.PI * 80

const chartSegments = computed(() => {
  let currentOffset = 0
  return props.data.map(item => {
    const length = (item.count / total.value) * circumference
    const segment = {
      color: item.color,
      length,
      offset: -currentOffset
    }
    currentOffset += length
    return segment
  })
})
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
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
}

.svg {
  width: 100%;
  height: 100%;
}

.segment {
  transition: stroke-width 0.3s ease;
}

.segment:hover {
  stroke-width: 16;
}

.centerText {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.total {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legendItem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.legendColor {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legendText {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.legendValue {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}
</style>
