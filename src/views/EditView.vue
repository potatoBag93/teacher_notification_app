<template>
  <AppLayout @search="handleSearch">
    <div class="edit-page">
      <!-- 편집 도구바 -->
      <div class="edit-toolbar">
        <div class="toolbar-left">
          <h1 class="page-title">📝 알림장 편집</h1>
          <span class="block-counter">{{ editBlocks.length }}개 선택됨</span>
        </div>
        
        <div class="toolbar-actions">
          <BaseButton 
            variant="outline" 
            size="sm"
            @click="showNoticeSelector = true"
          >
            메인에서 가져오기
          </BaseButton>
          <BaseButton 
            variant="outline" 
            size="sm"
            @click="addRandomNotice"
          >
            🎲 랜덤 추가
          </BaseButton>
          <BaseButton 
            variant="outline" 
            size="sm"
            @click="aiFormat"
          >
            🤖 AI 정리
          </BaseButton>
          <BaseButton 
            variant="secondary"
            @click="saveSession"
          >
            💾 임시저장
          </BaseButton>
          <BaseButton 
            variant="primary"
            @click="finalizeNotice"
          >
            🌐 완료
          </BaseButton>
        </div>
      </div>

      <!-- 메인 편집 영역 -->
      <div class="edit-container">
        <!-- 좌측: 선택된 블록들 (40%) -->
        <div class="blocks-section">
          <div class="section-header">
            <h2 class="section-title">📦 선택된 블록들</h2>
            <div class="section-actions">
              <BaseButton 
                variant="outline" 
                size="sm"
                :disabled="editBlocks.length === 0"
                @click="clearAllBlocks"
              >
                🗑️ 전체 삭제
              </BaseButton>
              <BaseButton 
                variant="outline" 
                size="sm"
                :disabled="editBlocks.length < 2"
                @click="mergeBlocks"
              >
                🔗 블록 병합
              </BaseButton>
            </div>
          </div>
          
          <div 
            class="blocks-container"
            @dragover="handleDragOver"
            @drop="handleDrop"
          >
            <div v-if="editBlocks.length === 0" class="empty-blocks">
              <div class="empty-icon">📝</div>
              <p class="empty-text">편집할 문구를 추가해주세요</p>
              <p class="empty-subtext">
                드래그 앤 드롭으로 순서를 변경할 수 있습니다<br>
                최대 10개까지 선택 가능
              </p>
            </div>
            
            <EditBlock
              v-for="block in sortedBlocks"
              :key="block.id"
              :block="block"
              :is-dragging="draggedBlockId === block.id"
              @update="updateBlock"
              @remove="removeBlock(block.id)"
              @drag-start="handleBlockDragStart"
              @drag-end="handleBlockDragEnd"
            />
          </div>
        </div>

        <!-- 우측: 미리보기 (60%) -->
        <div class="preview-section">
          <NoticePreview :blocks="editBlocks" />
        </div>
      </div>

      <!-- 문구 선택 모달 -->
      <NoticeSelector 
        v-if="showNoticeSelector"
        :selected-notices="selectedNoticeIds"
        @select="addNoticeBlocks"
        @close="showNoticeSelector = false"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import BaseButton from '../components/common/BaseButton.vue'
import EditBlock from '../components/EditBlock.vue'
import NoticePreview from '../components/NoticePreview.vue'
import NoticeSelector from '../components/NoticeSelector.vue'
import type { EditBlock as EditBlockType, EditSession } from '../data/edit'
import { noticeToEditBlock } from '../data/edit'
import { allNotices } from '../data/notices'

const router = useRouter()

// 상태 관리
const editBlocks = ref<EditBlockType[]>([])
const draggedBlockId = ref<string | null>(null)
const showNoticeSelector = ref(false)
const currentSession = ref<EditSession | null>(null)

// 선택된 문구 ID 목록
const selectedNoticeIds = computed(() => {
  return editBlocks.value
    .map(block => block.id.split('-')[1])
    .filter(id => id && id !== 'custom')
})

// 정렬된 블록 목록
const sortedBlocks = computed(() => {
  return [...editBlocks.value].sort((a, b) => a.order - b.order)
})

