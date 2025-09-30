
<template>
  <AppLayout>
    <div class="about-theme-view">
      <section class="flat-section">
        <h1 class="flat-section-title">서비스 소개</h1>
        <div class="about-card">
          <div class="about-section-title">학교 소통, 이제 더 쉽고 스마트하게! 알뭐</div>
          <p>교사, 학부모, 학생 모두가 쉽고 편리하게 소통할 수 있도록 만든 서비스입니다. 학교 생활, 안전, 규칙, 행사 등 다양한 상황에 맞는 문구를 클릭만으로 선택·전송할 수 있어요.</p>
        </div>
      </section>
      <section class="flat-section">
        <h2 class="flat-section-title">주요 기능</h2>
        <div class="about-card">
          <div class="tags-list">
            <span class="tag-badge category">문구 자동 추천</span>
            <span class="tag-badge category">태그/카테고리 분류</span>
            <span class="tag-badge category">통계 기반 추천</span>
            <span class="tag-badge category">클릭 기반 UI</span>
            <span class="tag-badge category">데이터베이스 관리</span>
          </div>
          <ul>
            <li>날씨, 통계, 카테고리 등 다양한 조건에 따라 맞춤 문구 추천</li>
            <li>카테고리/태그별로 빠른 검색 및 분류</li>
            <li>개인화된 추천 및 최근 사용 문구 제공</li>
          </ul>
        </div>
      </section>
      <section class="flat-section">
        <h2 class="flat-section-title">서비스 장점</h2>
        <div class="about-card">
          <div class="tags-list">
            <span class="tag-badge category">시간 절약</span>
            <span class="tag-badge category">명확한 정보 전달</span>
            <span class="tag-badge category">관리 효율성</span>
            <span class="tag-badge category">맞춤형 안내</span>
            <span class="tag-badge category">안전·규칙 강화</span>
          </div>
          <ul>
            <li>반복 업무 자동화로 교사의 시간 절약</li>
            <li>단호하고 명확한 문구로 효과적 정보 전달</li>
            <li>태그/카테고리/통계 기반 관리로 빠른 검색</li>
          </ul>
        </div>
      </section>
      <section class="flat-section">
        <h2 class="flat-section-title">활용 예시</h2>
        <div class="about-card">
          <ul>
            <li>날씨 상황에 맞는 안전 안내 자동 추천</li>
            <li>학사 일정에 맞는 문구 클릭 선택</li>
            <li>통계 기반 추천 문구 제공</li>
            <li>카테고리별 문구 관리</li>
          </ul>
        </div>
      </section>
      <div class="about-footer">여러분의 학교 생활을 든든하게 지원합니다!</div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
</script>


<style scoped>
.about-theme-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem 2rem 3rem 2rem;
  background: #f8fafc;
  min-height: 100vh;
}
.flat-section {
  margin-bottom: 2.5rem;
  padding: 0 0 1.5rem 0;
  background: transparent;
  border: none;
  box-shadow: none;
}
.flat-section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 1.2rem;
  letter-spacing: 0.01em;
}
.about-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2rem 2rem 1.5rem 2rem;
  margin-bottom: 1.2em;
}
.about-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 0.7rem;
}
.tags-list {
  margin-bottom: 0.5rem;
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.tag-badge {
  background: #dbeafe;
  color: #1e40af;
  border-radius: 9999px;
  font-size: 0.85rem;
  padding: 0.2rem 0.8rem;
  font-weight: 500;
  margin-right: 0.2rem;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
}
.tag-badge.category {
  background-color: #dbeafe;
  color: #1e40af;
}
.tag-badge.sub-tag {
  background-color: #e5e7eb;
  color: #4b5563;
}
ul {
  padding-left: 1.2em;
  margin: 0.5em 0 0 0;
}
.about-footer {
  margin-top: 40px;
  text-align: center;
  color: #888;
  font-size: 1rem;
}
@media (max-width: 600px) {
  .about-theme-view {
    padding: 18px 6px;
  }
  .about-card {
    padding: 1rem 0.5rem;
  }
}
</style>
