// src/main.ts
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Supabase & Auth Store
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 1) 앱을 먼저 마운트해서 렌더링이 절대 막히지 않게
app.mount('#app')

// 2) 인증 상태 초기화는 비동기(백그라운드)로
const auth = useAuthStore()
auth.initializeAuthOnce().catch((err) => {
  console.error('[Main] initializeAuth 실패:', err)
})

// 3) Supabase Auth 상태 변경 리스너 - 전역에서 "딱 한 번"만 등록
let unsubscribe: (() => void) | null = null

function registerAuthListenerOnce() {
  if (unsubscribe) return // 중복 등록 방지

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      // 콘솔 디버깅(원하면 주석 처리)
      console.log('[Auth Listener]', event, session?.user?.email)

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          // 프로필 로드(스토어 액션)
          await auth.loadUserProfile(session.user.id)
          // 마지막 로그인 갱신은 실패 무시하고 백그라운드
          const { UserService } = await import('@/services/userService')
          UserService.updateLastLogin().catch(() => {})
        } else if (event === 'SIGNED_OUT') {
          auth.$reset?.() // Pinia v2에서 $reset 지원 시
          // $reset 없으면 스토어의 clearAuth 사용
          // if (!auth.$reset) auth.clearAuth()
        }
      } catch (e) {
        console.warn('[Auth Listener] 처리 중 오류:', e)
      }
    }
  )

  // 해제 함수 보관
  unsubscribe = () => {
    try { subscription.unsubscribe() } catch {}
    unsubscribe = null
  }
}

registerAuthListenerOnce()

// 4) HMR에서 모듈 교체될 때 리스너 중복 방지
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (unsubscribe) unsubscribe()
  })
}
