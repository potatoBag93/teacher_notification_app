/**
 * 환경변수 설정 관리
 * 
 * 개발/프로덕션 환경에 관계없이 안정적으로 환경변수를 관리합니다.
 * Vite의 import.meta.env와 fallback 방식을 조합하여 사용합니다.
 */

interface EnvironmentConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  isDevelopment: boolean
  isProduction: boolean
  baseUrl: string
  siteUrl: string
  aiSystemUuid?: string
  useDummyWeather?: boolean
  supabaseServiceKey?: string
}

/**
 * 환경변수를 안전하게 가져오는 함수
 */
function getEnvironmentVariable(key: string, fallback?: string): string {
  // 1. Vite 환경변수 시스템 우선 사용 (빌드 시점에 주입됨)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key]
  }
  
  // 2. 브라우저 환경에서 window 객체에서 찾기 (런타임 설정 - ENV 또는 APP_CONFIG)
  if (typeof window !== 'undefined') {
    // window.ENV 방식 (기존)
    if ((window as any).ENV && (window as any).ENV[key]) {
      return (window as any).ENV[key]
    }
    // window.APP_CONFIG 방식 (호환성)
    if ((window as any).APP_CONFIG && (window as any).APP_CONFIG[key]) {
      return (window as any).APP_CONFIG[key]
    }
  }
  
  // 3. Node.js 환경에서 process.env 사용
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]
  }
  
  // 4. fallback 값 사용
  if (fallback) {
    return fallback
  }
  
  throw new Error(`환경변수 ${key}를 찾을 수 없습니다. 설정을 확인해주세요.`)
}

/**
 * 개발 환경 여부 확인 헬퍼
 */
function checkIsDevelopment(): boolean {
  // MODE 환경변수 우선
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
    return import.meta.env.MODE === 'development'
  }
  
  // NODE_ENV 확인
  try {
    return getEnvironmentVariable('NODE_ENV', 'development') === 'development'
  } catch {
    return true // 기본값은 개발 환경
  }
}

/**
 * 사이트 URL 결정 로직
 */
function determineSiteUrl(isDev: boolean): string {
  if (typeof window !== 'undefined') {
    // 브라우저 환경에서는 현재 origin 사용
    return window.location.origin
  }
  
  // SSR 환경에서는 환경변수 사용
  if (!isDev) {
    try {
      return getEnvironmentVariable('VITE_SITE_URL', 'https://teacher-notification-app.vercel.app')
    } catch {
      return 'https://teacher-notification-app.vercel.app'
    }
  }
  
  return 'http://localhost:5173'
}

/**
 * Base URL 결정 로직
 */
function determineBaseUrl(isDev: boolean): string {
  if (!isDev) {
    return '/'
  }
  
  try {
    return getEnvironmentVariable('BASE_URL', '/')
  } catch {
    return '/'
  }
}

/**
 * 애플리케이션 환경 설정
 */
const isDevMode = checkIsDevelopment()

export const env: EnvironmentConfig = {
  supabaseUrl: getEnvironmentVariable('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnvironmentVariable('VITE_SUPABASE_ANON_KEY'),
  isDevelopment: isDevMode,
  isProduction: !isDevMode,
  baseUrl: determineBaseUrl(isDevMode),
  siteUrl: determineSiteUrl(isDevMode),
  aiSystemUuid: getEnvironmentVariable('VITE_AI_SYSTEM_UUID', ''),
  useDummyWeather: getEnvironmentVariable('VITE_USE_DUMMY_WEATHER', 'false') === 'true',
  supabaseServiceKey: getEnvironmentVariable('VITE_SUPABASE_SERVICE_KEY', '')
}

/**
 * 개발 환경 여부 확인
 */
export const isDev = env.isDevelopment

/**
 * 프로덕션 환경 여부 확인
 */
export const isProd = env.isProduction

/**
 * 환경변수 유효성 검사
 */
export function validateEnvironment(): void {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]
  
  const missing = requiredVars.filter(varName => {
    try {
      getEnvironmentVariable(varName)
      return false
    } catch {
      return true
    }
  })
  
  if (missing.length > 0) {
    throw new Error(`필수 환경변수가 설정되지 않았습니다: ${missing.join(', ')}`)
  }
}

/**
 * 런타임에 환경변수 설정 (프로덕션용)
 * 
 * 이 함수는 HTML에서 스크립트로 호출하여 런타임에 환경변수를 설정할 수 있습니다.
 * 
 * @example
 * ```html
 * <script>
 *   window.ENV = {
 *     VITE_SUPABASE_URL: 'https://your-project.supabase.co',
 *     VITE_SUPABASE_ANON_KEY: 'your-anon-key'
 *   }
 *   // 또는
 *   window.APP_CONFIG = {
 *     SUPABASE_URL: 'https://your-project.supabase.co',
 *     SUPABASE_ANON_KEY: 'your-anon-key'
 *   }
 * </script>
 * ```
 */
export function setRuntimeEnvironment(config: Record<string, string>): void {
  if (typeof window !== 'undefined') {
    (window as any).ENV = { ...((window as any).ENV || {}), ...config }
  }
}

// =============================================================================
// ConfigService 호환 함수들 (기존 configService.ts에서 사용되던 함수들)
// =============================================================================

/**
 * Supabase URL 반환
 */
export const getSupabaseUrl = (): string => env.supabaseUrl

/**
 * Supabase Anonymous Key 반환
 */
export const getSupabaseAnonKey = (): string => env.supabaseAnonKey

/**
 * 현재 환경 반환
 */
export const getEnvironment = (): 'development' | 'production' => {
  return env.isDevelopment ? 'development' : 'production'
}

/**
 * 개발 환경 여부 확인
 */
export const isDevelopment = (): boolean => env.isDevelopment

/**
 * 프로덕션 환경 여부 확인
 */
export const isProduction = (): boolean => env.isProduction

/**
 * 라우터 Base URL 반환
 */
export const getBaseUrl = (): string => env.baseUrl

/**
 * 사이트 URL 반환 (OAuth redirect용)
 */
export const getSiteUrl = (): string => env.siteUrl

/**
 * AI 시스템 UUID 반환
 */
export const getAiSystemUuid = (): string | undefined => {
  return env.aiSystemUuid || undefined
}

/**
 * 더미 날씨 사용 여부 반환
 */
export const shouldUseDummyWeather = (): boolean => env.useDummyWeather || false

/**
 * Supabase Service Key 반환 (개발용만)
 */
export const getSupabaseServiceKey = (): string | undefined => {
  return env.supabaseServiceKey || undefined
}

/**
 * 설정 정보 출력 (디버깅용)
 */
export const getConfigInfo = (): {
  hasUrl: boolean
  hasKey: boolean
  environment: string
  source: string
  baseUrl: string
  siteUrl: string
} => {
  const hasRuntimeConfig = typeof window !== 'undefined' && 
    ((window as any).ENV || (window as any).APP_CONFIG)
  
  return {
    hasUrl: !!env.supabaseUrl,
    hasKey: !!env.supabaseAnonKey,
    environment: getEnvironment(),
    source: hasRuntimeConfig ? 'runtime' : 'environment',
    baseUrl: env.baseUrl,
    siteUrl: env.siteUrl
  }
}

// 애플리케이션 시작 시 환경변수 유효성 검사
try {
  validateEnvironment()
} catch (error) {
  console.error('환경변수 설정 오류:', error)
  // 개발 환경에서만 에러 발생, 프로덕션에서는 경고만
  if (isDevelopment()) {
    throw error
  }
}