<template>
  <div class="ticker-wrapper">
    <div class="ticker-container">
      <div class="ticker-header">
        <div class="ticker-label">최근 사용된 문구들</div>
        <div class="ticker-controls">
          <button @click="decreaseSpeed" class="control-btn" title="느리게">-</button>
          <span class="speed-display">{{ speed }}</span>
          <button @click="increaseSpeed" class="control-btn" title="빠르게">+</button>
          <button @click="toggleTicker" class="control-btn" :title="isRunning ? '일시정지' : '재생'">{{ isRunning ? '❚❚' : '▶' }}</button>
        </div>
      </div>
      <div class="ticker-stream" ref="tickerStream">
        <div class="ticker-track" ref="tickerTrack" :style="{ transform: `translateX(${x}px)` }">
          <span
            v-for="(notice, idx) in repeatedNotices"
            :key="idx"
            class="ticker-item"
            :class="{ selected: isSelected(notice) }"
            @click="toggleSelection(notice)"
          >
            <span class="notice-content">{{ notice.content }}</span>
            <button class="report-btn" @click.stop="reportNotice(notice)">신고</button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  notices: { content: string; user?: string; timestamp?: string }[]
  selectedItems: string[]
}>()

const emit = defineEmits(['toggle-selection', 'report-notice'])

const toggleSelection = (notice: { content: string }) => {
  emit('toggle-selection', notice.content)
}

const reportNotice = (notice: { content: string }) => {
  emit('report-notice', notice.content)
  alert(`'${notice.content}' 문구가 신고되었습니다.`)
}

const isSelected = (notice: { content: string }) => {
  return props.selectedItems.includes(notice.content)
}

const repeatedNotices = computed(() => {
  if (props.notices.length === 0) return []
  return [...props.notices, ...props.notices]
})

const tickerStream = ref<HTMLElement | null>(null)
const tickerTrack = ref<HTMLElement | null>(null)
let animationFrame: number | null = null
const speed = ref(40) // px per second
const isRunning = ref(true)
const x = ref(0)
let lastTime: number | null = null

const increaseSpeed = () => {
  speed.value += 20
}

const decreaseSpeed = () => {
  speed.value = Math.max(20, speed.value - 20)
}

const toggleTicker = () => {
  isRunning.value = !isRunning.value
  if (isRunning.value) {
    lastTime = performance.now()
    animate(lastTime)
  } else {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  }
}

const animate = (time: number) => {
  if (!tickerTrack.value || !isRunning.value) return

  if (lastTime) {
    const delta = (time - lastTime) / 1000
    x.value -= speed.value * delta

    const trackWidth = tickerTrack.value.scrollWidth / 2
    if (trackWidth > 0 && x.value <= -trackWidth) {
      x.value += trackWidth
    }
  }
  
  lastTime = time
  animationFrame = requestAnimationFrame(animate)
}

const startTicker = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  x.value = 0
  lastTime = null
  
  nextTick(() => {
    if (tickerTrack.value && tickerStream.value && tickerTrack.value.scrollWidth > tickerStream.value.clientWidth) {
      isRunning.value = true
      lastTime = performance.now()
      animate(lastTime)
    } else {
      isRunning.value = false
    }
  })
}

onMounted(() => {
  startTicker()
  window.addEventListener('resize', startTicker)
})

onUnmounted(() => {
  window.removeEventListener('resize', startTicker)
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.ticker-wrapper {
  margin: 24px 0 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.ticker-container {
  width: 100%;
}
.ticker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f1f5f9;
}
.ticker-label {
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  padding: 6px 16px;
  display: inline-block;
  border-radius: 0 0 8px 0;
  letter-spacing: 0.5px;
}
.ticker-controls {
  display: flex;
  align-items: center;
  padding-right: 16px;
  gap: 8px;
}
.control-btn {
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  color: #334155;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  transition: background-color 0.2s;
  padding: 0;
}
.control-btn:hover {
  background: #cbd5e1;
}
.speed-display {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  min-width: 25px;
  text-align: center;
}
.ticker-stream {
  width: 100%;
  position: relative;
  height: 50px; /* 1행을 보이도록 높이 조정 */
  overflow: hidden;
  background: #f1f5f9;
}
.ticker-track {
  display: grid;
  grid-auto-flow: column;
  gap: 16px 16px; /* row-gap column-gap: 행 사이 16px, 열 사이 16px */
  height: 100%;
  padding: 8px 0;
  will-change: transform;
  width: max-content; /* Ensure track is as wide as its content */
}
.ticker-item {
  display: inline-flex;
  align-items: center;
  font-size: 15px;
  color: #334155;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  padding: 4px 8px;
  white-space: nowrap; /* Prevent items from wrapping internally */
  transition:
    background-color 0.2s ease-in-out,
    color 0.2s ease-in-out;
}
.ticker-item:hover {
  background-color: #e2e8f0;
}
.ticker-item.selected {
  background-color: #bfdbfe;
  color: #1e3a8a;
  font-weight: 600;
}
.notice-content {
  font-weight: 500;
  margin-right: 8px;
}
.report-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  margin-left: 8px;
}

.ticker-item:hover .report-btn {
  opacity: 1;
}

.report-btn:hover {
  background-color: #dc2626;
}

.selected-notices-container {
  padding: 16px;
  background-color: #f8fafc;
  border-top: 1px solid #e5e7eb;
}
.selected-notices-header {
  font-weight: 600;
  font-size: 15px;
  color: #1f2937;
  margin-bottom: 12px;
}
.selected-notices-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.selected-notice-item {
  display: flex;
  align-items: center;
  background-color: #e0e7ff;
  color: #3730a3;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.remove-btn {
  margin-left: 8px;
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  padding: 0 2px;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.remove-btn:hover {
  opacity: 1;
}
</style>