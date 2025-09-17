# Supabase Functions - 서버 사이드 기능 정리

## 📁 폴더 구조
```
supabase/
├── functions/
│   ├── weather-notice-generator/     # 날씨 기반 문구 생성
│   ├── school-search/               # 학교 검색 및 위치 정보
│   ├── coordinate-converter/        # 좌표 변환 유틸리티
│   ├── news-analyzer/               # 뉴스 분석 (향후)
│   ├── usage-statistics/            # 사용 통계 분석 (향후)
│   └── shared/                      # 공통 유틸리티
│       ├── api-clients/            # 외부 API 클라이언트
│       ├── constants/              # 상수 정의
│       └── utils/                  # 공통 함수
└── README.md                        # 이 파일
```

## 🎯 서버에서 처리해야 하는 기능들

### 1. 날씨 기반 문구 생성 시스템

#### 🌤️ `weather-notice-generator`
**기능**: 매일 날씨 정보를 수집하여 AI 문구 생성

**처리 과정**:
1. 전체 사용자의 학교 위치 정보 수집
2. 지역별로 그룹핑 (중복 API 호출 방지)
3. 기상청 API로 날씨 정보 수집
4. 환경부 API로 미세먼지 정보 수집
5. AI API로 맞춤 문구 생성
6. blocks 테이블에 저장

**스케줄링**: 매일 새벽 6시 자동 실행

**API 의존성**:
- 기상청 단기예보 API
- 환경부 대기오염정보 API  
- OpenAI/Claude API

---

### 2. 학교 정보 관리 시스템

#### 🏫 `school-search`
**기능**: 학교명 검색 및 위치 정보 제공

**처리 과정**:
1. 사용자가 학교명 입력
2. 교육부 나이스 API 호출
3. 검색 결과 반환
4. 선택된 학교의 위도/경도 추출
5. 좌표 변환하여 기상청 격자 좌표 계산
6. 사용자 프로필에 저장

**API 의존성**:
- 교육부 나이스 API

#### 📍 `coordinate-converter`
**기능**: 위도/경도를 기상청 격자 좌표로 변환

**처리 과정**:
1. 위도/경도 입력받음
2. Lambert 좌표계 변환 공식 적용
3. 기상청 격자 좌표 (nx, ny) 반환

**변환 공식**: 기상청 공식 변환 알고리즘 구현

---

### 3. 외부 API 관리 시스템

#### 🔌 `shared/api-clients`
**기능**: 외부 API 호출을 위한 클라이언트 모듈

**포함 클라이언트**:
- **KMAClient**: 기상청 API 클라이언트
- **NEISClient**: 교육부 나이스 API 클라이언트  
- **AirKoreaClient**: 환경부 대기질 API 클라이언트
- **OpenAIClient**: AI 문구 생성 클라이언트

**공통 기능**:
- API 키 관리
- 요청 제한 (Rate Limiting)
- 에러 핸들링
- 응답 캐싱

---

## 🚀 구현 우선순위

### Phase 1: 기본 인프라 (1주)
1. **coordinate-converter** - 좌표 변환 함수
2. **school-search** - 학교 검색 기능
3. **shared/api-clients** - 기본 API 클라이언트

### Phase 2: 날씨 시스템 (1-2주)
1. **weather-notice-generator** - 날씨 문구 생성
2. 스케줄링 설정 (cron job)
3. 에러 처리 및 로깅

### Phase 3: 고도화 (향후)
1. **news-analyzer** - 뉴스 기반 문구 생성
2. **usage-statistics** - 사용 통계 분석
3. 성능 최적화 및 모니터링

---

## 🔒 보안 고려사항

### API 키 관리
- Supabase Secrets로 API 키 저장
- 환경변수를 통한 안전한 접근
- 키 순환 및 만료 관리

### 요청 제한
- 외부 API 호출 횟수 제한
- 사용자당 요청 제한
- DDoS 방지를 위한 Rate Limiting

### 데이터 보호
- 개인정보 최소 수집
- 로그에서 민감 정보 제외
- HTTPS 강제 사용

---

## 📊 모니터링 및 로깅

### 로그 레벨
- **ERROR**: API 호출 실패, 시스템 오류
- **WARN**: 요청 제한 도달, 품질 경고
- **INFO**: 정상 작업 완료, 통계 정보
- **DEBUG**: 상세 실행 과정 (개발용)

### 모니터링 지표
- API 호출 성공률
- 응답 시간
- 생성된 문구 품질 점수
- 사용자 만족도

---

## 🧪 테스트 전략

### 단위 테스트
- 각 함수별 개별 테스트
- 모킹을 통한 외부 API 테스트
- 에러 케이스 테스트

### 통합 테스트
- 전체 플로우 테스트
- 실제 API 연동 테스트
- 스케줄링 테스트

### 성능 테스트
- 대량 데이터 처리 테스트
- 동시 요청 처리 테스트
- 메모리 및 CPU 사용량 모니터링

---

## 📚 참고 자료

### API 문서
- [기상청 API 가이드](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15084084)
- [교육부 나이스 API](https://open.neis.go.kr/portal/guide/service.do)
- [환경부 대기질 API](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15073861)
- [Supabase Functions 가이드](https://supabase.com/docs/guides/functions)

### 기술 스택
- **Runtime**: Deno (Supabase Functions 기본)
- **HTTP Client**: fetch API 
- **Database**: Supabase PostgreSQL
- **Scheduling**: pg_cron 확장

---

## 🎯 다음 단계

1. **API 키 발급**: data.go.kr에서 필요한 API 키들 발급
2. **좌표 변환 구현**: Lambert 좌표계 변환 함수 작성
3. **학교 검색 구현**: 나이스 API 연동 및 테스트
4. **날씨 API 연동**: 기상청 API 호출 및 파싱
5. **AI 문구 생성**: OpenAI/Claude API 연동

**목표**: Phase 1 완료 후 실제 날씨 기반 문구 생성 데모 구현
