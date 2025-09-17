# 교사용 알림장 도우미 (Teacher Notification Helper)

> 교사들이 시기와 상황에 맞는 알림장 내용을 쉽게 선택하고 편집하여 효율적으로 알림장을 작성할 수 있는 웹 서비스

## 🎯 프로젝트 개요

### 핵심 가치
- **시간 절약**: 알림장 작성 시간 50% 단축 목표
- **품질 향상**: 일관성 있는 지도 내용 제공
- **지식 공유**: 교사 간 우수한 지도 문구 공유

### 주요 기능
- 📝 **블록 중심 편집**: 드래그앤드롭으로 문구 조합 및 편집
- 🏷️ **카테고리 시스템**: 13개 기본 카테고리 + 향후 세분화
- 📊 **개인 통계**: 사용 패턴 분석 및 개인화 추천
- 🤝 **커뮤니티**: 문구 공유 및 사용자 기여
- 🤖 **AI 포맷팅**: 문체 통일 및 스타일 일관성

## 🛠️ 기술 스택

### Frontend
- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **CSS**: Tailwind CSS
- **State Management**: Pinia
- **Router**: Vue Router
- **Testing**: Vitest

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Realtime**: Supabase Realtime

### Additional Libraries
- **Drag & Drop**: SortableJS
- **Charts**: Chart.js + Vue-ChartJS
- **Icons**: Heroicons
- **UI Components**: Headless UI

## 🚀 개발 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 시작
```bash
npm run dev
```

### 3. 빌드
```bash
npm run build
```

### 4. 테스트
```bash
npm run test:unit
```

## 📋 개발 우선순위 (Phase 1)

1. ✅ **개발 환경 구축** - Vue.js + Vite 프로젝트 초기화
2. 🔄 **기본 UI 구성** - 메인 화면 및 기본 컴포넌트
3. 🔄 **Supabase 연동** - 데이터베이스 및 인증 설정
4. 🔄 **초기 데이터 구축** - 카테고리별 샘플 문구
5. 🔄 **문구 편집 기능** - 블록 기반 편집 시스템
6. 🔄 **개인 문구 관리** - 저장/작성/공유 기능
7. 🔄 **기본 통계** - 개인 사용 패턴 분석
8. 🔄 **검색 기능** - 키워드 + 태그 필터링

## 📚 참고 문서

- **📋 최종 개발 계획서**: `docs/project_final_approved.md`
- **⚙️ 기능 명세서**: `docs/functional_specification.md`
- **🎨 UI/UX 가이드**: `docs/ui_guide.md`
- **🖼️ HTML 목업들**: `docs/mockups/` 폴더
- **🎨 컴포넌트 라이브러리**: `docs/components/`

## 🔧 환경 설정

### Supabase 설정
1. Supabase 프로젝트 생성
2. 환경 변수 설정 (`.env.local`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### VS Code 확장
- Vetur 또는 Volar (Vue)
- Tailwind CSS IntelliSense
- ESLint
- Prettier

---

**📅 프로젝트 시작일**: 2025년 8월 9일  
**🎯 Phase 1 목표 완료일**: 2025년 9월 9일  
**✅ 최종 승인**: 모든 계획 검토 완료
