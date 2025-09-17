export interface UserStats {
  totalUsage: number
  savedNotices: number
  sharedNotices: number
  receivedLikes: number
  favoriteCategory: string
  streakDays: number
  lastActive: Date
}

export interface CategoryUsage {
  category: string
  count: number
  percentage: number
  color: string
}

export interface UsageHistory {
  date: string
  count: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

export interface RecentActivity {
  id: string
  type: 'used' | 'saved' | 'shared' | 'liked'
  title: string
  timestamp: Date
  category?: string
}

// 샘플 사용자 통계
export const mockUserStats: UserStats = {
  totalUsage: 127,
  savedNotices: 23,
  sharedNotices: 8,
  receivedLikes: 45,
  favoriteCategory: '안전',
  streakDays: 12,
  lastActive: new Date()
}

// 카테고리별 사용 통계
export const mockCategoryUsage: CategoryUsage[] = [
  { category: '안전', count: 25, percentage: 32, color: '#ef4444' },
  { category: '생활지도', count: 18, percentage: 23, color: '#f97316' },
  { category: '학습', count: 15, percentage: 19, color: '#22c55e' },
  { category: '건강', count: 12, percentage: 15, color: '#a855f7' },
  { category: '행사', count: 8, percentage: 10, color: '#3b82f6' },
  { category: '기타', count: 1, percentage: 1, color: '#6b7280' }
]

// 사용 히스토리 (최근 30일)
export const mockUsageHistory: UsageHistory[] = [
  { date: '2025-07-10', count: 2 },
  { date: '2025-07-11', count: 1 },
  { date: '2025-07-12', count: 3 },
  { date: '2025-07-13', count: 0 },
  { date: '2025-07-14', count: 1 },
  { date: '2025-07-15', count: 4 },
  { date: '2025-07-16', count: 2 },
  { date: '2025-07-17', count: 1 },
  { date: '2025-07-18', count: 3 },
  { date: '2025-07-19', count: 2 },
  { date: '2025-07-20', count: 1 },
  { date: '2025-07-21', count: 0 },
  { date: '2025-07-22', count: 2 },
  { date: '2025-07-23', count: 3 },
  { date: '2025-07-24', count: 1 },
  { date: '2025-07-25', count: 2 },
  { date: '2025-07-26', count: 4 },
  { date: '2025-07-27', count: 1 },
  { date: '2025-07-28', count: 3 },
  { date: '2025-07-29', count: 2 },
  { date: '2025-07-30', count: 1 },
  { date: '2025-07-31', count: 2 },
  { date: '2025-08-01', count: 3 },
  { date: '2025-08-02', count: 1 },
  { date: '2025-08-03', count: 2 },
  { date: '2025-08-04', count: 4 },
  { date: '2025-08-05', count: 2 },
  { date: '2025-08-06', count: 1 },
  { date: '2025-08-07', count: 3 },
  { date: '2025-08-08', count: 2 }
]

// 업적 시스템
export const mockAchievements: Achievement[] = [
  {
    id: 'first_use',
    title: '첫 걸음',
    description: '첫 번째 문구를 사용했습니다',
    icon: '👶',
    unlocked: true,
    unlockedAt: new Date('2025-07-01')
  },
  {
    id: 'week_streak',
    title: '일주일 연속',
    description: '7일 연속으로 문구를 사용했습니다',
    icon: '🔥',
    unlocked: true,
    unlockedAt: new Date('2025-07-15')
  },
  {
    id: 'safety_expert',
    title: '안전 전문가',
    description: '안전 카테고리 문구를 20회 이상 사용했습니다',
    icon: '🛡️',
    unlocked: true,
    unlockedAt: new Date('2025-07-25')
  },
  {
    id: 'hundred_uses',
    title: '백전백승',
    description: '문구를 100회 이상 사용했습니다',
    icon: '💯',
    unlocked: true,
    unlockedAt: new Date('2025-08-05')
  },
  {
    id: 'sharer',
    title: '나눔이',
    description: '문구를 10회 이상 공유했습니다',
    icon: '🤝',
    unlocked: false
  },
  {
    id: 'popular',
    title: '인기왕',
    description: '공유한 문구가 50개 이상의 좋아요를 받았습니다',
    icon: '⭐',
    unlocked: false
  }
]

// 최근 활동
export const mockRecentActivity: RecentActivity[] = [
  {
    id: 'activity_1',
    type: 'used',
    title: '여름철 물놀이 안전수칙',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    category: '안전'
  },
  {
    id: 'activity_2',
    type: 'saved',
    title: '독서 습관 기르기',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    category: '학습'
  },
  {
    id: 'activity_3',
    type: 'liked',
    title: '폭염 시 건강 관리',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    category: '건강'
  },
  {
    id: 'activity_4',
    type: 'shared',
    title: '교통안전 수칙',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    category: '안전'
  },
  {
    id: 'activity_5',
    type: 'used',
    title: '방학 중 규칙적인 생활',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: '생활지도'
  }
]

// 추천 문구 (사용하지 않은 카테고리 기반)
export const getRecommendations = (userStats: UserStats, categoryUsage: CategoryUsage[]) => {
  const unusedCategories = ['상담', '칭찬', '준비물', '숙제'].filter(category => 
    !categoryUsage.some(usage => usage.category === category && usage.count > 0)
  )
  
  return {
    unusedCategories,
    recommendations: [
      '상담 관련 문구를 시도해보세요',
      '칭찬 문구로 긍정적인 분위기를 만들어보세요',
      '준비물 안내 문구를 활용해보세요'
    ].slice(0, unusedCategories.length)
  }
}