// 블록 업데이트
const updateBlock = (updatedBlock: EditBlockType) => {
  const index = editBlocks.value.findIndex(block => block.id === updatedBlock.id)
  if (index !== -1) {
    editBlocks.value[index] = { ...updatedBlock }
  }
}

// 블록 제거
const removeBlock = (blockId: string) => {
  editBlocks.value = editBlocks.value.filter(block => block.id !== blockId)
  reorderBlocks()
}

// 블록 순서 재정렬
const reorderBlocks = () => {
  editBlocks.value.forEach((block, index) => {
    block.order = index
  })
}

// 전체 블록 삭제
const clearAllBlocks = () => {
  if (confirm('모든 블록을 삭제하시겠습니까?')) {
    editBlocks.value = []
  }
}

// 블록 병합 (간단한 구현)
const mergeBlocks = () => {
  if (editBlocks.value.length < 2) return
  
  const firstBlock = editBlocks.value[0]
  const otherBlocks = editBlocks.value.slice(1)
  
  const mergedContent = [firstBlock.content, ...otherBlocks.map(b => b.content)].join('\n\n')
  const mergedSubItems = [
    ...(firstBlock.subItems || []),
    ...otherBlocks.flatMap(b => b.subItems || [])
  ]
  const mergedTags = Array.from(new Set([
    ...firstBlock.tags,
    ...otherBlocks.flatMap(b => b.tags)
  ]))
  
  const mergedBlock: EditBlockType = {
    ...firstBlock,
    title: `${firstBlock.title} (병합됨)`,
    content: mergedContent,
    subItems: mergedSubItems.length > 0 ? mergedSubItems : [],
    tags: mergedTags.slice(0, 3) // 최대 3개 태그만
  }
  
  editBlocks.value = [mergedBlock]
}

// 랜덤 문구 추가
const addRandomNotice = () => {
  if (editBlocks.value.length >= 10) {
    alert('최대 10개까지만 선택할 수 있습니다.')
    return
  }
  
  const availableNotices = allNotices.filter(notice => 
    !selectedNoticeIds.value.includes(notice.id)
  )
  
  if (availableNotices.length === 0) {
    alert('추가할 수 있는 문구가 없습니다.')
    return
  }
  
  const randomNotice = availableNotices[Math.floor(Math.random() * availableNotices.length)]
  const newBlock = noticeToEditBlock(randomNotice, editBlocks.value.length)
  
  editBlocks.value.push(newBlock)
}

// AI 정리 (시뮬레이션)
const aiFormat = async () => {
  if (editBlocks.value.length === 0) {
    alert('정리할 블록이 없습니다.')
    return
  }
  
  alert('AI 정리 기능은 개발 중입니다.')
  // 실제로는 AI API를 호출하여 내용을 정리하고 최적화
}

// 문구 선택기에서 문구 추가
const addNoticeBlocks = (notices: any[]) => {
  const newBlocks = notices.map((notice, index) => 
    noticeToEditBlock(notice, editBlocks.value.length + index)
  )
  
  // 최대 10개 제한
  const totalBlocks = editBlocks.value.length + newBlocks.length
  if (totalBlocks > 10) {
    const allowedCount = 10 - editBlocks.value.length
    if (allowedCount > 0) {
      editBlocks.value.push(...newBlocks.slice(0, allowedCount))
      alert(`최대 10개까지만 선택할 수 있어 ${allowedCount}개만 추가되었습니다.`)
    } else {
      alert('최대 10개까지만 선택할 수 있습니다.')
    }
  } else {
    editBlocks.value.push(...newBlocks)
  }
  
  showNoticeSelector.value = false
}

// 드래그 앤 드롭 처리
const handleBlockDragStart = (blockId: string) => {
  draggedBlockId.value = blockId
}

