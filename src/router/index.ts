import { createRouter, createWebHistory } from 'vue-router'
import { configService } from '../services/configService'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(configService.getBaseUrl()),
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
  ],
})

// 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  // 동적 임포트로 스토어 사용 (순환 의존성 방지)
  const { useAuthStore } = await import('../stores/auth')
  const authStore = useAuthStore()
  await authStore.initializeAuthOnce()


  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresApproval = to.matched.some(record => record.meta.requiresApproval)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  // 개발 환경에서 관리자 페이지 접근 허용
  if (configService.isDevelopment() && to.name === 'admin') {
    console.log('🔧 개발 모드: 관리자 페이지 접근 허용')
    next()
    return
  }

  // 인증이 필요한 페이지
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('isLoading:',authStore.isLoading,'requiresAuth:', requiresAuth, 'isAuthenticated:', authStore.isAuthenticated)
    next('/login')
    return
  }

  // 프로필 완성이 필요한 경우 (인증된 사용자만)
  if (authStore.isAuthenticated && !authStore.isProfileComplete && to.name !== 'profile-complete') {
    next('/profile/complete')
    return
  }

  // 승인이 필요한 페이지
  if (requiresApproval && authStore.isAuthenticated && !authStore.isApproved) {
    next('/pending-approval')
    return
  }

  // 관리자 권한이 필요한 페이지
  if (requiresAdmin && (!authStore.isAuthenticated || !authStore.isAdmin)) {
    next('/main')
    return
  }

  // 로그인 상태에서 로그인 페이지 접근 시 메인으로 리다이렉트
  if (to.name === 'login' && authStore.isAuthenticated) {
    next('/main')
    return
  }

  next()
})

export default router
