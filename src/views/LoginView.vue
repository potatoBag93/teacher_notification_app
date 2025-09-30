<template>
  <div :class="$style.container">
    <div :class="$style.loginBox">
      <div :class="$style.logo">
  <h1 :class="$style.logoTitle">📝 알뭐</h1>
  <p :class="$style.logoSubtitle">교사를 위한 스마트 알뭐 작성 도구</p>
      </div>
      
      <form :class="$style.form" @submit.prevent="handleGoogleLogin">
        <!-- 에러 메시지 -->
        <div v-if="error" :class="$style.errorMessage">
          {{ error }}
        </div>
        
        <!-- 구글 로그인 버튼 -->
        <button 
          type="button" 
          :class="[$style.btn, $style.googleBtn]"
          :disabled="isLoading"
          @click="handleGoogleLogin"
        >
          <svg :class="$style.googleIcon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ isLoading ? '로그인 중...' : 'Google로 계속하기' }}
        </button>
      </form>
      <div :class="$style.termsNotice">
        <span>
          계속하면 <a href="/terms" target="_blank" :class="$style.termsLink">서비스 이용약관</a> 및 <a href="/privacy" target="_blank" :class="$style.termsLink">개인정보 처리방침</a>에<br>동의한 것으로 간주합니다.
        </span>
      </div>
      <div :class="$style.divider">또는</div>
      
      <div :class="$style.links">
        <router-link to="/" :class="$style.link">둘러보기</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')

const handleGoogleLogin = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    // console.log('[LoginView] 구글 로그인 버튼 클릭')
    
    const result = await authStore.loginWithGoogle()
    
    if (!result.success) {
      error.value = result.error || '구글 로그인에 실패했습니다.'
    }
    // 성공시에는 자동으로 구글 페이지로 리디렉션됨
  } catch (err: any) {
    // console.error('[LoginView] 구글 로그인 에러:', err)
    error.value = err.message || '로그인 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 이미 로그인된 사용자는 메인 페이지로 리다이렉트
if (authStore.isAuthenticated) {
  if (authStore.isApproved) {
    router.push('/')
  } else {
    router.push('/pending-approval')
  }
}
</script>

<style module>

/* 미니멀 스타일 */
.container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f7fa; padding: 20px; }
.loginBox { background: #fff; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); width: 100%; max-width: 420px; border: 1px solid #e5e7eb; }
.logo { text-align: center; margin-bottom: 18px; display: grid; gap: 4px; }
.logoTitle { margin: 0; font-size: 1.5rem; color: #111827; }
.logoSubtitle { margin: 0; font-size: 0.95rem; color: #6b7280; }
.form { margin-bottom: 20px; }
.errorMessage { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 10px; padding: 12px; margin-bottom: 16px; font-size: 0.9rem; }
.btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.6rem; background: #fff; color: #111827; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s ease; }
.btn:hover:not(:disabled) { background: #f9fafb; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.googleIcon { width: 18px; height: 18px; }
.links { margin-top: 12px; text-align: center; font-size: 0.85rem; color: #6b7280; }
.link { color: #2563eb; text-decoration: none; margin: 0 4px; }
.link:hover { text-decoration: underline; }
@media (max-width: 480px) { .loginBox { padding: 32px 24px; } .logoTitle { font-size: 1.35rem; } }

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #b0b6be;
  font-size: 0.93rem;
  margin: 18px 0 10px 0;
  font-weight: 500;
  letter-spacing: 0.01em;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1.5px solid #e5e7eb;
  margin: 0 10px;
  height: 0;
}

.termsNotice {
  background: #f3f4f6;
  color: #6b7280;
  font-size: 0.92rem;
  text-align: center;
  border-radius: 8px;
  padding: 10px 12px 9px 12px;
  margin: 10px 0 18px 0;
  line-height: 1.6;
}
.termsLink {
  color: #2563eb;
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.2s;
}
.termsLink:hover {
  color: #1d4ed8;
}
</style>
