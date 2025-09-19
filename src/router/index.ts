import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {
      path: '/',
      name: 'main',
      component: () => import('../views/MainView.vue'),
    },
    {
      path: '/edit',
      name: 'edit',
      component: () => import('../views/EditView.vue'),
      meta: {
        requiresAuth: true,
        requiresApproval: true
      }
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../views/StatsView.vue'),
      meta: {
        requiresAuth: true,
        requiresApproval: true
      }
    },
    {
      path: '/collection',
      name: 'collection',
      component: () => import('../views/CollectionView.vue'),
      meta: {
        requiresAuth: true,
        requiresApproval: true
      }
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: () => import('../views/FeedbackView.vue'),
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/AuthCallback.vue'),
    },
    {
      path: '/profile/complete',
      name: 'profile-complete',
      component: () => import('../views/ProfileComplete.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: {
        requiresAuth: true,
        requiresApproval: true,
        requiresAdmin: true
      }
    },
    {
      path: '/pending-approval',
      name: 'pending-approval',
      component: () => import('../views/PendingApprovalView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/components',
      name: 'components',
      component: () => import('../views/ComponentLibrary.vue'),
    },
    // ...기존 라우트들...
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

// 네비게이션 가드 (상세 로깅)
router.beforeEach(async (to, from, next) => {
  console.log('🚦 [Router] 네비게이션 시작:', from.path, '→', to.path)
  
  try {
    console.log('📦 [Router] 스토어 임포트 시작...')
    // 동적 임포트로 스토어 사용 (순환 의존성 방지)
    const { useAuthStore } = await import('../stores/auth')
    console.log('📦 [Router] 스토어 임포트 완료')
    
    const authStore = useAuthStore()
    console.log('🔧 [Router] 스토어 인스턴스 생성 완료')
    
    // 인증 초기화
    console.log('🔑 [Router] 인증 초기화 시작...')
    await authStore.initializeAuthOnce()
    console.log('🔑 [Router] 인증 초기화 완료')

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresApproval = to.matched.some(record => record.meta.requiresApproval)
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
    
    console.log('📋 [Router] 라우트 메타 분석:', {
      requiresAuth,
      requiresApproval,
      requiresAdmin,
      isAuthenticated: authStore.isAuthenticated,
      isLoading: authStore.isLoading,
      routeName: to.name
    })

    // 개발 환경에서 관리자 페이지 접근 허용
    if (import.meta.env.DEV && to.name === 'admin') {
      console.log('🔧 [Router] 개발 모드: 관리자 페이지 접근 허용')
      console.log('✅ [Router] next() 호출 - 관리자 페이지')
      next()
      return
    }

    // 로딩 중이면 통과
    if (authStore.isLoading) {
      console.log('⏳ [Router] 인증 상태 로딩 중... 통과')
      console.log('✅ [Router] next() 호출 - 로딩 중')
      next()
      return
    }

    // 인증이 필요한 페이지
    if (requiresAuth && !authStore.isAuthenticated) {
      console.log('🔐 [Router] 인증 필요 - 로그인 페이지로 이동')
      if (to.path !== '/login') {
        console.log('↪️ [Router] 로그인 페이지로 리다이렉트')
        next('/login')
        return
      } else {
        console.log('✅ [Router] 이미 로그인 페이지 - 통과')
        next()
        return
      }
    }

    // 이미 로그인된 사용자가 로그인 페이지로 가려는 경우
    if (to.path === '/login' && authStore.isAuthenticated) {
      console.log('✅ [Router] 이미 로그인됨 - 메인으로 이동')
      console.log('↪️ [Router] 메인 페이지로 리다이렉트')
      next('/')
      return
    }

    // 프로필 완성이 필요한 경우
    if (authStore.isAuthenticated && !authStore.isProfileComplete && to.name !== 'profile-complete') {
      console.log('📝 [Router] 프로필 완성 필요 - 프로필 완성 페이지로 이동')
      console.log('↪️ [Router] 프로필 완성 페이지로 리다이렉트')
      next('/profile/complete')
      return
    }

    // 승인이 필요한 페이지
    if (requiresApproval && authStore.isAuthenticated && !authStore.isApproved) {
      console.log('⏸️ [Router] 승인 대기 중 - 승인 대기 페이지로 이동')
      console.log('↪️ [Router] 승인 대기 페이지로 리다이렉트')
      next('/pending-approval')
      return
    }

    // 관리자 권한이 필요한 페이지
    if (requiresAdmin && (!authStore.isAuthenticated || !authStore.isAdmin)) {
      console.log('👑 [Router] 관리자 권한 필요 - 메인으로 이동')
      console.log('↪️ [Router] 메인 페이지로 리다이렉트')
      next('/')
      return
    }

    // 모든 조건 통과
    console.log('🎯 [Router] 모든 조건 통과 - 목표 페이지로 이동')
    console.log('✅ [Router] next() 호출 - 최종 통과')
    next()
  } catch (error) {
    console.error('🚨 [Router] 네비게이션 가드 오류:', error)
    if (error instanceof Error) {
      console.error('🚨 [Router] 오류 스택:', error.stack)
    }
    console.log('🆘 [Router] 오류 발생 - 강제 통과')
    next() // 오류 발생 시에도 네비게이션 진행
  }
})

export default router