const handleBlockDragEnd = () => {
  draggedBlockId.value = null
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  
  if (!draggedBlockId.value) return
  
  const draggedBlock = editBlocks.value.find(block => block.id === draggedBlockId.value)
  if (!draggedBlock) return
  
  // 간단한 드롭 처리 - 실제로는 더 정교한 위치 계산 필요
  const draggedIndex = editBlocks.value.findIndex(block => block.id === draggedBlockId.value)
  const targetIndex = editBlocks.value.length - 1
  
  if (draggedIndex !== targetIndex) {
    editBlocks.value.splice(draggedIndex, 1)
    editBlocks.value.splice(targetIndex, 0, draggedBlock)
    reorderBlocks()
  }
  
  draggedBlockId.value = null
}

// 세션 저장
const saveSession = () => {
  const session: EditSession = {
    id: `session-${Date.now()}`,
    blocks: [...editBlocks.value],
    createdAt: new Date(),
    lastModified: new Date()
  }
  
  localStorage.setItem('edit-session', JSON.stringify(session))
  alert('임시저장되었습니다.')
}

// 세션 로드
const loadSession = () => {
  const savedSession = localStorage.getItem('edit-session')
  if (savedSession) {
    try {
      const session = JSON.parse(savedSession) as EditSession
      editBlocks.value = session.blocks
      currentSession.value = session
    } catch (error) {
      console.error('세션 로드 실패:', error)
    }
  }
}

// 최종 완료
const finalizeNotice = () => {
  if (editBlocks.value.length === 0) {
    alert('완료할 내용이 없습니다.')
    return
  }
  
  const confirmed = confirm('알림장 편집을 완료하시겠습니까?')
  if (confirmed) {
    // 완료 처리 - 실제로는 서버에 저장하거나 다른 페이지로 이동
    alert('알림장이 완료되었습니다!')
  router.push('/')
  }
}

// 검색 처리
const handleSearch = (query: string) => {
  console.log('편집 페이지에서 검색:', query)
}

// 컴포넌트 마운트 시 저장된 세션 로드
onMounted(() => {
  // 기존 세션 로드
  loadSession()
  
  // MainView에서 전달받은 선택된 문구들 로드
  const editingNotices = localStorage.getItem('editingNotices')
  if (editingNotices) {
    try {
      const notices = JSON.parse(editingNotices)
      
      // 전달받은 문구들을 편집 블록으로 변환
      const newBlocks: EditBlockType[] = notices.map((notice: any, index: number) => ({
        id: `imported-${Date.now()}-${index}`,
        title: notice.title || '문구',
        content: notice.content,
        tags: notice.tags || [],
        subItems: notice.subItems || [],
        order: editBlocks.value.length + index,
        isEditing: false,
        metadata: {
          originalId: notice.id,
          originalTitle: notice.title,
          type: 'text' as const
        }
      }))
      
      // 기존 블록과 합치기 (중복 제거)
      const existingIds = editBlocks.value.map(block => block.metadata?.originalId).filter(Boolean)
      const uniqueNewBlocks = newBlocks.filter((block: EditBlockType) => 
        !existingIds.includes(block.metadata?.originalId)
      )
      
      editBlocks.value.push(...uniqueNewBlocks)
      
      // 사용된 데이터 삭제
      localStorage.removeItem('editingNotices')
      
      if (uniqueNewBlocks.length > 0) {
        console.log(`${uniqueNewBlocks.length}개의 문구가 편집 영역에 추가되었습니다.`)
      }
    } catch (error) {
      console.error('전달받은 문구 로드 실패:', error)
      localStorage.removeItem('editingNotices')
    }
  }
})
</script>

<style scoped>
.edit-page {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.block-counter {
  background: #eff6ff;
  color: #3b82f6;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-container {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  min-height: 0;
}

.blocks-section {
  width: 40%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.preview-section {
  width: 60%;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 0.5rem;
}

.blocks-container {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-blocks {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #6b7280;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.empty-text {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.empty-subtext {
  font-size: 0.875rem;
  line-height: 1.4;
}

@media (max-width: 1024px) {
  .edit-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .blocks-section {
    width: 100%;
    height: 40%;
  }
  
  .preview-section {
    width: 100%;
    height: 60%;
  }
}

@media (max-width: 768px) {
  .edit-toolbar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .toolbar-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .edit-container {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .blocks-section {
    width: 100%;
    height: 45%;
  }
  
  .preview-section {
    width: 100%;
    height: 55%;
  }
}
</style>
