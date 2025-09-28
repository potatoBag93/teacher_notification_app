# NewMainView DB 연동 및 실데이터 적용 작업 가이드 (개선안)

## 1. 기본 원칙: MainView와 완전한 호환성 확보
- **목표:** NewMainView가 기존 MainView를 완전히 대체할 수 있도록, 더미 데이터가 아닌 실제 DB 데이터를 사용합니다.
- **핵심 원칙:** 새로운 데이터 타입(SimplePhrase)을 만들지 않고, **기존 `Notice` 데이터 모델과 `NoticeCard` 컴포넌트를 그대로 재사용**하여 일관성을 유지하고 중복 개발을 방지합니다.

## 2. 주요 작업 단계

### 단계 1: 데이터 로직 이전 (`MainView.vue` -> `NewMainView.vue`)
- `MainView.vue`의 `<script setup>` 섹션에 있는 실데이터 연동 로직을 `NewMainView.vue`로 이전합니다.
- **이전 대상:**
    - `NoticeService`, `WeatherNoticeService` 등 모든 서비스 import 구문.
    - 데이터 상태 관련 `ref` 변수들 (예: `weatherRecommendedNotices`, `categoryRecommendedNotices`, `recommendedBlocks` 등). **이들은 `Notice[]` 타입을 가져야 합니다.**
    - `onMounted` 훅 내부의 `loadAllData()` 호출 로직.
    - 데이터 로딩 함수 전체 (`loadAllData`, `loadWeatherNotices`, `loadCategoryRecommendations`, `loadRecommendedBlocks` 등).

### 단계 2: 컴포넌트 교체 및 Props 매핑
- **(중요)** `NewMainView.vue`의 추천 섹션에서 현재 사용 중인 `recommend-card` div를 **`NoticeCard` 컴포넌트로 교체**합니다.
- `v-for` 루프에서 `NoticeCard`의 각 `prop`에 `Notice` 객체의 데이터를 정확히 바인딩합니다.

```html
<!-- 추천문구 레인(Lane) 예시 -->
<div class="lane-items">
  <NoticeCard
    v-for="notice in weatherRecommendations"
    :key="notice.id"
    :title="notice.title"
    :content="notice.content"
    :tags="notice.tags"
    :sub-tags="notice.subTags"
    :author="notice.author"
    :like-count="notice.likeCount"
    :sub-items="notice.subItems"
    :is-selected="selectedNotices.some(n => n.id === notice.id)"
    @click="() => toggleSelection(notice)"
  />
</div>
```

### 단계 3: 기능 로직 수정
- **선택 로직 (`toggleSelection`):** 현재 `string`(내용) 기반으로 동작하는 선택 로직을 `MainView.vue`와 동일하게 `Notice` 객체 또는 `notice.id` 기반으로 동작하도록 수정합니다.
- **태그 검색 로직:** '태그로 문구 찾기' 기능 또한 더미 데이터(`dummyPhrases`)가 아닌, `NoticeService`를 통해 가져온 전체 문구 데이터를 기반으로 동작하도록 수정해야 합니다.

## 4. 기대 효과
- `NewMainView`가 더미 데이터에서 완전히 분리되어 실제 데이터로 구동됩니다.
- `MainView`와 `NewMainView` 간의 코드 중복이 최소화되고, `Notice` 모델과 `NoticeCard` 컴포넌트를 재사용하여 유지보수성이 향상됩니다.
- 앱 전체의 데이터 및 UI 일관성이 확보됩니다.

---
**결론:** `SimplePhrase`라는 중간 데이터 타입을 만드는 대신, `MainView`의 검증된 데이터 로직과 컴포넌트 구조를 `NewMainView`에 그대로 적용하는 것이 가장 효율적이고 올바른 방향입니다.
