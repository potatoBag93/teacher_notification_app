<template>
  <AppLayout>
    <div :class="$style.feedbackPage">
      <!-- 헤더 섹션 -->
      <header :class="$style.header">
        <div :class="$style.titleSection">
          <h1 :class="$style.title">💬 피드백 & 제안</h1>
          <p :class="$style.subtitle">
            여러분의 소중한 의견으로 더 나은 서비스를 만들어갑니다
          </p>
        </div>
        
        <div :class="$style.headerActions">
          <BaseButton 
            variant="primary"
            @click="showFeedbackForm = true"
          >
            ✍️ 피드백 작성
          </BaseButton>
        </div>
      </header>

      <!-- 통계 카드 -->
      <section :class="$style.statsSection">
        <div :class="$style.statsGrid">
          <BaseCard :class="$style.statCard">
            <div :class="$style.statIcon">📝</div>
            <div :class="$style.statContent">
              <div :class="$style.statValue">{{ stats.totalFeedback }}</div>
              <div :class="$style.statLabel">총 피드백</div>
            </div>
          </BaseCard>
          
          <BaseCard :class="$style.statCard">
            <div :class="$style.statIcon">⏳</div>
            <div :class="$style.statContent">
              <div :class="$style.statValue">{{ stats.pendingFeedback }}</div>
              <div :class="$style.statLabel">대기중</div>
            </div>
          </BaseCard>
          
          <BaseCard :class="$style.statCard">
            <div :class="$style.statIcon">✅</div>
            <div :class="$style.statContent">
              <div :class="$style.statValue">{{ stats.completedFeedback }}</div>
              <div :class="$style.statLabel">완료</div>
            </div>
          </BaseCard>
          
          <BaseCard :class="$style.statCard">
            <div :class="$style.statIcon">⭐</div>
            <div :class="$style.statContent">
              <div :class="$style.statValue">{{ stats.userSatisfaction }}/5</div>
              <div :class="$style.statLabel">만족도</div>
            </div>
          </BaseCard>
        </div>
      </section>

      <!-- 탭 네비게이션 -->
      <nav :class="$style.tabNav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[$style.tabBtn, { [$style.active]: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <span :class="$style.tabIcon">{{ tab.icon }}</span>
          {{ tab.label }}
          <span v-if="tab.count" :class="$style.tabCount">({{ tab.count }})</span>
        </button>
      </nav>

      <!-- 컨텐츠 영역 -->
      <main :class="$style.content">
        <!-- 전체 피드백 탭 -->
        <div v-if="activeTab === 'all'" :class="$style.tabContent">
          <div :class="$style.contentHeader">
            <h2 :class="$style.sectionTitle">모든 피드백</h2>
            <div :class="$style.contentActions">
              <SearchInput 
                v-model="searchQuery"
                placeholder="피드백 검색..."
                :class="$style.searchInput"
                @search="handleSearch"
              />
              <select v-model="sortBy" :class="$style.sortSelect">
                <option value="latest">최신순</option>
                <option value="votes">인기순</option>
                <option value="status">상태순</option>
              </select>
            </div>
          </div>
          
          <div v-if="filteredFeedbacks.length === 0" :class="$style.emptyState">
            <div :class="$style.emptyIcon">🔍</div>
            <h3 :class="$style.emptyTitle">검색 결과가 없습니다</h3>
            <p :class="$style.emptyText">다른 검색어를 시도해보세요</p>
          </div>
          
          <div v-else :class="$style.feedbackGrid">
            <FeedbackCard
              v-for="feedback in paginatedFeedbacks"
              :key="feedback.id"
              :feedback="feedback"
              @vote="voteFeedback(feedback)"
              @share="shareFeedback(feedback)"
              @edit="editFeedback(feedback)"
            />
          </div>
          
          <!-- 페이지네이션 -->
          <div v-if="totalPages > 1" :class="$style.pagination">
            <BaseButton
              variant="ghost"
              size="sm"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              이전
            </BaseButton>
            
            <div :class="$style.pageInfo">
              {{ currentPage }} / {{ totalPages }}
            </div>
            
            <BaseButton
              variant="ghost"
              size="sm"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              다음
            </BaseButton>
          </div>
        </div>

        <!-- 인기 피드백 탭 -->
        <div v-else-if="activeTab === 'popular'" :class="$style.tabContent">
          <h2 :class="$style.sectionTitle">인기 피드백</h2>
          <div :class="$style.feedbackGrid">
            <FeedbackCard
              v-for="feedback in topVotedFeedbacks"
              :key="feedback.id"
              :feedback="feedback"
              @vote="voteFeedback(feedback)"
              @share="shareFeedback(feedback)"
            />
          </div>
        </div>

        <!-- 내 피드백 탭 -->
        <div v-else-if="activeTab === 'mine'" :class="$style.tabContent">
          <h2 :class="$style.sectionTitle">내 피드백</h2>
          <div v-if="myFeedbacks.length === 0" :class="$style.emptyState">
            <div :class="$style.emptyIcon">📝</div>
            <h3 :class="$style.emptyTitle">작성한 피드백이 없습니다</h3>
            <p :class="$style.emptyText">첫 번째 피드백을 작성해보세요</p>
            <BaseButton 
              variant="primary"
              @click="showFeedbackForm = true"
            >
              피드백 작성하기
            </BaseButton>
          </div>
          <div v-else :class="$style.feedbackGrid">
            <FeedbackCard
              v-for="feedback in myFeedbacks"
              :key="feedback.id"
              :feedback="feedback"
              :can-edit="true"
              @vote="voteFeedback(feedback)"
              @share="shareFeedback(feedback)"
              @edit="editFeedback(feedback)"
            />
          </div>
        </div>

        <!-- FAQ 탭 -->
        <div v-else-if="activeTab === 'faq'" :class="$style.tabContent">
          <h2 :class="$style.sectionTitle">자주 묻는 질문</h2>
          <div :class="$style.faqList">
            <BaseCard
              v-for="(faq, index) in faqs"
              :key="index"
              :class="$style.faqItem"
              hover
              @click="toggleFaq(index)"
            >
              <div :class="$style.faqQuestion">
                <span :class="$style.faqIcon">❓</span>
                {{ faq.question }}
                <span :class="[$style.faqToggle, { [$style.open]: openFaq === index }]">
                  {{ openFaq === index ? '−' : '+' }}
                </span>
              </div>
              <div v-if="openFaq === index" :class="$style.faqAnswer">
                {{ faq.answer }}
              </div>
            </BaseCard>
          </div>
        </div>
      </main>
    </div>

    <!-- 피드백 작성 모달 -->
    <div v-if="showFeedbackForm" :class="$style.modal" @click="closeFeedbackForm">
      <div :class="$style.modalContent" @click.stop>
        <FeedbackForm
          :initial-data="editingFeedbackForForm "
          :is-editing="!!editingFeedback"
          @submit="handleFeedbackSubmit"
          @cancel="closeFeedbackForm"
        />
      </div>
    </div>

    <!-- 성공 메시지 -->
    <div v-if="showSuccessMessage" :class="$style.successMessage">
      <div :class="$style.successContent">
        <span :class="$style.successIcon">✅</span>
        피드백이 성공적으로 전송되었습니다!
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import SearchInput from '@/components/common/SearchInput.vue'
import FeedbackCard from '@/components/FeedbackCard.vue'
import FeedbackForm from '@/components/FeedbackForm.vue'
import {
  mockFeedbacks,
  mockFeedbackStats,
  frequentlyAskedQuestions,
  getTopVotedFeedbacks,
  searchFeedbacks,
  type Feedback
} from '@/data/feedback'

