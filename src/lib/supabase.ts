// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { getSupabaseUrl, getSupabaseAnonKey } from '../config/environment'

declare global {
  // HMR에서도 1개만 유지
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient<Database> | undefined
}

export const supabase =
  globalThis.__supabase__ ??
  (globalThis.__supabase__ = createClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // storage: localStorage  // 기본값이므로 생략 가능
      },
    }
  ))

/** 현재 로그인 사용자 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('[getCurrentUser] getSession error:', error)
      return null
    }
    return data.session?.user ?? null
  } catch (e) {
    console.error('[getCurrentUser] exception:', e)
    return null
  }
}

/** 현재 세션 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('[getSession] error:', error)
      return null
    }
    return data.session ?? null
  } catch (e) {
    console.error('[getSession] exception:', e)
    return null
  }
}

/** Google OAuth 로그인 */
export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
}

/**
 * OAuth 콜백 처리
 * - detectSessionInUrl이 true이면 자동 처리되지만,
 *   프레임워크 라우팅/HMR 영향으로 누락될 여지가 있으면 아래를 명시 호출
 */
export async function handleOAuthCallback() {
  try {
    // URL에 code / access_token 등이 있으면 세션 교환 시도
    // (이미 처리되었으면 no-op)
    await supabase.auth.exchangeCodeForSession(window.location.href).catch(() => {})

    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('[OAuth Callback] getSession error:', error)
      return { success: false, error }
    }
    if (data.session) {
      return { success: true, session: data.session }
    }
    return { success: false, error: new Error('No session found') }
  } catch (e) {
    console.error('[OAuth Callback] exception:', e)
    return { success: false, error: e as Error }
  }
}

/** 로그아웃 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.warn('[signOut] signOut error:', error)
      // SDK가 스토리지 정리를 대부분 처리하므로 추가 조치 불필요
    }
    return { error: null }
  } catch (e) {
    console.error('[signOut] exception:', e)
    return { error: null }
  }
}
