export interface AdminUser {
  id: string
  name: string
  email: string
  school: string
  grade: string
  subject: string
  status: 'active' | 'inactive' | 'pending'
  registeredAt: Date
  lastLoginAt?: Date
  noticeCount: number
}

export interface SystemStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  totalNotices: number
  serverUptime: number
  userGrowth: number
  activeUserGrowth: number
  noticeGrowth: number
}

export interface SystemMonitor {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkLatency: number
  activeConnections: number
  errorRate: number
}

export interface ActivityLog {
  id: string
  type: 'login' | 'register' | 'notice_create' | 'notice_delete' | 'admin_action'
  user: string
  action: string
  timestamp: Date
  details?: string
}

// 샘플 사용자 데이터
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'user-1',
    name: '김영희',
    email: 'kim@school.edu',
    school: '서울초등학교',
    grade: '초등3',
    subject: '담임',
    status: 'active',
    registeredAt: new Date('2025-08-01'),
    lastLoginAt: new Date('2025-08-09'),
    noticeCount: 45
  },
  {
    id: 'user-2',
    name: '박철수',
    email: 'park@school.edu',
    school: '부산중학교',
    grade: '중등2',
    subject: '수학',
    status: 'active',
    registeredAt: new Date('2025-07-28'),
    lastLoginAt: new Date('2025-08-08'),
    noticeCount: 32
  },
  {
    id: 'user-3',
    name: '이미나',
    email: 'lee@school.edu',
    school: '대구고등학교',
    grade: '고등1',
    subject: '국어',
    status: 'pending',
    registeredAt: new Date('2025-08-07'),
    noticeCount: 0
  },
  {
    id: 'user-4',
    name: '최민수',
    email: 'choi@school.edu',
    school: '인천초등학교',
    grade: '초등5',
    subject: '담임',
    status: 'active',
    registeredAt: new Date('2025-07-25'),
    lastLoginAt: new Date('2025-08-07'),
    noticeCount: 67
  },
  {
    id: 'user-5',
    name: '정수진',
    email: 'jung@school.edu',
    school: '광주중학교',
    grade: '중등3',
    subject: '영어',
    status: 'inactive',
    registeredAt: new Date('2025-07-20'),
    lastLoginAt: new Date('2025-07-30'),
    noticeCount: 23
  }
]

// 시스템 통계
export const mockSystemStats: SystemStats = {
  totalUsers: 2847,
  activeUsers: 1923,
  pendingUsers: 23,
  totalNotices: 45672,
  serverUptime: 99.8,
  userGrowth: 12.3,
  activeUserGrowth: 8.7,
  noticeGrowth: 15.2
}

// 시스템 모니터링
export const mockSystemMonitor: SystemMonitor = {
  cpuUsage: 45,
  memoryUsage: 67,
  diskUsage: 32,
  networkLatency: 12,
  activeConnections: 156,
  errorRate: 0.2
}

// 활동 로그
export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    type: 'login',
    user: '김영희',
    action: '로그인',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    details: 'IP: 192.168.1.100'
  },
  {
    id: 'log-2',
    type: 'notice_create',
    user: '박철수',
    action: '새 문구 작성',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    details: '안전 카테고리'
  },
  {
    id: 'log-3',
    type: 'register',
    user: '이미나',
    action: '회원가입',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    details: '승인 대기 중'
  },
  {
    id: 'log-4',
    type: 'admin_action',
    user: '관리자',
    action: '사용자 승인',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    details: '최민수님 승인 완료'
  },
  {
    id: 'log-5',
    type: 'notice_delete',
    user: '정수진',
    action: '문구 삭제',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    details: '부적절한 내용'
  }
]

// 유틸리티 함수들
export const getUsersByStatus = (status: AdminUser['status']): AdminUser[] => {
  return mockAdminUsers.filter(user => user.status === status)
}

export const getRecentUsers = (limit: number = 5): AdminUser[] => {
  return [...mockAdminUsers]
    .sort((a, b) => b.registeredAt.getTime() - a.registeredAt.getTime())
    .slice(0, limit)
}

export const getActiveUsers = (): AdminUser[] => {
  return mockAdminUsers.filter(user => user.status === 'active')
}

export const searchUsers = (query: string): AdminUser[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockAdminUsers.filter(user =>
    user.name.toLowerCase().includes(lowercaseQuery) ||
    user.email.toLowerCase().includes(lowercaseQuery) ||
    user.school.toLowerCase().includes(lowercaseQuery) ||
    user.subject.toLowerCase().includes(lowercaseQuery)
  )
}

export const getSystemHealth = (): 'good' | 'warning' | 'error' => {
  const monitor = mockSystemMonitor
  
  if (monitor.cpuUsage > 80 || monitor.memoryUsage > 85 || monitor.errorRate > 1) {
    return 'error'
  } else if (monitor.cpuUsage > 60 || monitor.memoryUsage > 70 || monitor.errorRate > 0.5) {
    return 'warning'
  }
  
  return 'good'
}

export const formatUptime = (uptime: number): string => {
  return `${uptime.toFixed(1)}%`
}

export const formatGrowth = (growth: number): string => {
  const sign = growth >= 0 ? '+' : ''
  return `${sign}${growth.toFixed(1)}%`
}
