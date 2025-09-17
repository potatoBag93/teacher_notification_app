# Supabase OAuth 설정 가이드

## 🚨 중요: Localhost 리다이렉트 문제 해결

현재 구글 로그인 후 localhost로 리다이렉트되는 문제는 **Supabase Dashboard 설정** 때문입니다.

## 📋 Supabase Dashboard 설정 단계

### 1. Supabase Dashboard 접속
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Authentication** → **Settings** 메뉴

### 2. Site URL 설정
**Settings** → **General** 탭에서:

```
Site URL: https://teacher-notification-app.vercel.app
```

⚠️ **주의**: `localhost:3000`이나 `localhost:5173`이 설정되어 있으면 안됩니다!

### 3. Redirect URLs 설정
**Settings** → **General** 탭에서 **Redirect URLs** 섹션:

```
https://teacher-notification-app.vercel.app/auth/callback
http://localhost:5173/auth/callback (개발용)
```

### 4. Google OAuth 설정 확인
**Settings** → **Providers** 탭에서 Google 설정:

```
✅ Google enabled: ON
Client ID: (구글 콘솔에서 발급받은 ID)
Client Secret: (구글 콘솔에서 발급받은 Secret)
```

## 🔧 현재 문제 진단

URL에서 `http://localhost:3000`이 보이는 것은:
1. **Site URL**이 localhost로 설정되어 있거나
2. **Google OAuth**의 **Authorized redirect URIs**가 localhost를 포함하고 있기 때문입니다.

## 🛠️ 즉시 해결 방법

### Supabase Dashboard에서 확인할 항목:

1. **Authentication** → **Settings** → **General**
   - Site URL: `https://teacher-notification-app.vercel.app`
   - Redirect URLs에 production URL 추가

2. **Authentication** → **Settings** → **Providers** → **Google**
   - Google OAuth 설정 확인

### Google Cloud Console에서 확인할 항목:

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **APIs & Services** → **Credentials**
3. OAuth 2.0 Client ID 선택
4. **Authorized redirect URIs**에서:
   ```
   https://unjxokjoytbwkqmqidni.supabase.co/auth/v1/callback
   ```
   이 URL이 있는지 확인

## 📝 설정 완료 후 테스트

1. Supabase Dashboard에서 설정 저장
2. 브라우저 캐시 삭제
3. Vercel 배포된 사이트에서 구글 로그인 테스트
4. 로그인 완료 후 production URL의 메인페이지로 이동하는지 확인

## 🔍 문제 해결 체크리스트

- [ ] Supabase Site URL이 production URL로 설정됨
- [ ] Supabase Redirect URLs에 production callback URL 추가됨
- [ ] Google OAuth에서 Supabase callback URL이 허용됨
- [ ] 브라우저 캐시 삭제함
- [ ] localhost가 아닌 production에서 테스트함

## 📞 추가 문제 해결

만약 여전히 문제가 발생하면:

1. **Supabase 프로젝트 URL 확인**:
   ```
   https://unjxokjoytbwkqmqidni.supabase.co
   ```

2. **Google OAuth Redirect URI**:
   ```
   https://unjxokjoytbwkqmqidni.supabase.co/auth/v1/callback
   ```

3. **브라우저 개발자 도구**에서 네트워크 탭 확인:
   - 구글 로그인 후 어느 URL로 리다이렉트되는지 추적

이 설정들을 모두 확인하고 수정하면 localhost 리다이렉트 문제가 해결됩니다! 🎉