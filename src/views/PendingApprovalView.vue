<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="text-center">
          <!-- 대기 아이콘 -->
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            승인 대기 중
          </h1>
          
          <p class="text-gray-600 mb-6">
            회원가입이 완료되었습니다.<br>
            관리자 승인 후 서비스를 이용하실 수 있습니다.
          </p>
          
          <!-- 사용자 정보 -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left" v-if="user">
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">이름</dt>
                <dd class="text-sm text-gray-900">{{ user.full_name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">학교</dt>
                <dd class="text-sm text-gray-900">{{ user.school_name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">이메일</dt>
                <dd class="text-sm text-gray-900">{{ user.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">가입일</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(user.created_at) }}</dd>
              </div>
            </dl>
          </div>
          
          <!-- 안내 메시지 -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">
                  승인 처리 안내
                </h3>
                <div class="mt-2 text-sm text-blue-700">
                  <ul class="list-disc pl-5 space-y-1">
                    <li>관리자가 교사 인증을 확인 후 승인해드립니다</li>
                    <li>승인은 보통 1-2일 내에 처리됩니다</li>
                    <li>승인 완료 시 이메일로 알림을 보내드립니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 액션 버튼들 -->
          <div class="space-y-3">
            <button
              @click="checkApprovalStatus"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              승인 상태 확인
            </button>
            
            <button
              @click="logout"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              로그아웃
            </button>
          </div>
          
          <!-- 문의 정보 -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <p class="text-xs text-gray-500">
              문의사항이 있으시면 
              <a href="mailto:admin@teacher-helper.com" class="text-blue-600 hover:text-blue-500">
                admin@teacher-helper.com
              </a>
              으로 연락해주세요.
            </p>
          </div>
        </div>
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

const isLoading = ref(false)
const user = authStore.user

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const checkApprovalStatus = async () => {
  isLoading.value = true
  
  try {
    await authStore.loadUserProfile()
    
    if (authStore.isApproved) {
      // 승인되었으면 메인 페이지로 이동
      router.push('/main')
    } else {
      // 아직 승인되지 않음
      alert('아직 승인되지 않았습니다. 조금 더 기다려주세요.')
    }
  } catch (error) {
    console.error('승인 상태 확인 실패:', error)
    alert('승인 상태를 확인하는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

const logout = async () => {
  const result = await authStore.logout()
  if (result.success) {
    router.push('/login')
  }
}

// 컴포넌트 마운트 시 승인 상태 확인
onMounted(() => {
  // 이미 승인된 사용자는 메인 페이지로 리다이렉트
  if (authStore.isApproved) {
    router.push('/main')
  }
})
</script>
