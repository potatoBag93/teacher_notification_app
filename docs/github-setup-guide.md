# GitHub CLI를 사용한 리포지토리 등록 가이드

## 개요
이 문서는 알뭐 프로젝트를 GitHub CLI를 사용하여 GitHub 리포지토리로 등록하는 과정을 단계별로 설명합니다.

## 프로젝트 정보
- **프로젝트명**: 알뭐
- **기술 스택**: Vue.js + TypeScript + Supabase
- **리포지토리 URL**: https://github.com/potatoBag93/teacher_notification_app
- **설정**: Public Repository

## 사전 요구사항
- GitHub 계정
- Git 설치
- GitHub CLI (gh) 설치

## 단계별 진행 과정

### 1. GitHub CLI 설치 확인
```powershell
gh --version
```
**결과**: `gh version 2.74.1 (2025-06-10)`

### 2. GitHub 인증 상태 확인
```powershell
gh auth status --show-token
```
**결과**: 
```
github.com
  ✓ Logged in to github.com account potatoBag93 (keyring)
  - Active account: true
  - Git operations protocol: https
  - Token: [REDACTED]
```

### 3. Git 저장소 초기화 및 설정

#### 3-1. Git 안전 디렉토리 설정
```powershell
git config --global --add safe.directory E:/devs/project_factory/teacher_notification_app
```

#### 3-2. Git 상태 확인
```powershell
git status
```

### 4. 환경 파일 제외 처리

#### 4-1. .env 파일 제외
```powershell
git reset .env
```

#### 4-2. .gitignore 파일 업데이트
`.gitignore` 파일에 다음 내용 추가:
```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

#### 4-3. .gitignore 변경사항 스테이징
```powershell
git add .gitignore
```

### 5. 파일 스테이징 및 커밋

#### 5-1. 모든 파일 스테이징
```powershell
git add .
```
**주의**: `.env` 파일은 이미 제외되어 스테이징되지 않음

#### 5-2. 초기 커밋 생성
```powershell
git commit -m "Initial commit: 알뭐

- Vue.js + TypeScript 기반 알뭐 웹 애플리케이션
- Supabase 백엔드 및 Edge Functions 
- 다양한 알뭐 스타일 및 편집기 mockup
- 날씨 기반 알림 생성 기능
- 사용자 피드백 및 통계 시스템
- 반응형 UI 컴포넌트 라이브러리
- .env 파일 제외 처리"
```

**결과**: 
- 211개 파일 변경
- 84,549줄 추가
- 커밋 해시: `3664d60`

### 6. GitHub 리포지토리 생성 및 푸시

```powershell
gh repo create almo --public --source=. --description="알뭐 웹 애플리케이션 - Vue.js + TypeScript + Supabase" --push
```

**실행 결과**:
```
✓ Created repository potatoBag93/teacher_notification_app on github.com
  https://github.com/potatoBag93/teacher_notification_app
✓ Added remote https://github.com/potatoBag93/teacher_notification_app.git
✓ Pushed commits to https://github.com/potatoBag93/teacher_notification_app.git
```

## 최종 결과

### 생성된 리포지토리 정보
- **소유자**: potatoBag93
- **리포지토리명**: teacher_notification_app
- **접근 권한**: Public
- **기본 브랜치**: master
- **원격 저장소 URL**: https://github.com/potatoBag93/teacher_notification_app.git

### 업로드된 파일 구조
```
teacher_notification_app/
├── .editorconfig
├── .gitattributes
├── .gitignore (환경변수 제외 규칙 포함)
├── .vscode/
├── README.md
├── TODO.md
├── docs/ (문서 및 백업)
├── preview-mockups/ (다양한 에디터 스타일 mockup)
├── src/ (Vue.js 소스 코드)
├── supabase/ (백엔드 함수 및 마이그레이션)
├── package.json
├── vite.config.ts
└── ... (기타 설정 파일들)
```

## 주요 파일 제외 사항
- `.env` 파일: 환경변수 및 민감한 정보 포함으로 제외
- `node_modules/`: 의존성 패키지 디렉토리 제외
- `dist/`: 빌드 결과물 제외

## GitHub CLI 명령어 참고

### 기본 명령어
```powershell
# 인증 확인
gh auth status

# 리포지토리 생성 (기본)
gh repo create <repository-name>

# 리포지토리 생성 (옵션 포함)
gh repo create <repository-name> --public --source=. --description="설명" --push

# 리포지토리 목록 확인
gh repo list

# 리포지토리 정보 확인
gh repo view
```

### 유용한 옵션
- `--public`: 공개 리포지토리로 생성
- `--private`: 비공개 리포지토리로 생성
- `--source=.`: 현재 디렉토리를 소스로 사용
- `--description`: 리포지토리 설명 추가
- `--push`: 생성 후 자동으로 푸시

## 문제 해결

### 1. Git 소유권 문제
```
fatal: detected dubious ownership in repository
```
**해결방법**:
```powershell
git config --global --add safe.directory <프로젝트-경로>
```

### 2. .env 파일 실수로 포함된 경우
```powershell
# 스테이징에서 제거
git reset .env

# .gitignore에 추가 후
git add .gitignore
```

### 3. 커밋 없이 푸시 시도 시
```
--push enabled but no commits found
```
**해결방법**: 먼저 커밋을 생성한 후 푸시

## 참고 링크
- [GitHub CLI 공식 문서](https://cli.github.com/manual/)
- [Git 공식 문서](https://git-scm.com/doc)
- [알뭐 리포지토리](https://github.com/potatoBag93/almo)

---

**작성일**: 2025년 9월 18일  
**작성자**: GitHub Copilot  
**프로젝트**: 알뭐