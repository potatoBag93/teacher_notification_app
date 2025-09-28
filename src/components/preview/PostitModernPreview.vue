<template>
  <div class="postit-modern-preview">
    <div class="postit-header">알뭐</div>
    <div class="postit-body postit-grid">
      <div
        v-for="(notice, idx) in notices"
        :key="idx"
        class="postit-note"
        :class="categoryClass(notice)"
        :style="{ '--rotation': getRotation(idx) }"
        @click="openModal(idx)"
      >
        <div class="postit-header">
          <div class="postit-number">{{ idx + 1 }}</div>
          <div class="postit-category">{{ notice.category || '일반사항' }}</div>
        </div>
        <div class="postit-title">{{ notice.title }}</div>
        <div class="postit-content">{{ notice.content }}</div>
        <ul v-if="notice.subItems && notice.subItems.length" class="postit-items">
          <li v-for="(sub, sidx) in notice.subItems" :key="sidx">{{ sub }}</li>
        </ul>
        <div class="postit-footer">
          <div class="postit-tags">
            <span v-for="tag in notice.tags || []" :key="tag" class="postit-tag">{{ tag }}</span>
          </div>
          <div v-if="notice.star !== undefined">⭐ {{ notice.star }}</div>
        </div>
      </div>
    </div>

    <!-- 모달 오버레이 -->
    <div v-if="modalIdx !== null" class="modal-overlay active" @click.self="closeModal">
      <div class="modal-postit" :class="categoryClass(currentNotice)">
        <button class="modal-close" @click="closeModal">×</button>
        <div class="postit-header">
          <div class="postit-number">{{ modalIdx + 1 }}</div>
          <div class="postit-category">{{ currentNotice.category || '일반사항' }}</div>
        </div>
        <div class="postit-title">{{ currentNotice.title }}</div>
        <div class="postit-content">{{ currentNotice.content }}</div>
        <ul v-if="currentNotice.subItems && currentNotice.subItems.length" class="postit-items">
          <li v-for="(sub, sidx) in currentNotice.subItems" :key="sidx">{{ sub }}</li>
        </ul>
        <div class="postit-footer">
          <div class="postit-tags">
            <span v-for="tag in currentNotice.tags || []" :key="tag" class="postit-tag">{{ tag }}</span>
          </div>
          <div v-if="currentNotice.star !== undefined">⭐ {{ currentNotice.star }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Notice } from '../../data/notices'

const props = defineProps<{ notices: any[] }>()

const modalIdx = ref<number|null>(null)
const openModal = (idx: number) => {
  modalIdx.value = idx
  document.body.style.overflow = 'hidden'
}
const closeModal = () => {
  modalIdx.value = null
  document.body.style.overflow = ''
}
const currentNotice = computed(() =>
  modalIdx.value !== null ? props.notices[modalIdx.value] : {} as any
)

function categoryClass(notice: any) {
  switch (notice.category) {
    case '안전보건': return 'safety';
    case '학습관리': return 'learning';
    case '체육건강': return 'health';
    case '행사활동': return 'event';
    case '가정소통': return 'notice';
    case '일반사항': return 'general';
    default: return 'general';
  }
}
function getRotation(idx: number) {
  if (idx % 3 === 0) return '-1deg';
  if (idx % 2 === 0) return '1deg';
  return '-0.5deg';
}

// ESC로 닫기
const handleKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && modalIdx.value !== null) closeModal()
}
onMounted(() => document.addEventListener('keydown', handleKey))
onUnmounted(() => document.removeEventListener('keydown', handleKey))
</script>
/* 모달 오버레이 및 확대 포스트잇 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 1;
  visibility: visible;
  transition: all 0.3s ease;
  padding: 2rem;
}
.modal-postit {
  position: relative;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border-left: 6px solid var(--accent-color);
  transform: scale(1) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  color: #64748b;
  transition: all 0.2s ease;
}
.modal-close:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #374151;
}
.modal-postit .postit-header {
  margin-bottom: 1.5rem;
}
.modal-postit .postit-number {
  width: 40px;
  height: 40px;
  font-size: 1rem;
}
.modal-postit .postit-category {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
.modal-postit .postit-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.modal-postit .postit-content {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  line-height: 1.7;
}
.modal-postit .postit-items {
  margin-bottom: 1.5rem;
}
.modal-postit .postit-items li {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  line-height: 1.6;
}
.modal-postit .postit-footer {
  padding-top: 1rem;
  font-size: 0.875rem;
}
.modal-postit .postit-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
}

<style scoped>
/* 전체 배경 및 그리드 */
.postit-modern-preview {
  background: linear-gradient(135deg, #fffbe7 0%, #ffe7e7 100%);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 2rem 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
}
.postit-header {
  font-size: 2rem;
  font-weight: 700;
  color: #eab308;
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: 0.1em;
}
.postit-body.postit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}
.postit-note {
  position: relative;
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-left: 4px solid var(--accent-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: rotate(var(--rotation));
  cursor: pointer;
}
.postit-note:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
.postit-note::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0 0.75rem 0 20px;
  opacity: 0.3;
}
/* 카테고리별 색상 */
.postit-note.safety {
  --accent-color: #dc2626;
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
}
.postit-note.learning {
  --accent-color: #16a34a;
  background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
}
.postit-note.health {
  --accent-color: #9333ea;
  background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%);
}
.postit-note.event {
  --accent-color: #2563eb;
  background: linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%);
}
.postit-note.notice {
  --accent-color: #ca8a04;
  background: linear-gradient(135deg, #fefce8 0%, #fef08a 100%);
}
.postit-note.general {
  --accent-color: #64748b;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}
.postit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.postit-number {
  background: var(--accent-color);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.postit-category {
  background: rgba(255, 255, 255, 0.8);
  color: var(--accent-color);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--accent-color);
}
.postit-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}
.postit-content {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1rem;
}
.postit-items {
  list-style: none;
  margin-bottom: 1rem;
}
.postit-items li {
  position: relative;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
}
.postit-items li::before {
  content: '•';
  color: var(--accent-color);
  font-weight: bold;
  position: absolute;
  left: 0;
}
.postit-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 0.75rem;
  color: #94a3b8;
}
.postit-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}
.postit-tag {
  background: rgba(255, 255, 255, 0.9);
  color: var(--accent-color);
  padding: 0.125rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.625rem;
  border: 1px solid var(--accent-color);
}
</style>
