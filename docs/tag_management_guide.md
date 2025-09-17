# 태그 관리 시스템 가이드

## 현재 구조

### 메인 카테고리 (19개)
```typescript
// src/constants/categories.ts
export type Category = 
  | '안전' | '생활지도' | '학습' | '건강' | '행사' 
  | '알림' | '상담' | '칭찬' | '주의' | '준비물' 
  | '숙제' | '창의' | '인성' | '환경' | '정보' 
  | '체육' | '예술' | '기타' | '일반'
```

### 서브태그 매핑
각 메인 카테고리당 평균 6-9개의 서브태그가 매핑되어 있습니다.

## 새로운 태그 추가 가이드

### 1. 새로운 메인 카테고리 추가
1. `Category` 타입에 새 카테고리 추가
2. `categories` 배열에 추가
3. `categoryMetaMap`에 메타데이터 추가
4. `categorySubTagsMap`에 서브태그 매핑 추가

### 2. 기존 카테고리에 서브태그 추가
1. `categorySubTagsMap`에서 해당 카테고리 찾기
2. 새로운 서브태그 문자열 추가
3. `UserUsageService.getMainCategoryFromSubTag()`의 매핑도 업데이트

### 3. 주의사항
- 메인 카테고리 변경 시 기존 데이터 호환성 고려
- 서브태그는 의미가 명확하고 간결해야 함
- 중복되는 의미의 서브태그는 피할 것

## 향후 개선 계획

### 단기 (현재 방식 개선)
- [x] 서브태그별 사용 통계 기능 추가
- [x] 추천 시스템에서 서브태그 고려
- [ ] 태그 검증 함수 강화
- [ ] 태그 추가/수정 도구 스크립트 제작

### 중기 (데이터베이스 연동)
- [ ] 카테고리 관리 테이블 설계
- [ ] 관리자 페이지 구현
- [ ] 마이그레이션 도구 개발

### 장기 (개인화)
- [ ] 사용자별 커스텀 태그
- [ ] AI 기반 태그 자동 추천
- [ ] 태그 사용 패턴 분석

## 데이터베이스 설계 (미래)

```sql
-- 메인 카테고리 테이블
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 서브태그 테이블
CREATE TABLE sub_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, category_id)
);

-- 사용자 커스텀 태그 (미래)
CREATE TABLE user_custom_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(50) NOT NULL,
  parent_category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 현재 시스템 장단점

### 장점
- 빠른 성능 (메모리 상에서 처리)
- 타입 안정성 보장
- 버전 관리 용이

### 단점
- 유연성 부족
- 배포 없이 변경 불가
- 다국어 지원 어려움

## 권장사항

현재 시스템은 중소 규모 애플리케이션에 적합합니다. 
다만 향후 확장성을 고려하여 점진적으로 데이터베이스 기반으로 이전하는 것을 권장합니다.
