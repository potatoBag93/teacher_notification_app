# Supabase 프로젝트 설정 가이드

## 🚀 Supabase CLI 설정

### 1. Supabase CLI 설치
```bash
npm install -g supabase
# 또는
npx supabase --help
```

### 2. 프로젝트 초기화
```bash
# 프로젝트 루트에서 실행
supabase init

# 기존 Supabase 프로젝트와 연결
supabase link --project-ref YOUR_PROJECT_ID
```

### 3. 로컬 개발 환경 시작
```bash
supabase start
```

## 📁 Functions 폴더 구조 예시

```
supabase/
├── functions/
│   ├── weather-notice-generator/
│   │   ├── index.ts              # 메인 함수
│   │   └── _shared/              # 공통 유틸리티 심볼릭 링크
│   ├── school-search/
│   │   └── index.ts
│   ├── coordinate-converter/
│   │   └── index.ts
│   └── _shared/                  # 공통 모듈
│       ├── api-clients/
│       │   ├── kma-client.ts     # 기상청 API
│       │   ├── neis-client.ts    # 나이스 API
│       │   └── openai-client.ts  # AI API
│       ├── types/
│       │   ├── weather.ts        # 날씨 타입 정의
│       │   └── school.ts         # 학교 타입 정의
│       └── utils/
│           ├── coordinate.ts     # 좌표 변환
│           └── logger.ts         # 로깅 유틸리티
├── config.toml                   # Supabase 설정
└── migrations/                   # 데이터베이스 마이그레이션
```

## 🔧 환경 변수 설정

### Supabase Secrets 설정
```bash
# API 키들을 Supabase Secrets에 저장
supabase secrets set KMA_API_KEY="your_kma_api_key"
supabase secrets set NEIS_API_KEY="your_neis_api_key"
supabase secrets set OPENAI_API_KEY="your_openai_api_key"
supabase secrets set AIRKOREA_API_KEY="your_airkorea_api_key"
```

### 로컬 개발용 .env
```bash
# .env.local 파일 생성
KMA_API_KEY=your_local_kma_key
NEIS_API_KEY=your_local_neis_key
OPENAI_API_KEY=your_local_openai_key
AIRKOREA_API_KEY=your_local_airkorea_key
```

## 🚀 Function 배포 명령어

### 개별 Function 배포
```bash
# 특정 함수만 배포
supabase functions deploy weather-notice-generator

# 모든 함수 배포
supabase functions deploy
```

### 로컬 테스트
```bash
# 로컬에서 함수 실행
supabase functions serve weather-notice-generator

# HTTP 요청으로 테스트
curl -X POST http://localhost:54321/functions/v1/weather-notice-generator \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 📊 스케줄링 설정

### pg_cron을 이용한 자동 실행
```sql
-- 매일 새벽 6시에 날씨 문구 생성 실행
SELECT cron.schedule(
  'weather-notice-generation',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/weather-notice-generator',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  );
  $$
);
```

## 🐛 디버깅 및 로그 확인

### Function 로그 확인
```bash
# 실시간 로그 확인
supabase functions logs weather-notice-generator

# 특정 시간대 로그 확인
supabase functions logs weather-notice-generator --since="1h"
```

### 로컬 디버깅
```typescript
// Deno의 console.log 사용
console.log('Debug info:', data);

// 구조적 로깅 (권장)
const logger = {
  info: (msg: string, data?: any) => console.log(JSON.stringify({ level: 'info', msg, data })),
  error: (msg: string, error?: any) => console.error(JSON.stringify({ level: 'error', msg, error }))
};
```

## 📚 개발 가이드라인

### TypeScript 타입 안전성
```typescript
// 항상 타입 정의 사용
interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
}

// Response 타입 정의
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 에러 처리 패턴
```typescript
try {
  const result = await apiCall();
  return new Response(JSON.stringify({ success: true, data: result }));
} catch (error) {
  console.error('API Error:', error);
  return new Response(
    JSON.stringify({ success: false, error: error.message }),
    { status: 500 }
  );
}
```

### CORS 설정
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 모든 응답에 CORS 헤더 포함
return new Response(JSON.stringify(data), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

## 🔐 보안 체크리스트

- [ ] API 키는 Supabase Secrets에 저장
- [ ] 민감한 정보는 로그에 출력하지 않음  
- [ ] 요청 검증 및 Rate Limiting 구현
- [ ] HTTPS 강제 사용
- [ ] 입력값 검증 및 Sanitization
- [ ] SQL Injection 방지 (Supabase 클라이언트 사용)

이제 각 Function들을 단계별로 구현해나갈 준비가 완료되었습니다!
