# 📋 데이터베이스 관련 파트 체크리스트

이 체크리스트는 교사용 알림장 도우미 웹 애플리케이션의 데이터베이스(Supabase PostgreSQL) 관련 작업을 위한 상세 가이드입니다.

## 1. Supabase 프로젝트 설정 및 초기화

- [ ] **프로젝트 생성**: Supabase 웹사이트에서 새 프로젝트 생성
  - [ ] 프로젝트 이름 설정 (예: `teacher-notification-app`)
  - [ ] 데이터베이스 비밀번호 설정
  - [ ] 리전(Region) 선택 (사용자와 가까운 곳으로)
- [ ] **API 키 및 URL 확보**:
  - [ ] `Project URL` 확인 및 기록
  - [ ] `anon public key` 확인 및 기록
  - [ ] `service_role key` (관리자용, 서버 사이드에서만 사용) 확인 및 기록

## 2. 데이터베이스 스키마 설계 및 구현

`project_final_approved.md` 및 `functional_specification.md`를 기반으로 테이블을 생성합니다.

### 2.1 `blocks` 테이블 (문구 블록)
- [ ] **테이블 생성**: `blocks`
- [ ] **컬럼 정의**:
  - `id`: UUID (Primary Key, Default: `gen_random_uuid()`)
  - `title`: VARCHAR(200) (NOT NULL)
  - `content`: TEXT (NOT NULL)
  - `tags`: JSONB (NOT NULL, 예: `["안전", "여름활동"]`)
  - `created_by`: UUID (NOT NULL, `users` 테이블의 `id` 참조)
  - `created_at`: TIMESTAMP (Default: `now()`)
  - `updated_at`: TIMESTAMP (Default: `now()`, `ON UPDATE now()` 트리거 설정 고려)
  - `is_public`: BOOLEAN (Default: `true`)
  - `is_edited`: BOOLEAN (Default: `false`, 원본/편집본 구분)
  - `original_block_id`: UUID (NULL 허용, `blocks` 테이블의 `id` 참조, 편집본인 경우)
  - `usage_count`: INTEGER (Default: `0`)
  - `likes_count`: INTEGER (Default: `0`)
  - `report_status`: VARCHAR(20) (Default: `'none'`, Enum: `'none'`, `'reported'`, `'hidden'`, `'approved'`)
  - `report_count`: INTEGER (Default: `0`)
- [ ] **인덱스 추가**: `created_at`, `is_public`, `tags` (GIN 인덱스) 등 쿼리 성능 향상을 위한 인덱스 고려
- [ ] **RLS (Row Level Security) 정책 설정**:
  - [ ] `SELECT` 정책: 모든 사용자에게 공개된 블록 조회 허용
  - [ ] `INSERT` 정책: 인증된 사용자에게 블록 생성 허용
  - [ ] `UPDATE` 정책: 블록 작성자에게만 수정 허용 (또는 관리자)
  - [ ] `DELETE` 정책: 블록 작성자에게만 삭제 허용 (또는 관리자)

### 2.2 `users` 테이블 (사용자)
- [ ] **테이블 생성**: `users`
- [ ] **컬럼 정의**:
  - `id`: UUID (Primary Key, Supabase Auth의 `auth.users.id` 참조)
  - `email`: VARCHAR(255) (UNIQUE, NOT NULL)
  - `name`: VARCHAR(100) (NOT NULL)
  - `school_name`: VARCHAR(200) (NULL 허용)
  - `role`: VARCHAR(20) (Default: `'teacher'`, Enum: `'teacher'`, `'admin'`)
  - `status`: VARCHAR(20) (Default: `'pending'`, Enum: `'pending'`, `'active'`, `'suspended'`)
  - `created_at`: TIMESTAMP (Default: `now()`)
  - `last_login`: TIMESTAMP (NULL 허용)
- [ ] **RLS 정책 설정**:
  - [ ] `SELECT` 정책: 자신의 프로필만 조회 허용 (관리자는 모든 프로필)
  - [ ] `UPDATE` 정책: 자신의 프로필만 수정 허용
- [ ] **Supabase Auth 연동**: `auth.users` 테이블과 `users` 테이블 간의 동기화 설정 (트리거 또는 함수 사용)

### 2.3 `reports` 테이블 (신고)
- [ ] **테이블 생성**: `reports`
- [ ] **컬럼 정의**:
  - `id`: UUID (Primary Key, Default: `gen_random_uuid()`)
  - `block_id`: UUID (NOT NULL, `blocks` 테이블의 `id` 참조)
  - `reporter_id`: UUID (NOT NULL, `users` 테이블의 `id` 참조)
  - `report_type`: VARCHAR(50) (NOT NULL, Enum: `'inappropriate_content'`, `'inappropriate_tag'`, `'other'`)
  - `reason`: TEXT (NULL 허용, 상세 사유)
  - `created_at`: TIMESTAMP (Default: `now()`)
  - `status`: VARCHAR(20) (Default: `'pending'`, Enum: `'pending'`, `'resolved'`, `'dismissed'`)
- [ ] **RLS 정책 설정**:
  - [ ] `INSERT` 정책: 인증된 사용자에게 신고 생성 허용
  - [ ] `SELECT` 정책: 자신의 신고 내역만 조회 허용 (관리자는 모든 신고)

