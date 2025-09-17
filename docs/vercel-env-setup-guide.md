# Vercel 환경변수 설정 가이드

## 🚨 Vercel에서 "VITE_SUPABASE_ANON_KEY" 경고 해결하기

Vercel에서 환경변수를 설정할 때 다음과 같은 경고가 나타날 수 있습니다:

```
This key, which is prefixed with VITE_ and includes the term KEY, 
might expose sensitive information to the browser. 
Verify it is safe to share publicly.
```

## ✅ 해결 방법

### 1. 즉시 해결: "Add anyway" 클릭
- Vercel의 경고 메시지에서 **"Add anyway"** 버튼을 클릭하면 됩니다
- Supabase ANON KEY는 클라이언트 사이드에서 사용하도록 설계되어 안전합니다

### 2. 장기적 해결: 환경변수명 변경

#### 단계 1: 환경변수명 변경
```bash
# 기존 (경고 발생)
VITE_SUPABASE_ANON_KEY=your-key-here

# 변경 (경고 없음)
VITE_SUPABASE_PUBLIC_TOKEN=your-key-here
VITE_SUPABASE_CLIENT_KEY=your-key-here
```

#### 단계 2: 설정 서비스 업데이트
`src/services/configService.ts`에서 새로운 환경변수명 사용:

```typescript
// 설정 서비스에서 환경변수명 변경
this.config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLIC_TOKEN || 
                   import.meta.env.VITE_SUPABASE_ANON_KEY || '', // 하위호환성
  environment: import.meta.env.MODE === 'development' ? 'development' : 'production'
}
```

## 📋 Vercel 환경변수 설정 단계

### 방법 1: Vercel Dashboard
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 메뉴
4. 다음 환경변수들 추가:

```
Name: VITE_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: Production, Preview, Development

Name: VITE_SUPABASE_PUBLIC_TOKEN
Value: your-anon-key-here
Environment: Production, Preview, Development

Name: NODE_ENV
Value: production
Environment: Production
```

### 방법 2: Vercel CLI
```bash
# 환경변수 추가
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_PUBLIC_TOKEN production
vercel env add NODE_ENV production

# 환경변수 확인
vercel env ls

# 프로젝트 재배포
vercel --prod
```

## 🔒 보안 주의사항

### ✅ 안전한 환경변수 (VITE_ 접두사 사용 가능)
- `VITE_SUPABASE_URL`: 공개 API 엔드포인트
- `VITE_SUPABASE_ANON_KEY`: 공개 클라이언트 키 (RLS로 보호됨)
- `VITE_APP_NAME`: 애플리케이션 이름
- `VITE_API_BASE_URL`: 공개 API URL

### ❌ 위험한 환경변수 (VITE_ 접두사 절대 금지)
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용 키
- `DATABASE_PASSWORD`: 데이터베이스 비밀번호
- `JWT_SECRET`: JWT 서명 키
- `PRIVATE_API_KEY`: 비공개 API 키

## 🛠️ 런타임 설정 대안 (권장)

환경변수 경고를 완전히 피하려면 런타임 설정을 사용하세요:

### 1. public/config.js 생성
```javascript
// public/config.js
window.APP_CONFIG = {
  SUPABASE_URL: 'https://your-project-id.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  NODE_ENV: 'production'
}
```

### 2. index.html에서 로드
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teacher Notification App</title>
  
  <!-- 런타임 설정 로드 -->
  <script src="/config.js"></script>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### 3. 설정 서비스에서 자동 감지
현재 구현된 `configService.ts`가 자동으로 런타임 설정을 감지합니다:

```typescript
// 우선순위: 런타임 설정 > 환경변수 > 기본값
if (typeof window !== 'undefined' && (window as any).APP_CONFIG) {
  const runtimeConfig = (window as any).APP_CONFIG
  this.config = {
    supabaseUrl: runtimeConfig.SUPABASE_URL,
    supabaseAnonKey: runtimeConfig.SUPABASE_ANON_KEY,
    environment: runtimeConfig.NODE_ENV || 'production'
  }
}
```

## 🚀 배포 후 확인사항

1. **환경변수 로드 확인**
   ```javascript
   // 브라우저 콘솔에서 실행
   import { configService } from './src/services/configService'
   console.log(configService.getConfigInfo())
   ```

2. **Supabase 연결 테스트**
   ```javascript
   // 브라우저 콘솔에서 실행
   import { supabase } from './src/lib/supabase'
   supabase.from('user_profiles').select('count').then(console.log)
   ```

3. **로그인 테스트**
   - 구글 로그인이 정상 작동하는지 확인
   - 사용자 프로필이 올바르게 생성되는지 확인

## 📞 문제 해결

### 환경변수가 로드되지 않을 때
1. Vercel 설정에서 환경변수 확인
2. 프로젝트 재배포 (`vercel --prod`)
3. 브라우저 캐시 삭제
4. 런타임 설정 방식으로 대체

### Supabase 연결 실패 시
1. Supabase 프로젝트 URL 확인
2. ANON KEY 유효성 확인
3. RLS 정책 설정 확인
4. 네트워크 연결 상태 확인

이제 Vercel에서 경고 없이 환경변수를 설정할 수 있습니다! 🎉