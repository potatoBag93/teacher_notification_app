/**
 * 카테고리 및 태그 관련 상수 및 유틸리티 함수
 * 
 * 모든 카테고리 및 태그 관련 정의를 중앙화하여 일관성을 보장합니다。
 */

// 카테고리 타입 정의 (버전 1: 보수적 통합형)
export type Category = 
  | '학습관리'    // 기존: 학습 + 숙제 + 준비물
  | '생활지도'    // 유지
  | '안전보건'    // 기존: 안전 + 건강
  | '인성교육'    // 기존: 인성 + 칭찬 + 주의
  | '창의예술'    // 기존: 창의 + 예술
  | '체육건강'    // 기존: 체육 (건강과 일부 통합)
  | '환경정보'    // 기존: 환경 + 정보
  | '행사활동'    // 기존: 행사
  | '상담지원'    // 기존: 상담
  | '학교알림'    // 기존: 알림
  | '특별교육'    // 계절/시기별 특별 교육
  | '가정연계'    // 가정과의 소통
  | '기타사항'    // 기존: 기타 + 일반

// 확장된 카테고리 타입 (UI에서 사용)
export type ExtendedCategory = Category | '전체'

// 카테고리 배열 (버전 1: 보수적 통합형)
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

// 카테고리별 메타데이터
export interface CategoryMeta {
  name: Category
  displayName: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  gradient: string
  keywords: string[]
}

// 카테고리 메타데이터 맵 (버전 1: 보수적 통합형)
export const categoryMetaMap: Record<Category, CategoryMeta> = {
  '학습관리': {
    name: '학습관리',
    displayName: '학습관리',
    description: '학습, 숙제, 준비물 등 교육활동 전반',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    keywords: ['학습', '공부', '수업', '과목', '시험', '교육', '숙제', '과제', '준비물', '용품', '재료']
  },
  '생활지도': {
    name: '생활지도',
    displayName: '생활지도',
    description: '학생 생활 지도 및 규칙 안내',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    gradient: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
    keywords: ['생활', '규칙', '예절', '태도', '습관', '지도']
  },
  '안전보건': {
    name: '안전보건',
    displayName: '안전보건',
    description: '안전 관리 및 건강 보건 정보',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    keywords: ['안전', '위험', '주의', '조심', '보호', '예방', '건강', '보건', '위생', '운동', '식사', '의료']
  },
  '인성교육': {
    name: '인성교육',
    displayName: '인성교육',
    description: '인성 교육, 칭찬, 지도 개선 등',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    keywords: ['인성', '도덕', '예의', '배려', '존중', '협력', '칭찬', '격려', '잘함', '우수', '모범', '훌륭', '주의', '경고', '금지', '위반', '문제', '개선']
  },
  '창의예술': {
    name: '창의예술',
    displayName: '창의예술',
    description: '창의적 활동 및 예술 교육',
    color: '#7c3aed',
    bgColor: '#faf5ff',
    borderColor: '#e9d5ff',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    keywords: ['창의', '예술', '표현', '상상력', '작품', '창작', '음악', '미술', '공연', '연주', '감상']
  },
  '체육건강': {
    name: '체육건강',
    displayName: '체육건강',
    description: '체육 활동 및 건강한 신체',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
    keywords: ['체육', '운동', '스포츠', '신체', '활동', '건강']
  },
  '환경정보': {
    name: '환경정보',
    displayName: '환경정보',
    description: '환경 보호 및 정보 교육',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    keywords: ['환경', '친환경', '재활용', '보호', '자연', '에코', '정보', '디지털', '컴퓨터', '인터넷', '기술', 'IT']
  },
  '행사활동': {
    name: '행사활동',
    displayName: '행사활동',
    description: '학교 행사 및 특별 활동',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    keywords: ['행사', '활동', '축제', '공연', '대회', '체험']
  },
  '상담지원': {
    name: '상담지원',
    displayName: '상담지원',
    description: '상담 및 면담 관련 안내',
    color: '#db2777',
    bgColor: '#fdf2f8',
    borderColor: '#fbcfe8',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    keywords: ['상담', '면담', '상의', '도움', '지원', '조언']
  },
  '학교알림': {
    name: '학교알림',
    displayName: '학교알림',
    description: '일반 공지사항 및 알림',
    color: '#ca8a04',
    bgColor: '#fefce8',
    borderColor: '#fef08a',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    keywords: ['알림', '공지', '안내', '정보', '전달', '통지']
  },
  '특별교육': {
    name: '특별교육',
    displayName: '특별교육',
    description: '계절/시기별 특별 교육 프로그램',
    color: '#0ea5e9',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
    keywords: ['특별', '계절', '방학', '특강', '프로그램']
  },
  '가정연계': {
    name: '가정연계',
    displayName: '가정연계',
    description: '가정과의 소통 및 연계 활동',
    color: '#be185d',
    bgColor: '#fdf2f8',
    borderColor: '#fbcfe8',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    keywords: ['가정', '부모', '학부모', '가족', '소통', '연계']
  },
  '기타사항': {
    name: '기타사항',
    displayName: '기타사항',
    description: '기타 및 일반 사항',
    color: '#4b5563',
    bgColor: '#f3f4f6',
    borderColor: '#d1d5db',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    keywords: ['기타', '그외', '나머지', '추가', '별도', '특별', '일반', '보통', '평상시', '기본', '평범', '통상']
  }
}