// 반응형 상태
const activeTab = ref('all')
const searchQuery = ref('')
const sortBy = ref('latest')
const currentPage = ref(1)
const itemsPerPage = 6
const openFaq = ref<number | null>(null)
const showFeedbackForm = ref(false)
const showSuccessMessage = ref(false)
const editingFeedback = ref<Partial<Feedback> | null>(null)
const editingFeedbackForForm = computed(() => {
  if (!editingFeedback.value) return undefined
  return {
    type: editingFeedback.value.type ?? 'feature', // 기본값 보장
    title: editingFeedback.value.title ?? '',
    description: editingFeedback.value.description ?? '',
    userEmail: editingFeedback.value.userEmail,
    priority: editingFeedback.value.priority,
    tags: editingFeedback.value.tags
  }
})
// 데이터
const feedbacks = ref([...mockFeedbacks])
const stats = ref(mockFeedbackStats)
const faqs = ref(frequentlyAskedQuestions)

// 탭 설정
const tabs = computed(() => [
  { key: 'all', label: '전체', icon: '📋', count: feedbacks.value.length },
  { key: 'popular', label: '인기', icon: '🔥', count: null },
  { key: 'mine', label: '내 피드백', icon: '👤', count: myFeedbacks.value.length },
  { key: 'faq', label: 'FAQ', icon: '❓', count: null }
])

// 계산된 속성
const filteredFeedbacks = computed(() => {
  let filtered = feedbacks.value

  // 검색 필터링
  if (searchQuery.value) {
    filtered = searchFeedbacks(searchQuery.value)
  }

  // 정렬
  switch (sortBy.value) {
    case 'votes':
      filtered = [...filtered].sort((a, b) => b.votes - a.votes)
      break
    case 'status':
      filtered = [...filtered].sort((a, b) => {
        const statusOrder = { completed: 0, 'in-progress': 1, pending: 2, rejected: 3 }
        return statusOrder[a.status] - statusOrder[b.status]
      })
      break
    default: // latest
      filtered = [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredFeedbacks.value.length / itemsPerPage))

const paginatedFeedbacks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredFeedbacks.value.slice(start, end)
})

