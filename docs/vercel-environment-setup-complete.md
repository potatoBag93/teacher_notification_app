# Vercel 환경변수 설정 완전 가이드

## 🚀 필수 환경변수 (반드시 설정 필요)

### 1. Supabase 관련
```bash
VITE_SUPABASE_URL=https://unjxokjoytbwkqmqidni.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🔧 선택적 환경변수 (기능별 설정)

### 2. AI 시스템 관련
```bash
# AI가 생성한 블록을 식별하기 위한 시스템 UUID
VITE_AI_SYSTEM_UUID=your-ai-system-uuid-here
```

### 3. 사이트 URL (권장)
```bash
# OAuth 리다이렉트 및 절대 URL 생성용
VITE_SITE_URL=https://teacher-notification-app.vercel.app
```

### 4. 개발/테스트 관련 (Production에 설정하지 마세요!)
```bash
# 더미 날씨 데이터 사용 (개발/테스트용만)
VITE_USE_DUMMY_WEATHER=false

# Supabase 서비스 키 (RLS 우회용, 개발용만)
# ⚠️ 절대 Production에 설정하지 마세요!
# VITE_SUPABASE_SERVICE_KEY=service-key-here
```

## 📋 Vercel Dashboard 설정 방법

### 방법 1: Vercel Dashboard 웹 인터페이스

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택: `teacher-notification-app`
3. **Settings** → **Environment Variables** 메뉴
4. 다음 환경변수들을 하나씩 추가:

#### 필수 환경변수
```
Name: VITE_SUPABASE_URL
Value: https://unjxokjoytbwkqmqidni.supabase.co
Environment: ✅ Production ✅ Preview ✅ Development

Name: VITE_SUPABASE_ANON_KEY
Value: [Supabase에서 복사한 anon key]
Environment: ✅ Production ✅ Preview ✅ Development
```

#### 선택적 환경변수
```
Name: VITE_AI_SYSTEM_UUID
Value: [AI 시스템 UUID]
Environment: ✅ Production ✅ Preview ✅ Development

Name: VITE_SITE_URL
Value: https://teacher-notification-app.vercel.app
Environment: ✅ Production ✅ Preview
```

### 방법 2: Vercel CLI

```bash
# Vercel CLI로 환경변수 설정
vercel env add VITE_SUPABASE_URL production
# 값 입력: https://unjxokjoytbwkqmqidni.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# 값 입력: [your-anon-key]

vercel env add VITE_AI_SYSTEM_UUID production
# 값 입력: [your-ai-uuid]

vercel env add VITE_SITE_URL production
# 값 입력: https://teacher-notification-app.vercel.app

# 설정 확인
vercel env ls

# 재배포
vercel --prod
```

## 🔍 현재 설정된 환경변수 확인

배포 후 브라우저 콘솔에서 다음 코드로 확인:

```javascript
// 환경변수 설정 상태 확인
import { getConfigInfo } from './src/config/environment'
console.log('🔧 환경변수 설정 상태:', getConfigInfo())

// 개별 환경변수 확인
import { 
  getSupabaseUrl, 
  getSupabaseAnonKey, 
  getEnvironment,
  getSiteUrl,
  getAiSystemUuid 
} from './src/config/environment'

console.log('📊 환경변수 상세:')
console.log('Supabase URL:', getSupabaseUrl())
console.log('Anon Key 존재:', !!getSupabaseAnonKey())
console.log('환경:', getEnvironment())
console.log('사이트 URL:', getSiteUrl())
console.log('AI UUID:', getAiSystemUuid())
```

## ⚠️ 보안 주의사항

### ✅ Production에 안전하게 설정 가능
- `VITE_SUPABASE_URL`: 공개 API 엔드포인트
- `VITE_SUPABASE_ANON_KEY`: RLS로 보호되는 공개 키
- `VITE_AI_SYSTEM_UUID`: 단순 식별자
- `VITE_SITE_URL`: 공개 사이트 URL

### ❌ Production에 절대 설정하면 안되는 것들
- `VITE_SUPABASE_SERVICE_KEY`: 모든 RLS 우회 가능
- `VITE_USE_DUMMY_WEATHER=true`: 개발용 설정

## 🎯 환경별 설정 권장사항

### Production 환경
```bash
VITE_SUPABASE_URL=https://unjxokjoytbwkqmqidni.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AI_SYSTEM_UUID=your-ai-uuid
VITE_SITE_URL=https://teacher-notification-app.vercel.app
```

### Preview 환경
```bash
VITE_SUPABASE_URL=https://unjxokjoytbwkqmqidni.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AI_SYSTEM_UUID=your-ai-uuid
VITE_SITE_URL=https://teacher-notification-app-git-[branch].vercel.app
VITE_USE_DUMMY_WEATHER=false
```

### Development 환경 (로컬)
```bash
VITE_SUPABASE_URL=https://unjxokjoytbwkqmqidni.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AI_SYSTEM_UUID=your-ai-uuid
VITE_SITE_URL=http://localhost:5173
VITE_USE_DUMMY_WEATHER=true
VITE_SUPABASE_SERVICE_KEY=your-service-key
```

## 🚀 설정 후 체크리스트

- [ ] `VITE_SUPABASE_URL` 설정됨
- [ ] `VITE_SUPABASE_ANON_KEY` 설정됨 (경고 무시하고 "Add anyway")
- [ ] `VITE_AI_SYSTEM_UUID` 설정됨 (선택사항)
- [ ] `VITE_SITE_URL` 설정됨 (권장)
- [ ] 위험한 환경변수는 Production에 설정하지 않음
- [ ] 배포 후 환경변수 로딩 테스트
- [ ] 구글 로그인 테스트
- [ ] 날씨 기능 테스트

## 📞 문제 해결

### 환경변수가 로드되지 않을 때
1. Vercel 환경변수 설정 재확인
2. 프로젝트 재배포: `vercel --prod`
3. 브라우저 캐시 삭제
4. 콘솔에서 `getConfigInfo()` 실행하여 상태 확인

### "환경변수를 찾을 수 없습니다" 에러
1. Vercel Dashboard에서 해당 환경변수가 설정되어 있는지 확인
2. Environment 체크박스(Production, Preview, Development)가 올바르게 설정되었는지 확인
3. 배포 완료 후 5-10분 정도 기다려보기

이제 Vercel에서 안전하고 완전한 환경변수 설정을 할 수 있습니다! 🎉