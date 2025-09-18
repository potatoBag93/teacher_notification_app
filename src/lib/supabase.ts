/**
 * Supabase 클라이언트 설정 및 인증 헬퍼 함수
 * 
 * 이 파일은 Supabase와의 연결을 설정하고 기본적인 인증 기능을 제공합니다.
 * - 환경변수 검증
 * - Supabase 클라이언트 생성 및 설정
 * - 공통 인증 메서드 제공
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { getSupabaseUrl, getSupabaseAnonKey } from '../config/environment'

/**
 * Supabase 클라이언트 인스턴스
 * - Database 타입을 제네릭으로 지정하여 타입 안전성 확보
 * - 자동 토큰 갱신, 세션 유지, URL에서 세션 감지 활성화
 */
export const supabase = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
  auth: {
    autoRefreshToken: true,    // 토큰 자동 갱신
    persistSession: true,      // 브라우저에 세션 유지
    detectSessionInUrl: true   // URL에서 인증 세션 자동 감지
  }
})

/**
 * 현재 로그인된 사용자 정보 조회
 * @returns 현재 사용자 객체 또는 null
 */
export const getCurrentUser = async () => {
  try {
    // console.log("getCurrentUser started")

    // localStorage 토큰 sanity check
    const storageKey = `sb-${getSupabaseUrl().split('//')[1].split('.')[0]}-auth-token`
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        JSON.parse(raw) // 파싱 시도
      } catch (e) {
        console.warn("[getCurrentUser] 손상된 세션 발견 → 삭제")
        localStorage.removeItem(storageKey)
      }
    }
    // console.log("getSession start")
    const { data: { session }, error } = await supabase.auth.getSession()
    // console.log("getSession ends")
    if (error) {
      console.error('[getCurrentUser] getSession() 에러:', error)
      return null
    }

    if (session?.user) {
      // console.log('[getCurrentUser] 로그인 사용자:', session.user.email)
      return session.user
    }

    console.log('[getCurrentUser] 세션 없음 → 비로그인 상태')
    return null
  } catch (err) {
    console.error('[getCurrentUser] 예외 발생:', err)
    return null
  }
}



// export const getCurrentUser = async () => {
//   try {
//     console.log('[getCurrentUser] 시작 - localStorage 토큰 확인 중...')
    
//     // localStorage에서 직접 확인
//     const storageKey = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`
//     const storedToken = localStorage.getItem(storageKey)
//     console.log('[getCurrentUser] localStorage 토큰 존재:', !!storedToken)
    
//     if (storedToken) {
//       try {
//         const tokenData = JSON.parse(storedToken)
//         console.log('[getCurrentUser] 토큰 파싱 성공:', {
//           hasAccessToken: !!tokenData.access_token,
//           hasRefreshToken: !!tokenData.refresh_token,
//           expiresAt: tokenData.expires_at,
//           user: tokenData.user?.email
//         })
        
//         // 토큰 만료 확인
//         const now = Math.floor(Date.now() / 1000)
//         const isExpired = tokenData.expires_at && tokenData.expires_at < now
//         console.log('[getCurrentUser] 토큰 만료 여부:', isExpired, '(현재:', now, '만료:', tokenData.expires_at, ')')
        
//         // 토큰이 유효하면 localStorage에서 직접 사용자 정보 반환 (Supabase API 우회)
//         if (tokenData.user && !isExpired) {
//           console.log('[getCurrentUser] localStorage에서 직접 사용자 정보 반환 (Supabase API 우회)')
//           return tokenData.user
//         }
//       } catch (e) {
//         console.error('[getCurrentUser] 토큰 파싱 실패:', e)
//       }
//     }
    
//     console.log('[getCurrentUser] supabase.auth.getUser() 호출 시작...')
    
//     // 직접 fetch로 Supabase 연결 테스트
//     try {
//       console.log('[getCurrentUser] 직접 fetch 테스트 시작...')
//       const { data: { user } } = await supabase.auth.getUser()
//       console.log("getUser data = ",user)
//       const testUrl = `${supabaseUrl}/rest/v1/user`
//       const response = await fetch(testUrl, {
//         method: 'GET',
//         headers: {
//           'apikey': supabaseAnonKey,
//           'Authorization': `Bearer ${supabaseAnonKey}`
//         }
//       })
//       console.log('[getCurrentUser] 직접 fetch 결과:', response.status, response.statusText)
//     } catch (fetchError) {
//       console.error('[getCurrentUser] 직접 fetch 실패:', fetchError)
//     }
    
//     // 3초 타임아웃 적용
//     const getUserPromise = supabase.auth.getUser()
//     const timeoutPromise = new Promise<never>((_, reject) => 
//       setTimeout(() => reject(new Error('getUser() 타임아웃 (3초)')), 3000)
//     )
    