const topVotedFeedbacks = computed(() => getTopVotedFeedbacks(10))

const myFeedbacks = computed(() => {
  // 실제 구현에서는 현재 사용자의 이메일로 필터링
  return feedbacks.value.filter(feedback => 
    feedback.userEmail === 'current-user@example.com' // 예시
  )
})

// 메서드
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

const voteFeedback = (feedback: Feedback) => {
  if (!feedback.hasVoted) {
    feedback.votes++
    feedback.hasVoted = true
  }
}

const shareFeedback = (feedback: Feedback) => {
  if (navigator.share) {
    navigator.share({
      title: feedback.title,
      text: feedback.description,
      url: window.location.href
    })
  } else {
    // 클립보드에 복사
    navigator.clipboard.writeText(
      `${feedback.title}\n${feedback.description}\n${window.location.href}`
    )
    showMessage('링크가 클립보드에 복사되었습니다')
  }
}

const editFeedback = (feedback: Feedback) => {
  editingFeedback.value = {
    type: feedback.type,
    title: feedback.title,
    description: feedback.description,
    userEmail: feedback.userEmail,
    priority: feedback.priority,
    tags: [...feedback.tags]
  }
  showFeedbackForm.value = true
}

const handleFeedbackSubmit = async (data: any) => {
  try {
    if (editingFeedback.value) {
      // 편집 모드
      const index = feedbacks.value.findIndex(f => f.userEmail === data.userEmail)
      if (index > -1) {
        feedbacks.value[index] = {
          ...feedbacks.value[index],
          ...data,
          updatedAt: new Date()
        }
      }
    } else {
      // 새 피드백 추가
      const newFeedback: Feedback = {
        id: `feedback-${Date.now()}`,
        ...data,
        status: 'pending',
        votes: 0,
        hasVoted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      feedbacks.value.unshift(newFeedback)
      stats.value.totalFeedback++
      stats.value.pendingFeedback++
    }

    closeFeedbackForm()
    showMessage('피드백이 성공적으로 전송되었습니다!')
  } catch (error) {
    console.error('피드백 전송 실패:', error)
    showMessage('피드백 전송에 실패했습니다. 다시 시도해주세요.')
  }
}

const closeFeedbackForm = () => {
  showFeedbackForm.value = false
  editingFeedback.value = null
}

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index
}

const showMessage = (message: string) => {
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

onMounted(() => {
  // 컴포넌트 마운트 시 추가 초기화
})
</script>

<style module>
.feedbackPage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.titleSection {
  flex: 1;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.headerActions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.statsSection {
  width: 100%;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.statCard {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.statIcon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
  flex-shrink: 0;
}

.statContent {
  flex: 1;
}

.statValue {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  line-height: 1;
}

.statLabel {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.tabNav {
  display: flex;
  gap: 4px;
  background: #f8fafc;
  padding: 4px;
  border-radius: 8px;
  overflow-x: auto;
}

.tabBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tabBtn:hover {
  color: #374151;
}

.tabBtn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tabIcon {
  font-size: 16px;
}

.tabCount {
  font-size: 12px;
  background: #e5e7eb;
  color: #6b7280;
  padding: 2px 6px;
  border-radius: 10px;
}

.tabBtn.active .tabCount {
  background: #dbeafe;
  color: #3b82f6;
}

.content {
  width: 100%;
}

.tabContent {
  width: 100%;
}

.contentHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.sectionTitle {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.contentActions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.searchInput {
  width: 300px;
}

.sortSelect {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.feedbackGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.emptyState {
  text-align: center;
  padding: 60px 20px;
}

.emptyIcon {
  font-size: 64px;
  margin-bottom: 16px;
}

.emptyTitle {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.emptyText {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.pageInfo {
  font-size: 14px;
  color: #6b7280;
  padding: 8px 16px;
}

.faqList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faqItem {
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.faqQuestion {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.faqIcon {
  font-size: 18px;
  flex-shrink: 0;
}

.faqToggle {
  margin-left: auto;
  font-size: 20px;
  font-weight: bold;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.faqToggle.open {
  transform: rotate(180deg);
}

.faqAnswer {
  margin-top: 16px;
  padding-left: 30px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  border-left: 3px solid #e5e7eb;
  padding-left: 16px;
}

/* 모달 스타일 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modalContent {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.successMessage {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.successContent {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.successIcon {
  font-size: 18px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .feedbackPage {
    padding: 16px;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .contentHeader {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .contentActions {
    flex-direction: column;
  }
  
  .searchInput {
    width: 100%;
  }
  
  .feedbackGrid {
    grid-template-columns: 1fr;
  }
  
  .tabNav {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .tabNav::-webkit-scrollbar {
    display: none;
  }
}
</style>
