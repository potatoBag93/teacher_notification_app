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
}

/**
 * 환경변수를 안전하게 가져오는 함수
 */
function getEnvironmentVariable(key: string, fallback?: string): string {
  // 1. Vite 환경변수 시스템 우선 사용 (빌드 시점에 주입됨)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key]
  }
  
  // 2. 브라우저 환경에서 window 객체에서 찾기 (런타임 설정)
  if (typeof window !== 'undefined' && (window as any).ENV && (window as any).ENV[key]) {
    return (window as any).ENV[key]
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
 * 애플리케이션 환경 설정
 */
export const env: EnvironmentConfig = {
  supabaseUrl: getEnvironmentVariable('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnvironmentVariable('VITE_SUPABASE_ANON_KEY'),
  isDevelopment: getEnvironmentVariable('NODE_ENV', 'development') === 'development',
  isProduction: getEnvironmentVariable('NODE_ENV', 'development') === 'production'
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
 * </script>
 * ```
 */
export function setRuntimeEnvironment(config: Record<string, string>): void {
  if (typeof window !== 'undefined') {
    (window as any).ENV = { ...((window as any).ENV || {}), ...config }
  }
}

// 애플리케이션 시작 시 환경변수 유효성 검사
try {
  validateEnvironment()
} catch (error) {
  console.error('환경변수 설정 오류:', error)
  // 개발 환경에서만 에러 발생, 프로덕션에서는 경고만
  if (isDev) {
    throw error
  }
}