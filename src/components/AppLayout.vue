<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="header-container">
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo-icon">📝</div>
          <h1 class="logo-text">알림장 뭐쓰지? 알뭐</h1>
        </div>
        
        <!-- Navigation -->
        <nav class="main-nav">
          <RouterLink to="/" class="nav-link" :class="{ active: $route.path === '/' }">
            메인
          </RouterLink>
          <RouterLink to="/stats" class="nav-link" :class="{ active: $route.path === '/stats' }">
            통계
          </RouterLink>
          <RouterLink to="/about-theme" class="nav-link" :class="{ active: $route.path === '/about-theme' }">
            서비스소개
          </RouterLink>
        </nav>
        
        <!-- Search Bar - 임시 비활성화 -->
        <!-- 
        <div class="header-search">
          <SearchInput 
            v-model="searchQuery"
            placeholder="키워드로 문구 검색..."
            :suggestions="[]"
            @search="handleSearch"
          />
        </div>
        -->
        
        <!-- User Menu -->
        <div class="user-menu">
          <!-- 로그인된 상태 -->
          <template v-if="authStore.isAuthenticated">
            <!-- <button class="notification-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button> -->
            
            <!-- 사용자 드롭다운 -->
            <div class="user-dropdown" ref="userDropdown">
              <button 
                class="user-avatar" 
                @click="toggleUserMenu"
                :title="authStore.userName || authStore.user?.email"
              >
                {{ getUserInitial() }}
              </button>
              
              <!-- 드롭다운 메뉴 -->
              <transition name="dropdown-fade">
                <div v-if="showUserMenu" class="dropdown-menu">
                  <div class="user-info">
                    <div class="user-name">{{ authStore.userName || '사용자' }}</div>
                    <div class="user-email">{{ authStore.user?.email }}</div>
                    <div v-if="authStore.userSchool" class="user-school">{{ authStore.userSchool }}</div>
                  </div>
                  
                  <div class="menu-divider"></div>
                  
                  <button class="menu-item" @click="goToProfileEdit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>계정 설정</span>
                  </button>
                  
                  <button v-if="authStore.isAdmin" class="menu-item" @click="goToAdmin">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"></path>
                    </svg>
                    <span>관리자 페이지</span>
                  </button>
                  
                  <div class="menu-divider"></div>
                  
                  <button class="menu-item logout-btn" @click="handleLogout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16,17 21,12 16,7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>로그아웃</span>
                  </button>
                </div>
              </transition>
            </div>
          </template>
          
          <!-- 로그인되지 않은 상태 -->
          <template v-else>
            <button class="login-btn" @click="goToLogin">
              로그인
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <slot />
    </main>

    <!-- Floating Action Button
    <div class="floating-action">
      <BaseButton 
        variant="primary" 
        class="fab-button"
        @click="$emit('editClick')"
      >
        ✏️ 편집하기
      </BaseButton>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
// SearchInput 임시 제거
// import SearchInput from './common/SearchInput.vue'
import BaseButton from './common/BaseButton.vue'

const emit = defineEmits<{
  editClick: []
  search: [query: string]
}>()

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const showUserMenu = ref(false)
const userDropdown = ref<HTMLElement>()

const handleSearch = (query: string) => {
  emit('search', query)
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 칠판 미리보기 새 창 열기 함수
const openChalkboardPreview = () => {
  window.open('/chalkboard-preview', '_blank', 'noopener,width=1200,height=800')
}

const getUserInitial = (): string => {
  const name = authStore.userName
  if (name) {
    return name.charAt(0).toUpperCase()
  }
  const email = authStore.user?.email
  if (email) {
    return email.charAt(0).toUpperCase()
  }
  return '?'
}

const goToProfile = () => {
  showUserMenu.value = false
  router.push('/profile/complete')
}

const goToAdmin = () => {
  showUserMenu.value = false
  router.push('/admin')
}

const goToLogin = () => {
  router.push('/login')
}
// 내 정보 보기(프로필 수정)로 이동
const goToProfileEdit = () => {
  router.push('/profile-edit')
}
const handleLogout = async () => {
  console.log("로그아웃 시도")
  showUserMenu.value = false
  
  const result = await authStore.logout()
  if (result.success) {
    router.push('/login')
  } else {
    console.error('로그아웃 실패:', result.error)
    // 에러가 있어도 로그인 페이지로 이동
    router.push('/login')
  }
}

// 외부 클릭 시 드롭다운 닫기
const handleClickOutside = (event: Event) => {
  if (userDropdown.value && !userDropdown.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #f8fafc;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  height: 64px;
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  height: 100%;
  gap: 1.5rem;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
  margin-left: 2rem;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.nav-link.active {
  color: #3b82f6;
  background: #eff6ff;
}

.header-search {
  flex: 1;
  max-width: 300px;
  margin-left: auto;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-btn {
  padding: 0.5rem;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-btn:hover {
  color: #3b82f6;
  background: #f3f4f6;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #dbeafe;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.app-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.floating-action {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 50;
}

.fab-button {
  border-radius: 50px;
  padding: 1rem 1.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

@media (max-width: 1024px) {
  .main-nav {
    display: none;
  }
  
  .header-search {
    max-width: 250px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
    gap: 1rem;
  }
  
  .logo-text {
    display: none;
  }
  
  .header-search {
    max-width: 200px;
  }
  
  .app-main {
    padding: 1rem;
  }
}

.user-dropdown {
  position: relative;
}

/* Dropdown Transition */
.dropdown-fade-enter-active {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}
.dropdown-fade-leave-active {
  transition: opacity 150ms ease-in, transform 150ms ease-in;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.95);
}

/* 드롭다운 메뉴 스타일 개선 */
.dropdown-menu {
  background: #fff;
  border: 1px solid #e2e8f0; /* secondary.200 */
  border-radius: 0.75rem; /* border_radius.lg */
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); /* shadows.lg */
  padding: 0.5rem; /* spacing.2 */
  min-width: 220px;
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  transform-origin: top center;
}

.user-info {
  padding: 0.5rem 0.75rem; /* spacing-2, spacing-3 */
  margin-bottom: 0.5rem; /* spacing-2 */
}

.user-name {
  font-weight: 600; /* semibold */
  color: #1e293b; /* secondary.800 */
  font-size: 0.875rem; /* sm */
  line-height: 1.25rem;
}

.user-email, .user-school {
  font-size: 0.75rem; /* xs */
  color: #64748b; /* secondary.500 */
  margin-top: 0.25rem; /* spacing-1 */
  line-height: 1rem;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0; /* secondary.200 */
  margin: 0.5rem 0; /* spacing-2 */
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.75rem; /* spacing-3 */
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem; /* border_radius.md */
  font-size: 0.875rem; /* sm */
  font-weight: 500; /* medium */
  color: #334155; /* secondary.700 */
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item svg {
  color: #94a3b8; /* secondary.400 */
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item:hover {
  background: #eff6ff; /* primary.50 */
  color: #2563eb; /* primary.600 */
}

.menu-item:hover svg {
  color: #2563eb; /* primary.600 */
}

.logout-btn:hover {
  background: #fef2f2; /* from theme tag_colors */
  color: #dc2626; /* from theme tag_colors */
}

.logout-btn:hover svg {
  color: #dc2626; /* from theme tag_colors */
}
</style>