# 프로덕션 환경 배포 가이드

## 1. Vercel에서 환경변수 설정

### 방법 1: Vercel Dashboard 사용
1. Vercel 프로젝트 대시보드 접속
2. Settings → Environment Variables 메뉴
3. 다음 변수들 추가:
   ```
  VITE_SUPABASE_URL=https://your-almo.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   NODE_ENV=production
   ```

### 방법 2: Vercel CLI 사용
```bash
# 환경변수 설정
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add NODE_ENV

# 설정 확인
vercel env ls
```

## 2. Netlify에서 환경변수 설정

### Netlify Dashboard 사용
1. Site Settings → Environment Variables
2. 환경변수 추가:
   ```
  VITE_SUPABASE_URL=https://your-almo.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   NODE_ENV=production
   ```

## 3. 다른 호스팅 서비스

### Docker 컨테이너
```dockerfile
# Dockerfile
FROM node:18-alpine

# 환경변수 설정
ENV VITE_SUPABASE_URL=https://your-almo.supabase.co
ENV VITE_SUPABASE_ANON_KEY=your-anon-key-here
ENV NODE_ENV=production

# 앱 빌드 및 실행
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "preview"]
```

### 정적 호스팅 (GitHub Pages, S3 등)
HTML 파일에 런타임 설정 추가:

```html
<!DOCTYPE html>
<html>
<head>
  <title>알뭐</title>
  
  <!-- 런타임 환경변수 설정 -->
  <script>
    window.ENV = {
  VITE_SUPABASE_URL: 'https://your-almo.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'your-anon-key-here',
      NODE_ENV: 'production'
    }
  </script>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

## 4. 환경변수 보안 주의사항

### ⚠️ 중요: 클라이언트 사이드 보안
- `VITE_` 접두사가 붙은 환경변수는 **빌드 시점에 번들에 포함됨**
- 민감한 정보(서버 전용 키)는 절대 `VITE_` 접두사 사용 금지
- Supabase ANON KEY는 공개되어도 안전하도록 설계됨 (RLS 정책으로 보호)

### ✅ 안전한 환경변수
```bash
VITE_SUPABASE_URL=https://almo.supabase.co  # ✅ 공개 가능
VITE_SUPABASE_ANON_KEY=eyJ...                  # ✅ 공개 가능 (RLS로 보호)
VITE_APP_NAME=알뭐         # ✅ 공개 가능
```

### ❌ 위험한 환경변수 (사용 금지)
```bash
VITE_SUPABASE_SERVICE_KEY=service_role_key     # ❌ 절대 사용 금지
VITE_DATABASE_PASSWORD=secret123               # ❌ 절대 사용 금지
VITE_API_SECRET=secret456                      # ❌ 절대 사용 금지
```

## 5. 환경변수 검증 스크립트

```javascript
// scripts/validate-env.js
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
]

const missing = requiredEnvVars.filter(varName => !process.env[varName])

if (missing.length > 0) {
  console.error('❌ 필수 환경변수가 설정되지 않았습니다:')
  missing.forEach(varName => console.error(`  - ${varName}`))
  process.exit(1)
}

console.log('✅ 모든 환경변수가 올바르게 설정되었습니다.')
```

package.json에 스크립트 추가:
```json
{
  "scripts": {
    "validate-env": "node scripts/validate-env.js",
    "build": "npm run validate-env && vite build"
  }
}
```

## 6. 추천 방법

1. **개발 환경**: `.env.local` 파일 사용
2. **프로덕션 환경**: 호스팅 서비스의 환경변수 설정 기능 사용
3. **백업 방법**: 런타임 HTML 스크립트 설정
4. **검증**: 빌드 전 환경변수 유효성 검사 스크립트 실행