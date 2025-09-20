/**
 * 인증 관련 상태 관리 스토어 (Pinia)
 * 
 * 구글 OAuth를 통한 사용자 인증, 프로필 관리, 권한 확인 등의 기능을 제공합니다.
 * - 구글 로그인/로그아웃 처리
 * - 사용자 프로필 상태 관리
 * - 승인 상태 및 관리자 권한 확인
 * - 인증 상태 자동 초기화 및 동기화
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, signOut, signInWithGoogle } from '../lib/supabase'
// 전역 가드: 리스너 1회만, 중복 트리거 방지
let __authListenerWired = false
let __lastUserId: string | null = null
import type { Database } from '../lib/database.types'

// 사용자 프로필 타입 정의
type User = Database['public']['Tables']['user_profiles']['Row']

export const useAuthStore = defineStore('auth', () => {
  // ==================== 상태 (State) ====================
  
  /** 현재 로그인된 사용자의 프로필 정보 */
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isAuthenticated = ref(false)
  const isApproved = ref(false)
  const isAdmin = ref(false)
  // stores/auth.ts
  const isInit = ref(false)
  let initPromise: Promise<void> | null = null
  // ==================== 계산된 값 (Getters) ====================
  
  /** 사용자 프로필 정보 반환 */
  const userProfile = computed(() => user.value)
  
  /** 사용자 이름 반환 */
  const userName = computed(() => user.value?.full_name || '')
  
  /** 사용자 학교명 반환 */
  const userSchool = computed(() => user.value?.school_name || '')

  /** 프로필 완성도 체크 */
  const isProfileComplete = computed(() => {
    return user.value?.school_name?.trim() ? true : false
  })

  // ==================== 액션 (Actions) ====================
  
  // 인증 상태 플래그만 세팅 (프로필은 비동기)
  function setAuthFlags(profile: User | null) {
    user.value = profile
    const authed = !!profile
    isAuthenticated.value = authed
    isApproved.value = !!profile?.is_approved
    isAdmin.value = !!profile?.is_admin
  }

  async function setFromSession(session: import('@supabase/supabase-js').Session | null) {
    if (!session?.user) { setAuthFlags(null); return }
    // 프로필은 비동기로 (렌더 블로킹 금지)
    void loadUserProfile(session.user.id)
  }

  function wireAuthListenerOnce() {
    if (__authListenerWired) return
    __authListenerWired = true
    supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null
      // 같은 유저/같은 세션에서 INITIAL_SESSION → SIGNED_IN 중복 방지
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && uid && uid === __lastUserId) {
        return
      }
      if (uid) __lastUserId = uid
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        void setFromSession(session)
      }
      if (event === 'SIGNED_OUT') {
        setAuthFlags(null)
        resetInitFlags()
      }
    })
  }

  const initializeAuth = async () => {
    console.log("� [Auth Store] initializeAuth 시작")
    isLoading.value = true
    try {
      wireAuthListenerOnce()
      // 초기 세션만 확인(렌더 블로킹 최소화)
      const { data, error } = await supabase.auth.getSession()
      if (error) console.warn('[Auth Store] getSession warning:', error)
      await setFromSession(data.session ?? null) // 내부에서 비동기 프로필 로드
    } catch (error) {
      console.error('[Auth Store] 인증 초기화 실패:', error)
      setAuthFlags(null)
    } finally {
      isLoading.value = false
      console.log("✅ [Auth Store] initializeAuth 완료 - 로딩 해제")
    }
  }

  // "동시에 한 번만" + "성공 시에만 완료 표시" + "항상 동일 Promise 공유"
  const initializeAuthOnce = async (): Promise<void> => {
    console.log("AuthOnce")
    if (isInit.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        await initializeAuth()
        isInit.value = true      // ← 성공 시에만 완료 처리
      } finally {
        initPromise = null       // ← 다음 호출을 위해 정리
      }
    })()

    return initPromise
  }

  /**
   * 현재 인증된 사용자의 프로필을 로드합니다
   */
  // 프로필 로드는 안전하게: 실패해도 signOut/reload 없이 상태만 유지
  const loadUserProfile = async (userId?: string) => {
    try {
      console.log("📋 [Auth Store] loadUserProfile 시작, userId:", userId)
      const targetId = userId ?? (await supabase.auth.getUser()).data.user?.id
      if (!targetId) { setAuthFlags(null); return }
      const { UserService } = await import('../services/userService')
      // 5초 타임아웃 방어
      const p = UserService.getProfile(targetId)
      const t = new Promise<null>((_, rej) => setTimeout(() => rej(new Error('profile timeout')), 5000))
      const profile = await Promise.race([p, t]) as User | null
      if (!profile) {
        // 최초 로그인: 프로필 생성
        const { data: u } = await supabase.auth.getUser()
        if (!u.user) { setAuthFlags(null); return }
        const newProfile = await UserService.createProfile({
          id: u.user.id,
          email: u.user.email!,
          fullName: u.user.user_metadata?.full_name || u.user.user_metadata?.name || '이름 없음',
          schoolName: '',
        })
        setAuthFlags(newProfile)
        return
      }
      setAuthFlags(profile)
      // 마지막 로그인 업데이트는 백그라운드
      void UserService.updateLastLogin().catch(err => console.warn('[Auth Store] lastLogin 실패:', err))
    } catch (error: any) {
      console.warn('[Auth Store] loadUserProfile 에러 (상태 유지):', error?.message || error)
      // 여기서 signOut/reload 하지 말 것. 네트워크 회복되면 다음 TOKEN_REFRESHED/포커스에서 재시도됨.
    }
  }

  /**
   * 구글 OAuth를 통한 로그인을 처리합니다
   * 
   * @returns 로그인 결과 객체 { success: boolean, error?: string }
   */
  const loginWithGoogle = async () => {
    isLoading.value = true
    try {
      console.log('[Auth Store] 구글 로그인 시작')
      
      const { data, error } = await signInWithGoogle()
      if (error) throw error

      console.log('[Auth Store] 구글 로그인 요청 성공 - 리디렉션 진행 중')
      return { success: true }
    } catch (error: any) {
      console.error('[Auth Store] 구글 로그인 실패:', error)
      return { 
        success: false, 
        error: error.message || '구글 로그인에 실패했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * OAuth 콜백을 처리하고 사용자 프로필을 로드합니다
   * 
   * @returns 콜백 처리 결과 { success: boolean, error?: string }
   */
  const handleAuthCallback = async () => {
    isLoading.value = true
    try {
      console.log('[Auth Store] OAuth 콜백 처리 시작')
      // 누락 방지: 명시 교환 (이미 처리됐다면 no-op)
      try { await supabase.auth.exchangeCodeForSession(window.location.href) } catch {}
      const { data } = await supabase.auth.getSession()
      if (!data.session) throw new Error('인증 세션을 찾을 수 없습니다.')
      console.log('[Auth Store] 세션 확인됨:', data.session.user.email)
      // 프로필은 백그라운드로
      void loadUserProfile(data.session.user.id)
      return { success: true }
    } catch (error: any) {
      console.error('[Auth Store] OAuth 콜백 처리 실패:', error)
      return { success: false, error: error.message || 'OAuth 콜백 처리에 실패했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 현재 사용자를 로그아웃합니다
   * 
   * @returns 로그아웃 결과 객체 { success: boolean, error?: string }
   */
  const logout = async () => {
    console.log("auth.js - logout")
    isLoading.value = true
    try {
      const { error } = await signOut()
      if (error) throw error
      
      clearAuth()  // 로컬 상태 초기화
      resetInitFlags()
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || '로그아웃에 실패했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }
  // (선택) 로그아웃 시 플래그 리셋: 다음 로그인에서 다시 초기화되도록
  const resetInitFlags = () => {
    isInit.value = false
    initPromise = null
  }
  /**
   * 사용자 프로필을 업데이트합니다
   * 
   * @param updates 업데이트할 프로필 필드들
   * @returns 업데이트 결과 객체 { success: boolean, error?: string }
   */
  const updateProfile = async (updates: Partial<User>) => {
    if (!user.value) return { success: false, error: '로그인이 필요합니다.' }

    isLoading.value = true
    try {
      const { UserService } = await import('../services/userService')
      const updatedProfile = await UserService.updateProfile(updates)
      user.value = updatedProfile  // 로컬 상태 업데이트
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || '프로필 업데이트에 실패했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 현재 사용자의 승인 상태를 확인합니다
   * 
   * @returns 승인 상태 정보 객체 또는 null
   */
  const checkApprovalStatus = async () => {
    try {
      const { UserService } = await import('../services/userService')
      const status = await UserService.checkApprovalStatus()
      isApproved.value = status.is_approved  // 로컬 상태 업데이트
      return status
    } catch (error) {
      console.error('Failed to check approval status:', error)
      return null
    }
    
  }

  /**
   * 인증 관련 모든 상태를 초기화합니다
   */
  const clearAuth = () => {
    user.value = null
    isAuthenticated.value = false
    isApproved.value = false
    isAdmin.value = false
  }


  // ==================== 반환할 상태와 메서드들 ====================
  
  return {
    // 상태 (State)
    user: userProfile,      // 사용자 프로필 정보
    isLoading,             // 로딩 상태
    isAuthenticated,       // 인증 여부
    isApproved,           // 승인 여부
    isAdmin,              // 관리자 권한
    
    // 계산된 값 (Getters)
    userName,             // 사용자 이름
    userSchool,           // 사용자 학교명
    isProfileComplete,    // 프로필 완성 여부
    
    // 액션 (Actions)
    initializeAuth,       // 인증 상태 초기화
    initializeAuthOnce,
    loginWithGoogle,      // 구글 로그인
    handleAuthCallback,   // OAuth 콜백 처리
    logout,              // 로그아웃
    updateProfile,       // 프로필 업데이트
    checkApprovalStatus, // 승인 상태 확인
    loadUserProfile      // 프로필 다시 로드
  }
})