//     const { data: { user }, error } = await Promise.race([getUserPromise, timeoutPromise])
    
//     if (error) {
//       console.error('[getCurrentUser] getUser() 에러:', error)
//       return null
//     }
    
//     console.log('[getCurrentUser] getUser() 성공:', user ? user.email : '사용자 없음')
//     return user
//   } catch (error) {
//     console.error('[getCurrentUser] 예외 발생:', error)
    
//     // getUser()가 실패하면 getSession()으로 대체 시도
//     try {
//       console.log('[getCurrentUser] getUser() 실패 - getSession()으로 대체 시도...')
//       const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
//       if (sessionError) {
//         console.error('[getCurrentUser] getSession() 에러:', sessionError)
//         return null
//       }
      
//       if (session?.user) {
//         console.log('[getCurrentUser] getSession()으로 사용자 정보 획득:', session.user.email)
//         return session.user
//       }
      
//       console.log('[getCurrentUser] getSession()에서도 사용자 정보 없음')
//       return null
//     } catch (sessionError) {
//       console.error('[getCurrentUser] getSession()도 실패:', sessionError)
//       return null
//     }
//   }
// }

/**
 * 현재 세션 정보 조회
 * @returns 현재 세션 객체 또는 null
 */
export const getSession = async () => {
  try {
    console.log('[getSession] supabase.auth.getSession() 호출 시작...')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[getSession] getSession() 에러:', error)
      return null
    }
    
    console.log('[getSession] getSession() 성공:', session ? {
      user: session.user?.email,
      expiresAt: session.expires_at,
      accessToken: session.access_token ? '존재함' : '없음'
    } : '세션 없음')
    
    return session
  } catch (error) {
    console.error('[getSession] 예외 발생:', error)
    return null
  }
}

/**
 * 구글 OAuth를 통한 로그인
 * @returns 로그인 결과 데이터와 에러 정보
 */
export const signInWithGoogle = async () => {
  console.log('[Google Login] 구글 로그인 시작')
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  })
  
  console.log('[Google Login] 구글 로그인 결과:', { data, error })
  return { data, error }
}

/**
 * OAuth 콜백 처리 (URL에서 세션 정보 추출)
 * @returns 처리 결과
 */
export const handleOAuthCallback = async () => {
  console.log('[OAuth Callback] 콜백 처리 시작')
  
  const { data, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('[OAuth Callback] 세션 가져오기 실패:', error)
    return { success: false, error }
  }
  
  if (data.session) {
    console.log('[OAuth Callback] 세션 확인됨:', data.session.user.email)
    return { success: true, session: data.session }
  }
  
  console.log('[OAuth Callback] 세션 없음')
  return { success: false, error: new Error('No session found') }
}

/**
 * 현재 사용자 로그아웃
 * @returns 로그아웃 에러 정보 (성공시 null)
 */
export const signOut = async () => {
  console.log("supabase.ts - signOut 시작")
  
  try {
    // localStorage에서 실제 사용자 토큰 추출
    const storageKey = `sb-${getSupabaseUrl().split('//')[1].split('.')[0]}-auth-token`
    const storedToken = localStorage.getItem(storageKey)
    
    let accessToken = getSupabaseAnonKey() // 기본값
    
    if (storedToken) {
      try {
        const tokenData = JSON.parse(storedToken)
        if (tokenData.access_token) {
          accessToken = tokenData.access_token
          console.log("supabase.ts - 사용자 액세스 토큰 사용")
        }
      } catch (e) {
        console.log("supabase.ts - 토큰 파싱 실패, anon key 사용")
      }
    }
    
    // fetch API를 직접 사용하여 로그아웃
    const response = await fetch(`${getSupabaseUrl()}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': getSupabaseAnonKey(),
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log("supabase.ts - signOut fetch 응답:", response.status)
    
    // 응답 상태와 관계없이 localStorage 정리 (로그아웃 의도이므로)
    localStorage.removeItem(storageKey)
    console.log("supabase.ts - localStorage 토큰 제거 완료")
    
    if (!response.ok) {
      console.warn("supabase.ts - 서버 로그아웃 실패했지만 로컬 정리는 완료:", response.status)
    }
    
    console.log("supabase.ts - signOut 완료")
    return { error: null }
    
  } catch (error) {
    console.error("supabase.ts - signOut 에러:", error)
    
    // 에러가 발생해도 localStorage는 정리 (로그아웃 의도이므로)
    try {
      const storageKey = `sb-${getSupabaseUrl().split('//')[1].split('.')[0]}-auth-token`
      localStorage.removeItem(storageKey)
      console.log("supabase.ts - 에러 발생했지만 localStorage 정리 완료")
    } catch (storageError) {
      console.error("supabase.ts - localStorage 정리 실패:", storageError)
    }
    
    return { error: null } // 로그아웃은 항상 성공으로 처리
  }
}