// 유틸리티 함수들
export const getCategoryMeta = (category: Category): CategoryMeta => {
  return categoryMetaMap[category]
}

export const getCategoryColor = (category: Category): string => {
  return categoryMetaMap[category]?.color || '#6b7280'
}

export const getCategoryGradient = (category: Category): string => {
  return categoryMetaMap[category]?.gradient || 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
}

export const getCategoryBgColor = (category: Category): string => {
  return categoryMetaMap[category]?.bgColor || '#f3f4f6'
}

export const getCategoryBorderColor = (category: Category): string => {
  return categoryMetaMap[category]?.borderColor || '#d1d5db'
}

// 키워드로 카테고리 추론
export const inferCategoryFromKeywords = (text: string): Category[] => {
  const lowerText = text.toLowerCase()
  const matchedCategories: Category[] = []
  
  categories.forEach(category => {
    const meta = categoryMetaMap[category]
    if (meta.keywords.some(keyword => lowerText.includes(keyword))) {
      matchedCategories.push(category)
    }
  })
  
  return matchedCategories.length > 0 ? matchedCategories : ['기타사항']
}

// 카테고리 유효성 검사
export const isValidCategory = (value: string): value is Category => {
  return categories.includes(value as Category)
}

// 확장 카테고리 유효성 검사
export const isValidExtendedCategory = (value: string): value is ExtendedCategory => {
  return value === '전체' || isValidCategory(value)
}

// 카테고리별 태그 매핑 (버전 1: 보수적 통합형)
export const categoryTagsMap: Record<Category, string[]> = {
  '학습관리': [
    // 기존 '학습'에서
    '시험안내', '발표수업', '과제제출', '학습습관', '집중력', '복습방법', 
    '독서활동', '신간도서', '도서관이용',
    // 기존 '숙제'에서  
    '일기쓰기', '독서과제', '수학문제', '받아쓰기', '그림그리기', '만들기',
    // 기존 '준비물'에서
    '학용품', '체육복', '급식도구', '실험재료', '미술재료', '음악도구'
  ],
  
  '생활지도': [
    '복장규정', '시간준수', '교실정리', '개인위생', '분실물', '전자기기',
    '인사예절', '언어예절', '공공예절'
  ],
  
  '안전보건': [
    // 기존 '안전'에서
    '교통안전', '실험안전', '체육안전', '놀이안전', '급식안전', '화재안전', 
    '대피훈련', '응급상황', '화학안전', '보호장비착용', '폭염대비', '한파대비', 
    '빗길안전', '눈길안전', '강풍대비',
    // 기존 '건강'에서
    '감기예방', '영양관리', '운동권장', '시력보호', '구강건강', '정신건강',
    '개인위생', '건강관리', '수분섭취', '체온조절', '습도관리', '환기'
  ],
  
  '인성교육': [
    // 기존 '인성'에서
    '학교폭력예방', '인성교육', '갈등해결', '배려', '존중', '협력정신',
    // 기존 '칭찬'에서
    '성실함', '친절함', '협력', '리더십', '창의성', '노력', '성장', '모범',
    // 기존 '주의'에서
    '규칙위반', '안전주의', '태도개선', '행동수정', '집중력', '책임감'
  ],
  
  '창의예술': [
    // 기존 '창의'에서
    '미술전시', '창작활동', '예술교육', '상상력', '표현력', '작품제작',
    // 기존 '예술'에서
    '음악회', '악기연주', '합창활동', '미술감상', '공연관람', '예술체험'
  ],
  
  '체육건강': [
    // 기존 '체육'에서
    '겨울체육', '준비운동', '체육안전', '운동기능', '체력향상', '스포츠정신'
  ],
  
  '환경정보': [
    // 기존 '환경'에서
    '환경보호', '분리수거', '재활용', '에너지절약', '친환경', '지구사랑',
    // 기존 '정보'에서
    '디지털리터러시', '인터넷윤리', '정보보안', 'IT활용', '컴퓨터교육', '사이버안전'
  ],
  
  '행사활동': [
    '학교행사', '계절행사', '기념일', '공연관람', '운동회', '졸업식',
    '체험학습', '견학'
  ],
  
  '상담지원': [
    '학부모상담', '개별상담', '진로상담', '학습상담', '교우관계', '고민해결'
  ],
  
  '학교알림': [
    '일정변경', '공지사항', '휴업안내', '등하교', '방과후', '특별수업'
  ],
  
  '특별교육': [
    '방학특강', '계절수업', '특별프로그램', '외부강사', '체험교육'
  ],
  
  '가정연계': [
    '가정통신문', '학부모참여', '가정교육', '가족행사', '부모교육'
  ],
  
  '기타사항': [
    // 기존 '기타' + '일반'에서
    '날씨안내', '특별안내', '임시공지', '기타사항', '기본안내', '평상시', 
    '일반사항', '기본수칙'
  ]
}

// 태그로 카테고리 찾기
export const getCategoryByTag = (tag: string): Category | null => {
  for (const [category, tags] of Object.entries(categoryTagsMap)) {
    if (tags.includes(tag)) {
      return category as Category
    }
  }
  return null
}

// 카테고리의 태그 목록 가져오기
export const getTagsByCategory = (category: Category): string[] => {
  return categoryTagsMap[category] || []
}

// 모든 태그 목록
export const allTags = Object.values(categoryTagsMap).flat()

// 태그 유효성 검사
export const isValidTag = (tag: string): boolean => {
  return allTags.includes(tag)
}
