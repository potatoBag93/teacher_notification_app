# 프로젝트 환경변수 사용 현황 정리

## 🔧 수정 완료된 파일들

### 1. src/services/configService.ts
**역할**: 중앙 집중식 설정 관리 서비스  
**상태**: ✅ 완료 (환경변수 통합 관리)

### 2. src/lib/supabase.ts
**역할**: Supabase 클라이언트 초기화  
**상태**: ✅ 완료 (configService 사용)
```typescript
// Before: import.meta.env.VITE_SUPABASE_URL
// After: getSupabaseUrl()
```

### 3. src/services/userService.ts
**역할**: 사용자 관리 서비스  
**상태**: ✅ 이미 완료 (configService 사용)

### 4. src/services/weatherService.ts
**역할**: 날씨 정보 수집 서비스  
**상태**: ✅ 완료 (configService 사용)
```typescript
// Before: import.meta.env.VITE_SUPABASE_URL
// After: getSupabaseUrl()
// Before: import.meta.env.VITE_USE_DUMMY_WEATHER
// After: isDevelopment() && import.meta.env.VITE_USE_DUMMY_WEATHER
```

### 5. src/lib/supabase-admin.ts
**역할**: RLS 우회용 관리자 클라이언트  
**상태**: ✅ 완료 (configService 사용)
```typescript
// Before: import.meta.env.VITE_SUPABASE_URL
// After: getSupabaseUrl()
```

### 6. src/views/MainView.vue
**역할**: 메인 페이지 Vue 컴포넌트  
**상태**: ✅ 완료 (configService 사용)
```typescript
// Before: import.meta.env.VITE_SUPABASE_URL/ANON_KEY
// After: getSupabaseUrl()/getSupabaseAnonKey()
```

### 7. src/App.vue
**역할**: 앱 루트 컴포넌트  
**상태**: ✅ 완료 (configService 사용)
```typescript
// Before: import.meta.env.DEV
// After: isDevelopment()
```

### 8. src/router/index.ts
**역할**: 라우터 설정  
**상태**: ✅ 이미 원복됨 (간단한 방식 유지)

## 🔄 그대로 유지된 파일들

### 1. src/config/environment.ts
**역할**: 환경변수 관리 (레거시)  
**상태**: 🔄 유지 (configService와 중복이지만 호환성 유지)

### 2. src/views/MainView.vue (AI_SYSTEM_UUID 부분)
```typescript
const AI_SYSTEM_UUID = import.meta.env.VITE_AI_SYSTEM_UUID
```
**상태**: 🔄 유지 (configService에 미포함)

### 3. src/services/weatherService.ts (DUMMY_WEATHER 부분)
```typescript
import.meta.env.VITE_USE_DUMMY_WEATHER === 'true'
```
**상태**: 🔄 유지 (개발용 플래그)

## 📋 사용된 환경변수 목록

### ✅ configService로 관리되는 환경변수
1. **VITE_SUPABASE_URL**
   - 용도: Supabase 프로젝트 URL
   - 필수: ✅
   - 예시: `https://your-almo.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - 용도: Supabase 공개 API 키
   - 필수: ✅
   - 예시: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **BASE_URL** (Vite 기본)
   - 용도: 앱 베이스 URL
   - 필수: ❌ (기본값: '/')
   - 예시: `/` 또는 `/app/`

4. **MODE** (Vite 기본)
   - 용도: 빌드 모드 (development/production)
   - 필수: ❌ (Vite가 자동 설정)

### 🔄 직접 사용되는 환경변수
5. **VITE_SUPABASE_SERVICE_KEY**
   - 용도: Supabase 서비스 키 (관리자용)
   - 필수: ❌ (개발용)
   - ⚠️ 프로덕션에서 사용 금지

6. **VITE_AI_SYSTEM_UUID**
   - 용도: AI 시스템 사용자 ID 식별
   - 필수: ❌ (기능용)

7. **VITE_USE_DUMMY_WEATHER**
   - 용도: 더미 날씨 데이터 사용 플래그
   - 필수: ❌ (개발용)
   - 값: `'true'` 또는 `'false'`

8. **VITE_SITE_URL** (옵션)
   - 용도: 프로덕션 사이트 URL
   - 필수: ❌
   - 기본값: `https://almo.vercel.app`

## 🚀 Vercel 배포용 환경변수 설정

Vercel Dashboard에서 다음 환경변수들을 설정하세요:

```bash
# 필수 환경변수
VITE_SUPABASE_URL=https://unjxokjoytbwkqmqidni.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# 선택적 환경변수
VITE_AI_SYSTEM_UUID=your-ai-system-uuid
VITE_SITE_URL=https://almo.vercel.app

# 개발용 (Production에 설정하지 마세요!)
# VITE_SUPABASE_SERVICE_KEY=service-key-here
# VITE_USE_DUMMY_WEATHER=false
```

## 🎯 수정 효과

1. **중앙 집중 관리**: 모든 설정이 configService를 통해 관리됨
2. **타입 안전성**: TypeScript로 설정 타입 검증
3. **런타임 설정 지원**: 브라우저에서 동적 설정 변경 가능
4. **환경별 최적화**: 개발/프로덕션 환경에 맞는 설정 자동 선택
5. **보안 강화**: 민감한 정보의 안전한 관리

## 🔧 추가 개선 사항

### 권장사항:
1. `src/config/environment.ts` 파일을 점진적으로 configService로 통합
2. 남은 환경변수들도 configService에 추가 고려
3. 타입 정의를 더욱 세밀하게 구성

### 개발 편의성:
- 환경변수 누락 시 명확한 에러 메시지 제공
- 개발자 도구에서 설정 상태 확인 가능
- 런타임 설정 변경으로 재배포 없이 설정 수정 가능