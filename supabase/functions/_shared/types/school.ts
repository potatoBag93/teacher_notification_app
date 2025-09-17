// 학교 관련 타입 정의

export interface SchoolInfo {
  schoolCode: string;        // 나이스 학교 코드
  schoolName: string;        // 학교명
  schoolType: string;        // 학교급 (초등학교, 중학교, 고등학교)
  address: string;           // 도로명 주소
  sido: string;              // 시도명 (서울특별시)
  sigungu: string;           // 시군구명 (강남구)
  latitude?: number;         // 위도
  longitude?: number;        // 경도
}

export interface SchoolSearchRequest {
  keyword: string;           // 검색 키워드
  page?: number;             // 페이지 번호
  size?: number;             // 페이지 크기
  sido?: string;             // 시도 필터
}

export interface SchoolSearchResponse {
  schools: SchoolInfo[];     // 검색된 학교 목록
  total: number;             // 전체 검색 결과 수
  page: number;              // 현재 페이지
  hasMore: boolean;          // 다음 페이지 존재 여부
}
