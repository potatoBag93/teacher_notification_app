import type { Notice, Category } from './notices'

export interface Collection {
  id: string
  name: string
  description: string
  color: string
  icon: string
  noticeIds: string[]
  createdAt: Date
  updatedAt: Date
  isDefault: boolean
}

export interface SavedNotice extends Notice {
  savedAt: Date
  collectionId: string
  notes?: string
  isFavorite: boolean
}

// 기본 컬렉션들
export const defaultCollections: Collection[] = [
  {
    id: 'favorites',
    name: '즐겨찾기',
    description: '자주 사용하는 문구들',
    color: '#ef4444',
    icon: '❤️',
    noticeIds: ['1', '3', '8'],
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-08-05'),
    isDefault: true
  },
  {
    id: 'safety',
    name: '안전 모음',
    description: '안전 관련 문구 모음',
    color: '#f59e0b',
    icon: '🛡️',
    noticeIds: ['1', '2', '4'],
    createdAt: new Date('2025-07-10'),
    updatedAt: new Date('2025-08-01'),
    isDefault: false
  },
  {
    id: 'summer',
    name: '여름철 특집',
    description: '여름철 관련 문구들',
    color: '#3b82f6',
    icon: '☀️',
    noticeIds: ['5', '6', '7'],
    createdAt: new Date('2025-07-15'),
    updatedAt: new Date('2025-07-30'),
    isDefault: false
  },
  {
    id: 'recent',
    name: '최근 저장',
    description: '최근에 저장한 문구들',
    color: '#10b981',
    icon: '📝',
    noticeIds: ['8', '9', '10'],
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-08-08'),
    isDefault: false
  }
]

// 저장된 문구들 (샘플)
export const savedNotices: SavedNotice[] = [
  {
    id: '1',
    title: '여름철 물놀이 안전수칙',
    content: '여름철 물놀이를 할 때는 반드시 어른과 함께 하고, 안전장비를 착용하세요. 깊은 곳에는 혼자 들어가지 말고, 물에 들어가기 전 준비운동을 꼭 하세요.',
    tags: ['안전보건'],
    author: '김선생님',
    likeCount: 15,
    subItems: ['어른과 함께하기', '안전장비 착용', '준비운동 하기'],
    createdAt: new Date('2025-07-20'),
    savedAt: new Date('2025-07-25'),
    collectionId: 'favorites',
    notes: '수영장 가기 전에 꼭 확인',
    isFavorite: true
  },
  {
    id: '2',
    title: '교통안전 수칙',
    content: '횡단보도를 건널 때는 좌우를 살피고, 신호를 잘 지켜주세요. 자전거를 탈 때는 헬멧을 착용하고, 인도가 아닌 자전거 도로를 이용하세요.',
    tags: ['안전보건'],
    author: '박선생님',
    likeCount: 23,
    subItems: ['좌우 살피기', '신호 지키기', '헬멧 착용'],
    createdAt: new Date('2025-07-18'),
    savedAt: new Date('2025-07-20'),
    collectionId: 'safety',
    isFavorite: false
  },
  {
    id: '3',
    title: '독서 습관 기르기',
    content: '매일 30분씩 책을 읽는 습관을 기르세요. 다양한 장르의 책을 읽어보고, 읽은 후에는 간단한 독서감상문을 써보세요.',
    tags: ['학습관리'],
    author: '이선생님',
    likeCount: 18,
    subItems: ['매일 30분 독서', '다양한 장르', '독서감상문'],
    createdAt: new Date('2025-07-15'),
    savedAt: new Date('2025-07-16'),
    collectionId: 'favorites',
    notes: '도서관 프로그램과 연계',
    isFavorite: true
  },
  {
    id: '4',
    title: '화재 대피 요령',
    content: '화재가 발생하면 당황하지 말고 선생님의 지시에 따라 질서있게 대피하세요. 연기가 많을 때는 몸을 낮추고 코와 입을 막으며 이동하세요.',
    tags: ['안전보건'],
    author: '김선생님',
    likeCount: 31,
    subItems: ['당황하지 않기', '선생님 지시 따르기', '몸을 낮추고 이동'],
    createdAt: new Date('2025-07-12'),
    savedAt: new Date('2025-07-14'),
    collectionId: 'safety',
    isFavorite: false
  },
  {
    id: '5',
    title: '폭염 대비 건강관리',
    content: '더운 여름에는 충분한 수분 섭취와 적절한 휴식이 중요합니다. 야외활동 시에는 모자를 착용하고, 시원한 곳에서 휴식을 취하세요.',
    tags: ['안전보건'],
    author: '최선생님',
    likeCount: 27,
    subItems: ['충분한 수분 섭취', '모자 착용', '시원한 곳에서 휴식'],
    createdAt: new Date('2025-07-25'),
    savedAt: new Date('2025-07-26'),
    collectionId: 'summer',
    isFavorite: false
  }
]

// 컬렉션 관리 유틸리티 함수들
export const getCollectionNotices = (collectionId: string): SavedNotice[] => {
  return savedNotices.filter(notice => notice.collectionId === collectionId)
}

export const getNoticesByIds = (noticeIds: string[]): SavedNotice[] => {
  return savedNotices.filter(notice => noticeIds.includes(notice.id))
}

export const getFavoriteNotices = (): SavedNotice[] => {
  return savedNotices.filter(notice => notice.isFavorite)
}

export const getRecentNotices = (limit: number = 10): SavedNotice[] => {
  return savedNotices
    .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime())
    .slice(0, limit)
}

export const searchSavedNotices = (query: string): SavedNotice[] => {
  const lowercaseQuery = query.toLowerCase()
  return savedNotices.filter(notice => 
    notice.title.toLowerCase().includes(lowercaseQuery) ||
    notice.content.toLowerCase().includes(lowercaseQuery) ||
    notice.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export const getCollectionStats = (collectionId: string) => {
  const notices = getCollectionNotices(collectionId)
  const categories = [...new Set(notices.map(n => n.tags).flat())]
  const totalLikes = notices.reduce((sum, n) => sum + n.likeCount, 0)
  
  return {
    noticeCount: notices.length,
    categories: categories.length,
    totalLikes,
    lastUpdated: notices.length > 0 
      ? new Date(Math.max(...notices.map(n => n.savedAt.getTime())))
      : null
  }
}
