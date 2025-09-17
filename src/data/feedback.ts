export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'question' | 'compliment' | 'other'

export type FeedbackStatus = 'pending' | 'in-progress' | 'completed' | 'rejected'

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Feedback {
  id: string
  type: FeedbackType
  title: string
  description: string
  userEmail?: string
  userName?: string
  status: FeedbackStatus
  priority: FeedbackPriority
  votes: number
  hasVoted: boolean
  createdAt: Date
  updatedAt: Date
  tags: string[]
  adminResponse?: string
  adminResponseAt?: Date
}

export interface FeedbackStats {
  totalFeedback: number
  pendingFeedback: number
  completedFeedback: number
  averageResponseTime: number
  userSatisfaction: number
}

// 피드백 타입 정의
export const feedbackTypes = [
  { key: 'bug', label: '버그 신고', icon: '🐛', color: '#ef4444' },
  { key: 'feature', label: '기능 요청', icon: '✨', color: '#3b82f6' },
  { key: 'improvement', label: '개선 제안', icon: '🔧', color: '#f59e0b' },
  { key: 'question', label: '질문/문의', icon: '❓', color: '#8b5cf6' },
  { key: 'compliment', label: '칭찬/감사', icon: '👏', color: '#10b981' },
  { key: 'other', label: '기타', icon: '💬', color: '#6b7280' }
] as const

// 샘플 피드백 데이터
export const mockFeedbacks: Feedback[] = [
  {
    id: 'feedback-1',
    type: 'feature',
    title: '음성 입력 기능 추가 요청',
    description: '문구를 직접 타이핑하는 것보다 음성으로 입력할 수 있는 기능이 있으면 더 편리할 것 같습니다. 특히 이동 중에도 쉽게 문구를 만들 수 있을 것 같아요.',
    userEmail: 'teacher1@school.edu',
    userName: '김선생님',
    status: 'in-progress',
    priority: 'medium',
    votes: 12,
    hasVoted: false,
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-08-05'),
    tags: ['음성입력', '편의성', '모바일'],
    adminResponse: '좋은 제안 감사합니다. 음성 입력 기능은 다음 업데이트에서 추가될 예정입니다.',
    adminResponseAt: new Date('2025-08-05')
  },
  {
    id: 'feedback-2',
    type: 'bug',
    title: '편집 페이지에서 저장이 안 되는 문제',
    description: '긴 문구를 편집할 때 가끔 저장 버튼을 눌러도 저장이 되지 않는 경우가 있습니다. 특히 이미지를 첨부했을 때 자주 발생하는 것 같아요.',
    userEmail: 'teacher2@school.edu',
    userName: '박선생님',
    status: 'completed',
    priority: 'high',
    votes: 8,
    hasVoted: true,
    createdAt: new Date('2025-07-28'),
    updatedAt: new Date('2025-08-03'),
    tags: ['저장오류', '편집페이지', '이미지'],
    adminResponse: '버그를 수정하여 업데이트했습니다. 문제가 계속 발생하면 다시 연락주세요.',
    adminResponseAt: new Date('2025-08-03')
  },
  {
    id: 'feedback-3',
    type: 'improvement',
    title: '다크 모드 지원',
    description: '야간에 사용할 때 화면이 너무 밝아서 눈이 피로합니다. 다크 모드를 지원해주시면 좋겠습니다.',
    userEmail: 'teacher3@school.edu',
    userName: '이선생님',
    status: 'pending',
    priority: 'low',
    votes: 15,
    hasVoted: false,
    createdAt: new Date('2025-08-03'),
    updatedAt: new Date('2025-08-03'),
    tags: ['다크모드', 'UI/UX', '접근성']
  },
  {
    id: 'feedback-4',
    type: 'compliment',
    title: '정말 유용한 서비스입니다!',
    description: '알림장 작성이 이렇게 쉬워질 줄 몰랐어요. 특히 카테고리별로 정리된 문구들이 정말 도움이 많이 됩니다. 개발자분들 감사해요!',
    userEmail: 'teacher4@school.edu',
    userName: '최선생님',
    status: 'completed',
    priority: 'low',
    votes: 23,
    hasVoted: true,
    createdAt: new Date('2025-07-30'),
    updatedAt: new Date('2025-07-31'),
    tags: ['감사', '사용성', '카테고리'],
    adminResponse: '따뜻한 말씀 정말 감사합니다! 더 좋은 서비스를 만들도록 노력하겠습니다.',
    adminResponseAt: new Date('2025-07-31')
  },
  {
    id: 'feedback-5',
    type: 'question',
    title: '문구 공유는 어떻게 하나요?',
    description: '제가 만든 문구를 다른 선생님들과 공유하고 싶은데 방법을 모르겠어요. 공유 기능이 있는지 궁금합니다.',
    userEmail: 'teacher5@school.edu',
    userName: '정선생님',
    status: 'completed',
    priority: 'medium',
    votes: 5,
    hasVoted: false,
    createdAt: new Date('2025-08-06'),
    updatedAt: new Date('2025-08-07'),
    tags: ['공유기능', '문의', '사용법'],
    adminResponse: '편집 페이지에서 공유 버튼을 클릭하시면 됩니다. 자세한 사용법은 도움말 페이지를 참고해주세요.',
    adminResponseAt: new Date('2025-08-07')
  }
]

// 피드백 통계
export const mockFeedbackStats: FeedbackStats = {
  totalFeedback: 127,
  pendingFeedback: 23,
  completedFeedback: 89,
  averageResponseTime: 2.5, // 일
  userSatisfaction: 4.6 // 5점 만점
}

// 자주 묻는 질문
export const frequentlyAskedQuestions = [
  {
    question: '문구를 어떻게 저장하나요?',
    answer: '마음에 드는 문구의 하트 아이콘을 클릭하면 컬렉션에 저장됩니다. 컬렉션 페이지에서 저장된 문구들을 확인할 수 있어요.'
  },
  {
    question: '새로운 카테고리를 추가할 수 있나요?',
    answer: '현재는 기본 제공되는 카테고리만 사용 가능합니다. 새로운 카테고리가 필요하시면 피드백으로 요청해주세요.'
  },
  {
    question: '오프라인에서도 사용할 수 있나요?',
    answer: '현재는 온라인 연결이 필요합니다. 오프라인 기능은 향후 업데이트에서 제공될 예정입니다.'
  },
  {
    question: '문구를 PDF로 내보낼 수 있나요?',
    answer: '편집 페이지에서 완성된 문구를 PDF 형태로 다운로드할 수 있습니다. 프린트 아이콘을 클릭해보세요.'
  },
  {
    question: '계정 정보는 어떻게 수정하나요?',
    answer: '우측 상단의 프로필 아이콘을 클릭하면 계정 설정 페이지로 이동할 수 있습니다.'
  }
]

// 유틸리티 함수들
export const getFeedbacksByType = (type: FeedbackType): Feedback[] => {
  return mockFeedbacks.filter(feedback => feedback.type === type)
}

export const getFeedbacksByStatus = (status: FeedbackStatus): Feedback[] => {
  return mockFeedbacks.filter(feedback => feedback.status === status)
}

export const searchFeedbacks = (query: string): Feedback[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockFeedbacks.filter(feedback =>
    feedback.title.toLowerCase().includes(lowercaseQuery) ||
    feedback.description.toLowerCase().includes(lowercaseQuery) ||
    feedback.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export const getTopVotedFeedbacks = (limit: number = 5): Feedback[] => {
  return [...mockFeedbacks]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, limit)
}

export const getRecentFeedbacks = (limit: number = 10): Feedback[] => {
  return [...mockFeedbacks]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
}
