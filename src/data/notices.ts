import { type Category } from '../constants/categories'

export type { Category }

export interface Notice {
  id: string
  title: string
  content: string              // 단순 문자열
  tags: Category[]
  subTags?: string[]           // 세부 태그 (새로 추가)
  author: string
  likeCount: number
  subItems: string[]           // 필수 문자열 배열
  createdAt: Date
  usageCount?: number
}

// 8월 추천 문구 데이터
export const recommendedNotices: Notice[] = [
  {
    id: 'rec-1',
    title: '🏊‍♀️ 여름철 물놀이 안전수칙',
    content: '무더운 여름, 물놀이 안전에 각별히 주의해주세요.',
    tags: ['안전보건'],
    author: '김선생님',
    likeCount: 15,
    subItems: [
      '깊은 물에는 절대 들어가지 마세요',
      '혼자서 물놀이 하지 마세요',
      '물에 들어가기 전 준비운동을 꼭 하세요'
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2시간 전
  },
  {
    id: 'rec-2',
    title: '🌡️ 폭염 시 건강 관리',
    content: '오늘 폭염주의보가 발령되었습니다. 건강 관리에 유의해주세요.',
    tags: ['안전보건', '학교알림'],
    author: '이선생님',
    likeCount: 23,
    subItems: [
      '충분한 수분 섭취하기',
      '외출 시 양산이나 모자 착용하기',
      '시원한 장소에서 휴식하기'
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1일 전
  },
  {
    id: 'rec-3',
    title: '📱 스마트폰 사용 주의',
    content: '올바른 스마트폰 사용법을 익혀주세요.',
    tags: ['생활지도'],
    author: '박선생님',
    likeCount: 31,
    subItems: [
      '사용 시간 제한하기',
      '보행 중 사용 금지',
      '개인정보 보호하기',
      '사이버 폭력 예방하기'
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3일 전
  },
  {
    id: 'rec-4',
    title: '📅 방학 중 규칙적인 생활',
    content: '방학 중에도 규칙적인 생활습관을 유지해주세요.',
    tags: ['생활지도'],
    author: '박선생님',
    likeCount: 19,
    subItems: [
      '일찍 자고 일찍 일어나기',
      '정해진 시간에 식사하기',
      '매일 운동하기',
      '충분한 휴식 취하기'
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4일 전
  }
]

// 일반 문구 데이터
export const allNotices: Notice[] = [
  {
    id: 'notice-1',
    title: '📚 독서 습관 기르기',
    content: '매일 30분 이상 독서하는 습관을 기르세요.',
    tags: ['학습관리'],
    author: '최선생님',
    likeCount: 12,
    subItems: [
      '매일 같은 시간에 독서하기',
      '관심 있는 분야부터 시작하기',
      '독서 일기 작성하기'
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    usageCount: 45
  },
  {
    id: 'notice-2',
    title: '🚦 교통안전 수칙',
    content: '등하교 및 외출 시 교통안전에 유의해주세요.',
    tags: ['안전보건'],
    author: '박선생님',
    likeCount: 8,
    subItems: [
      '횡단보도에서 좌우 확인하기',
      '신호등 지키기',
      '밝은 색 옷 착용하기'
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    usageCount: 23
  },
  {
    id: 'notice-3',
    title: '🎉 오늘의 칭찬',
    content: '오늘 우리 반 친구들이 정말 잘해주었어요! 모든 친구들이 수업에 집중하고 서로 도우며 공부했습니다.',
    tags: ['인성교육'],
    author: '김선생님',
    likeCount: 25,
    subItems: [
      '수업에 집중해서 참여하기',
      '친구들과 서로 도우며 공부하기',
      '청소 시간에 적극적으로 참여하기'
    ],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1시간 전
  },
  {
    id: 'notice-4',
    title: '📝 내일 준비물',
    content: '내일 수업을 위해 다음 준비물을 가져와 주세요.',
    tags: ['학습관리', '학교알림'],
    author: '이선생님',
    likeCount: 5,
    subItems: [
      '색연필 12색',
      '도화지 2장',
      '풀과 가위'
    ],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4시간 전
    usageCount: 12
  },
  {
    id: 'notice-5',
    title: '🎭 다음 주 학교 행사',
    content: '다음 주에 예정된 학교 행사를 안내드립니다.',
    tags: ['행사활동', '학교알림'],
    author: '박선생님',
    likeCount: 14,
    subItems: [
      '월요일: 전교 조회',
      '수요일: 체육대회 연습',
      '금요일: 학예회 리허설'
    ],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6시간 전
    usageCount: 8
  },
  {
    id: 'notice-6',
    title: '🥗 건강한 식습관',
    content: '균형 잡힌 식사와 건강한 간식을 섭취해주세요.',
    tags: ['안전보건', '생활지도'],
    author: '최선생님',
    likeCount: 18,
    subItems: [
      '하루 세 끼 정시에 식사하기',
      '과일과 채소 많이 먹기',
      '과자나 탄산음료 줄이기'
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
    usageCount: 31
  },
  {
    id: 'notice-7',
    title: '📚 이번 주 숙제',
    content: '이번 주 숙제를 안내드립니다.',
    tags: ['학습관리'],
    author: '김선생님',
    likeCount: 7,
    subItems: [
      '수학 문제집 34-35페이지',
      '국어 일기 쓰기 (2편)',
      '과학 관찰일지 작성'
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
    usageCount: 15
  },
  {
    id: 'notice-8',
    title: '👨‍👩‍👧‍👦 학부모 상담 안내',
    content: '학부모 상담을 희망하시는 분은 신청해주세요.',
    tags: ['상담지원', '학교알림'],
    author: '이선생님',
    likeCount: 11,
    subItems: [
      '상담 기간: 다음 주 월-금',
      '상담 시간: 오후 3-6시',
      '사전 예약 필수'
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
    usageCount: 6
  }
]

// 카테고리 목록 (새로운 13개 카테고리 시스템으로 업데이트)
export const categories: Category[] = [
  '학습관리',
  '생활지도', 
  '안전보건',
  '인성교육',
  '창의예술',
  '체육건강',
  '환경정보',
  '행사활동',
  '상담지원',
  '학교알림',
  '특별교육',
  '가정연계',
  '기타사항'
]
