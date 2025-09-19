<template>
  <div :class="$style.container">
    <div :class="$style.callbackBox">
      <div :class="$style.spinner" v-if="isLoading">
        <div :class="$style.spinnerIcon">⏳</div>
        <h2>로그인 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
      
      <div v-else-if="error" :class="$style.error">
        <div :class="$style.errorIcon">❌</div>
        <h2>로그인 실패</h2>
        <p>{{ error }}</p>
        <button :class="$style.retryBtn" @click="$router.push('/login')">
          다시 시도
        </button>
      </div>
      
      <div v-else :class="$style.success">
        <div :class="$style.successIcon">✅</div>
        <h2>로그인 성공</h2>
        <p>메인 페이지로 이동합니다...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  console.log('[AuthCallback] OAuth 콜백 페이지 마운트됨')
  
  try {
    // OAuth 콜백 처리
    const result = await authStore.handleAuthCallback()
    
    if (result.success) {
      console.log('[AuthCallback] 콜백 처리 성공')
      
      // 프로필 완성도와 승인 상태에 따라 리디렉션
      setTimeout(() => {
        if (!authStore.isProfileComplete) {
          // 프로필이 완성되지 않은 경우
          router.push('/profile/complete')
        } else if (authStore.isApproved) {
          // 프로필 완성 + 승인됨
          router.push('/')
        } else {
          // 프로필 완성 + 승인 대기
          router.push('/pending-approval')
        }
      }, 2000)
      
    } else {
      console.error('[AuthCallback] 콜백 처리 실패:', result.error)
      error.value = result.error || '인증 처리 중 오류가 발생했습니다.'
    }
  } catch (err: any) {
    console.error('[AuthCallback] 예외 발생:', err)
    error.value = err.message || '인증 처리 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
})
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

.callbackBox {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.spinner, .error, .success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinnerIcon, .errorIcon, .successIcon {
  font-size: 48px;
  margin-bottom: 8px;
}

.spinnerIcon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

h2 {
  color: #2c3e50;
  font-size: 24px;
  margin: 0;
}

p {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
}

.retryBtn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 8px;
}

.retryBtn:hover {
  background: #2980b9;
}
</style>
