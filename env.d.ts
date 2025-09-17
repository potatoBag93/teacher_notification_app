/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_AI_FORMATTING: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_WEATHER_API_KEY: string
  readonly VITE_USE_DUMMY_WEATHER: string
  readonly VITE_AI_GENERATION_ENABLED: string
  readonly VITE_DAILY_AI_GENERATION_ENABLED: string
  readonly VITE_AI_SYSTEM_UUID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}