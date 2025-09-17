/**
 * 설정 관리 서비스
 * 프로덕션 환경에서 환경변수를 안전하게 관리합니다.
 */

interface AppConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  environment: 'development' | 'production'
}

class ConfigService {
  private config: AppConfig | null = null

  /**
   * 설정을 초기화합니다
   * 우선순위: 런타임 설정 > 환경변수 > 기본값
   */
  private initializeConfig(): AppConfig {
    if (this.config) {
      return this.config
    }

    // 1. 런타임 설정 확인 (window.APP_CONFIG)
    if (typeof window !== 'undefined' && (window as any).APP_CONFIG) {
      const runtimeConfig = (window as any).APP_CONFIG
      this.config = {
        supabaseUrl: runtimeConfig.SUPABASE_URL,
        supabaseAnonKey: runtimeConfig.SUPABASE_ANON_KEY,
        environment: runtimeConfig.NODE_ENV || 'production'
      }
      return this.config
    }

    // 2. 환경변수 확인 (개발환경)
    this.config = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      environment: import.meta.env.MODE === 'development' ? 'development' : 'production'
    }

    // 3. 설정 검증
    this.validateConfig()

    return this.config
  }

  /**
   * 설정 유효성 검사
   */
  private validateConfig(): void {
    if (!this.config) {
      throw new Error('Configuration not initialized')
    }

    const { supabaseUrl, supabaseAnonKey } = this.config

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing configuration:', {
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey
      })
      throw new Error('Missing required configuration. Please check your environment variables or runtime configuration.')
    }

    if (!supabaseUrl.startsWith('https://')) {
      throw new Error('Supabase URL must start with https://')
    }
  }

  /**
   * Supabase URL 반환
   */
  getSupabaseUrl(): string {
    return this.initializeConfig().supabaseUrl
  }

  /**
   * Supabase Anonymous Key 반환
   */
  getSupabaseAnonKey(): string {
    return this.initializeConfig().supabaseAnonKey
  }

  /**
   * 현재 환경 반환
   */
  getEnvironment(): 'development' | 'production' {
    return this.initializeConfig().environment
  }

  /**
   * 개발 환경 여부 확인
   */
  isDevelopment(): boolean {
    return this.getEnvironment() === 'development'
  }

  /**
   * 프로덕션 환경 여부 확인
   */
  isProduction(): boolean {
    return this.getEnvironment() === 'production'
  }

  /**
   * 라우터 Base URL 반환
   * 프로덕션에서는 '/', 개발환경에서는 환경변수 사용
   */
  getBaseUrl(): string {
    if (this.isProduction()) {
      return '/'
    }
    return import.meta.env.BASE_URL || '/'
  }

  /**
   * 사이트 URL 반환 (OAuth redirect용)
   * 프로덕션에서는 현재 origin 사용, 개발환경에서는 localhost
   */
  getSiteUrl(): string {
    if (typeof window !== 'undefined') {
      // 브라우저 환경에서는 현재 origin 사용
      return window.location.origin
    }
    
    // SSR 환경에서는 환경변수 사용
    if (this.isProduction()) {
      return import.meta.env.VITE_SITE_URL || 'https://teacher-notification-app.vercel.app'
    }
    
    return 'http://localhost:5173'
  }

  /**
   * 설정 정보 출력 (디버깅용)
   */
  getConfigInfo(): { hasUrl: boolean; hasKey: boolean; environment: string; source: string } {
    const config = this.initializeConfig()
    const hasRuntimeConfig = typeof window !== 'undefined' && (window as any).APP_CONFIG
    
    return {
      hasUrl: !!config.supabaseUrl,
      hasKey: !!config.supabaseAnonKey,
      environment: config.environment,
      source: hasRuntimeConfig ? 'runtime' : 'environment'
    }
  }
}

// 싱글톤 인스턴스 생성
export const configService = new ConfigService()

// 편의를 위한 직접 접근 함수들
export const getSupabaseUrl = () => configService.getSupabaseUrl()
export const getSupabaseAnonKey = () => configService.getSupabaseAnonKey()
export const getEnvironment = () => configService.getEnvironment()
export const isDevelopment = () => configService.isDevelopment()
export const isProduction = () => configService.isProduction()
export const getBaseUrl = () => configService.getBaseUrl()
export const getSiteUrl = () => configService.getSiteUrl()

export default configService