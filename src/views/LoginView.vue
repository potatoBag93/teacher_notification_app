<template>
  <div :class="$style.container">
    <div :class="$style.loginBox">
      <div :class="$style.logo">
        <h1 :class="$style.logoTitle">📝 알림장 도우미</h1>
        <p :class="$style.logoSubtitle">교사를 위한 스마트 알림장 작성 도구</p>
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
    console.log('[LoginView] 구글 로그인 버튼 클릭')
    
    const result = await authStore.loginWithGoogle()
    
    if (!result.success) {
      error.value = result.error || '구글 로그인에 실패했습니다.'
    }
    // 성공시에는 자동으로 구글 페이지로 리디렉션됨
  } catch (err: any) {
    console.error('[LoginView] 구글 로그인 에러:', err)
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
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 20px;
}

.loginBox {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logoTitle {
  color: #2c3e50;
  font-size: 24px;
  margin: 0;
}

.logoSubtitle {
  color: #7f8c8d;
  font-size: 14px;
  margin: 5px 0 0 0;
}

.form {
  margin-bottom: 20px;
}

.errorMessage {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border: 1px solid #ffcdd2;
}

.formGroup {
  margin-bottom: 20px;
}

.label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 14px;
}

.input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.input:focus {
  outline: none;
  border-color: #3498db;
}

.btn {
  width: 100%;
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 15px;
  transition: background-color 0.3s ease;
  font-family: inherit;
}

.btn:hover:not(:disabled) {
  background: #2980b9;
}

.btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btnSecondary {
  background: #95a5a6;
}

.btnSecondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.divider {
  text-align: center;
  margin: 20px 0;
  color: #95a5a6;
  font-size: 14px;
}

.links {
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.link {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.link:hover {
  text-decoration: underline;
  color: #2980b9;
}

@media (max-width: 480px) {
  .container {
    padding: 16px;
  }
  
  .loginBox {
    padding: 32px 24px;
  }
  
  .links {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