### 2.4 `editing_sessions` 테이블 (편집 세션)
- [ ] **테이블 생성**: `editing_sessions`
- [ ] **컬럼 정의**:
  - `id`: UUID (Primary Key, Default: `gen_random_uuid()`)
  - `user_id`: UUID (NOT NULL, `users` 테이블의 `id` 참조)
  - `selected_blocks`: JSONB (선택된 블록 ID들, 예: `["uuid1", "uuid2"]`)
  - `editing_blocks`: JSONB (편집 중인 블록 데이터, 예: `[{id: "uuid1", content: "..."}]`)
  - `auto_title`: VARCHAR(255) (자동 생성된 제목)
  - `created_at`: TIMESTAMP (Default: `now()`)
  - `updated_at`: TIMESTAMP (Default: `now()`, `ON UPDATE now()` 트리거 설정 고려)
- [ ] **RLS 정책 설정**:
  - [ ] `SELECT`, `INSERT`, `UPDATE`, `DELETE` 정책: 자신의 세션만 허용

## 3. 초기 데이터 (Seeding)

- [ ] **카테고리 데이터**: `tags` 컬럼에 사용될 13개 카테고리 목록 정의
- [ ] **샘플 블록 데이터**: `blocks` 테이블에 20-30개 초기 문구 삽입 (다양한 카테고리 포함)
- [ ] **테스트 사용자**: 관리자 계정 및 일반 교사 계정 생성

## 4. 프론트엔드 (Vue.js) 통합

### 4.1 Supabase 클라이언트 설정
- [ ] `@supabase/supabase-js` 라이브러리 설치
- [ ] `.env` 파일에 Supabase `Project URL` 및 `anon public key` 환경 변수 설정
- [ ] `src/lib/supabaseClient.ts` (또는 유사 경로) 파일에 Supabase 클라이언트 인스턴스 초기화 및 내보내기

### 4.2 인증 모듈 구현
- [ ] **회원가입**: `supabase.auth.signUp()`
- [ ] **로그인**: `supabase.auth.signInWithPassword()`
- [ ] **로그아웃**: `supabase.auth.signOut()`
- [ ] **세션 관리**: `supabase.auth.onAuthStateChange()`를 사용하여 사용자 세션 상태 감지 및 Vuex/Pinia 스토어에 저장

### 4.3 `blocks` 테이블 CRUD 연동
- [ ] **블록 조회 (Read)**:
  - [ ] 모든 공개 블록 가져오기 (`MainView.vue`)
  - [ ] 특정 블록 가져오기
- [ ] **블록 생성 (Create)**:
  - [ ] 새 블록 데이터 Supabase에 저장 (`EditView.vue`)
- [ ] **블록 수정 (Update)**:
  - [ ] 기존 블록 데이터 Supabase에 업데이트 (`EditView.vue`)
- [ ] **블록 삭제 (Delete)**:
  - [ ] 특정 블록 Supabase에서 삭제

### 4.4 기타 데이터 연동
- [ ] `reports` 테이블: 신고 기능 연동
- [ ] `editing_sessions` 테이블: 편집 세션 저장 및 불러오기 기능 연동

## 5. 고급 기능 및 최적화

- [ ] **Full-Text Search**: `blocks` 테이블 `content` 및 `title` 컬럼에 Full-Text Search 인덱스 설정 및 검색 기능 구현
- [ ] **데이터베이스 함수 (RPC)**: 복잡한 비즈니스 로직을 위한 PostgreSQL 함수 작성 및 Supabase RPC를 통해 호출
- [ ] **Realtime**: `blocks` 테이블의 변경 사항을 실시간으로 감지하여 UI 업데이트 (예: 좋아요 수 실시간 반영)
- [ ] **성능 모니터링**: Supabase 대시보드에서 쿼리 성능 및 사용량 모니터링
- [ ] **캐싱 전략**: 자주 조회되는 데이터에 대한 클라이언트/서버 측 캐싱 적용

## 6. 테스트 및 검증

- [ ] **단위 테스트**: 각 데이터베이스 상호작용 함수에 대한 단위 테스트 작성
- [ ] **통합 테스트**: 인증, CRUD, RLS 정책이 올바르게 작동하는지 확인하는 통합 테스트 작성
- [ ] **수동 테스트**: UI를 통해 모든 기능이 예상대로 작동하는지 철저히 테스트
- [ ] **데이터 무결성 검사**: 외래 키 제약 조건 및 데이터 타입이 올바른지 확인

## 7. 배포 및 유지보수

- [ ] **환경 변수 관리**: 개발, 스테이징, 프로덕션 환경에 따른 `.env` 파일 및 Supabase 환경 변수 설정
- [ ] **백업 전략**: Supabase 자동 백업 설정 확인 및 필요시 수동 백업 수행
- [ ] **스키마 마이그레이션**: 데이터베이스 스키마 변경 시 마이그레이션 도구 또는 스크립트 사용 계획 수립
- [ ] **모니터링 및 로깅**: Supabase 로그 및 애플리케이션 로깅을 통해 문제 발생 시 신속 대응