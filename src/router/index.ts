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
    const { useAuthStore } = await import('../stores/auth')
    console.log('📦 [Router] 스토어 임포트 완료')
    const authStore = useAuthStore()
    console.log('🔧 [Router] 스토어 인스턴스 생성 완료')
    // 인증 초기화(호출만, await하지 않음)
    authStore.initializeAuthOnce()
    console.log('🔑 [Router] 인증 초기화 호출')

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
      next(); return;
    }

    // 로딩 중이면 무조건 통과
    if (authStore.isLoading) { next(); return; }

    // /auth/callback은 가드 우회
    if (to.path.startsWith('/auth/callback')) { next(); return; }

    // 인증만 검사, 프로필 기다리지 않음
    if (requiresAuth && !authStore.isAuthenticated) {
      if (to.path !== '/login') {
        next('/login'); return;
      } else {
        next(); return;
      }
    }

    // 이미 로그인된 사용자가 로그인 페이지로 가려는 경우
    if (to.path === '/login' && authStore.isAuthenticated) {
      next('/'); return;
    }

    // 프로필 완성이 필요한 경우
    if (authStore.isAuthenticated && !authStore.isProfileComplete && to.name !== 'profile-complete') {
      next('/profile/complete'); return;
    }

    // 승인이 필요한 페이지
    if (requiresApproval && authStore.isAuthenticated && !authStore.isApproved) {
      next('/pending-approval'); return;
    }

    // 관리자 권한이 필요한 페이지
    if (requiresAdmin && (!authStore.isAuthenticated || !authStore.isAdmin)) {
      next('/'); return;
    }

    // 모든 조건 통과
    next();
  } catch (error) {
    console.error('🚨 [Router] 네비게이션 가드 오류:', error)
    next();
  }
})

export default router
