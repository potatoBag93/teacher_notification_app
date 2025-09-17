/**
 * RLS 우회용 Supabase 클라이언트 (임시 사용)
 * 
 * 주의: 이 클라이언트는 RLS를 우회하므로 보안에 주의해야 합니다.
 * 운영 환경에서는 사용하지 마세요!
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY // 서비스 키 필요

// 서비스 키가 있는 경우에만 RLS 우회 클라이언트 생성
export const supabaseAdmin = supabaseServiceKey ? createClient<Database>(
  supabaseUrl, 
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null

console.log('[Supabase Admin] RLS 우회 클라이언트 생성:', !!supabaseAdmin)
