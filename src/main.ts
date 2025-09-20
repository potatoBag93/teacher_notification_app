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
// 리스너 제거

