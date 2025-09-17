<template>
  <AppLayout>
    <div class="about-container">
      <!-- 페이지 헤더 -->
      <header class="about-header">
        <div class="header-content">
          <h1 class="about-title">📚 교실 소통 문구</h1>
          <p class="about-subtitle">AI와 함께하는 스마트한 교실 소통 도구</p>
          <div class="version-info">
            <span class="version-badge">v2.0.0</span>
            <span class="update-date">2025년 9월 업데이트</span>
          </div>
        </div>
      </header>

      <!-- 주요 기능 소개 -->
      <section class="features-section">
        <h2 class="section-title">🌟 주요 기능</h2>
        
        <div class="features-grid">
          <!-- 스마트 추천 시스템 -->
          <div class="feature-card highlight">
            <div class="feature-icon">🔥</div>
            <h3 class="feature-title">스마트 추천 시스템</h3>
            <p class="feature-description">
              날씨, 사용 패턴, 새로운 카테고리를 종합하여 개인화된 문구를 추천합니다.
            </p>
            <ul class="feature-details">
              <li>🌤️ <strong>날씨 기반 추천</strong>: 실시간 날씨 정보로 상황에 맞는 문구 제공</li>
              <li>🎯 <strong>개인 맞춤 추천</strong>: 사용 기록을 분석한 개인화 추천</li>
              <li>🔍 <strong>새 카테고리 추천</strong>: 아직 탐색하지 않은 영역의 문구 발견</li>
            </ul>
          </div>

          <!-- AI 문구 생성 -->
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3 class="feature-title">AI 문구 생성</h3>
            <p class="feature-description">
              Gemini AI를 활용하여 창의적이고 상황에 맞는 알림장 문구를 자동 생성합니다.
            </p>
            <ul class="feature-details">
              <li>✨ 창의적인 문구 자동 생성</li>
              <li>🎨 다양한 톤앤매너 지원</li>
              <li>📝 맞춤형 세부 항목 포함</li>
            </ul>
          </div>

          <!-- 실시간 날씨 연동 -->
          <div class="feature-card">
            <div class="feature-icon">🌦️</div>
            <h3 class="feature-title">실시간 날씨 연동</h3>
            <p class="feature-description">
              학교 위치 기반 실시간 날씨 정보로 상황에 맞는 알림 문구를 제공합니다.
            </p>
            <ul class="feature-details">
              <li>🌧️ 비 예보 시 우산 챙기기 알림</li>
              <li>❄️ 추위 시 보온 관련 안내</li>
              <li>☀️ 더위 시 수분 섭취 당부</li>
            </ul>
          </div>

          <!-- 다중 선택 시스템 -->
          <div class="feature-card">
            <div class="feature-icon">✅</div>
            <h3 class="feature-title">다중 선택 시스템</h3>
            <p class="feature-description">
              여러 문구를 선택하여 한 번에 관리하고 편집할 수 있습니다.
            </p>
            <ul class="feature-details">
              <li>🗂️ 여러 문구 동시 선택</li>
              <li>🔄 드래그 앤 드롭으로 순서 변경</li>
              <li>📋 일괄 복사 및 편집</li>
            </ul>
          </div>

          <!-- 알림장 미리보기 -->
          <div class="feature-card">
            <div class="feature-icon">👁️</div>
            <h3 class="feature-title">알림장 미리보기</h3>
            <p class="feature-description">
              실제 알림장 형태로 미리보기하고 다양한 형태로 출력할 수 있습니다.
            </p>
            <ul class="feature-details">
              <li>📊 그리드 모드: 전체 문구 한눈에 보기</li>
              <li>📽️ 슬라이드 모드: 발표용 전체화면</li>
              <li>🎨 다양한 테마 지원 (밝음/어둠/종이)</li>
            </ul>
          </div>

          <!-- 사용 통계 -->
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3 class="feature-title">사용 통계 분석</h3>
            <p class="feature-description">
              문구 사용 패턴을 분석하여 인사이트를 제공합니다.
            </p>
            <ul class="feature-details">
              <li>📈 일일/주간/월간 사용 통계</li>
              <li>🏆 인기 문구 랭킹</li>
              <li>🎯 개인 사용 패턴 분석</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 기술 스택 -->
      <section class="tech-section">
        <h2 class="section-title">🛠️ 기술 스택</h2>
        
        <div class="tech-grid">
          <div class="tech-category">
            <h3 class="tech-category-title">Frontend</h3>
            <div class="tech-tags">
              <span class="tech-tag vue">Vue 3</span>
              <span class="tech-tag">TypeScript</span>
              <span class="tech-tag">Composition API</span>
              <span class="tech-tag">Vite</span>
              <span class="tech-tag">Tailwind CSS</span>
            </div>
          </div>

          <div class="tech-category">
            <h3 class="tech-category-title">Backend & Database</h3>
            <div class="tech-tags">
              <span class="tech-tag supabase">Supabase</span>
              <span class="tech-tag">PostgreSQL</span>
              <span class="tech-tag">Edge Functions</span>
              <span class="tech-tag">Real-time</span>
            </div>
          </div>

          <div class="tech-category">
            <h3 class="tech-category-title">AI & API</h3>
            <div class="tech-tags">
              <span class="tech-tag gemini">Gemini AI</span>
              <span class="tech-tag">OpenWeather API</span>
              <span class="tech-tag">RESTful API</span>
            </div>
          </div>

          <div class="tech-category">
            <h3 class="tech-category-title">Authentication</h3>
            <div class="tech-tags">
              <span class="tech-tag">Google OAuth</span>
              <span class="tech-tag">JWT</span>
              <span class="tech-tag">Role-based Access</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 새로운 기능들 -->
      <section class="updates-section">
        <h2 class="section-title">🆕 최근 업데이트</h2>
        
        <div class="updates-timeline">
          <div class="update-item">
            <div class="update-date">2025년 9월</div>
            <div class="update-content">
              <h3 class="update-title">스크롤 모드 UI 개선</h3>
              <ul class="update-details">
                <li>추천 섹션과 전체 문구 섹션 분리</li>
                <li>스마트 네비게이션 추가</li>
                <li>일관된 디자인 테마 적용</li>
              </ul>
            </div>
          </div>

          <div class="update-item">
            <div class="update-date">2025년 8월</div>
            <div class="update-content">
              <h3 class="update-title">AI 문구 생성 기능</h3>
              <ul class="update-details">
                <li>Gemini AI 통합</li>
                <li>상황별 맞춤 문구 생성</li>
                <li>다양한 스타일 옵션</li>
              </ul>
            </div>
          </div>

          <div class="update-item">
            <div class="update-date">2025년 7월</div>
            <div class="update-content">
              <h3 class="update-title">날씨 기반 추천 시스템</h3>
              <ul class="update-details">
                <li>실시간 날씨 API 연동</li>
                <li>날씨별 맞춤 문구 추천</li>
                <li>자동 알림 시스템</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 사용법 안내 -->
      <section class="guide-section">
        <h2 class="section-title">📖 사용법 안내</h2>
        
        <div class="guide-steps">
          <div class="guide-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3 class="step-title">추천 문구 확인</h3>
              <p class="step-description">메인 페이지의 추천 섹션에서 날씨와 사용 패턴을 고려한 맞춤 문구를 확인하세요.</p>
            </div>
          </div>

          <div class="guide-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3 class="step-title">문구 선택 및 편집</h3>
              <p class="step-description">원하는 문구들을 클릭하여 선택하고, 필요시 편집 페이지에서 수정하세요.</p>
            </div>
          </div>

          <div class="guide-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3 class="step-title">알림장 미리보기</h3>
              <p class="step-description">선택한 문구들을 알림장 형태로 미리보고, 다양한 모드로 출력하세요.</p>
            </div>
          </div>

          <div class="guide-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3 class="step-title">AI 문구 생성</h3>
              <p class="step-description">편집 페이지에서 AI를 활용하여 새로운 창의적인 문구를 생성하세요.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 연락처 정보 -->
      <section class="contact-section">
        <h2 class="section-title">📞 문의 및 지원</h2>
        
        <div class="contact-grid">
          <div class="contact-card">
            <div class="contact-icon">🐛</div>
            <h3 class="contact-title">버그 신고</h3>
            <p class="contact-description">문제를 발견하셨나요? 피드백 페이지를 통해 신고해주세요.</p>
            <router-link to="/feedback" class="contact-link">피드백 보내기</router-link>
          </div>

          <div class="contact-card">
            <div class="contact-icon">💡</div>
            <h3 class="contact-title">기능 제안</h3>
            <p class="contact-description">새로운 기능 아이디어가 있으시면 언제든 제안해주세요.</p>
            <router-link to="/feedback" class="contact-link">아이디어 제안</router-link>
          </div>

          <div class="contact-card">
            <div class="contact-icon">📊</div>
            <h3 class="contact-title">사용 통계</h3>
            <p class="contact-description">개인 사용 패턴과 통계를 확인해보세요.</p>
            <router-link to="/stats" class="contact-link">통계 보기</router-link>
          </div>
        </div>
      </section>

      <!-- 푸터 -->
      <footer class="about-footer">
        <div class="footer-content">
          <div class="footer-info">
            <p class="footer-text">
              © 2025 교실 소통 문구. 교육의 디지털 혁신을 위해 개발되었습니다.
            </p>
            <p class="footer-tech">
              Made with ❤️ using Vue 3, TypeScript, and Supabase
            </p>
          </div>
          <div class="footer-links">
            <router-link to="/main" class="footer-link">메인으로</router-link>
            <router-link to="/components" class="footer-link">컴포넌트</router-link>
          </div>
        </div>
      </footer>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '../components/AppLayout.vue'
</script>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 페이지 헤더 */
.about-header {
  text-align: center;
  margin-bottom: 4rem;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  color: #1f2937;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.about-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #1f2937, #374151);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.about-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: #6b7280;
  line-height: 1.6;
}

.version-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.version-badge {
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.update-date {
  color: #6b7280;
  font-size: 0.875rem;
}

/* 섹션 공통 스타일 */
.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #1f2937;
  text-align: center;
}

/* 기능 섹션 */
.features-section {
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.feature-card.highlight {
  border: 2px solid #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-align: center;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f2937;
  text-align: center;
}

.feature-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #6b7280;
  margin-bottom: 1.5rem;
  text-align: center;
}

.feature-details {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-details li {
  padding: 0.5rem 0;
  color: #374151;
  line-height: 1.5;
  border-bottom: 1px solid #f3f4f6;
}

.feature-details li:last-child {
  border-bottom: none;
}

/* 기술 스택 섹션 */
.tech-section {
  margin-bottom: 4rem;
  background: #f8fafc;
  padding: 3rem 2rem;
  border-radius: 1rem;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.tech-category {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tech-category-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  padding: 0.375rem 0.75rem;
  background: #e5e7eb;
  color: #374151;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.tech-tag.vue {
  background: #dcfce7;
  color: #166534;
}

.tech-tag.supabase {
  background: #fef3c7;
  color: #92400e;
}

.tech-tag.gemini {
  background: #e0e7ff;
  color: #3730a3;
}

/* 업데이트 섹션 */
.updates-section {
  margin-bottom: 4rem;
}

.updates-timeline {
  max-width: 800px;
  margin: 0 auto;
}

.update-item {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3b82f6;
}

.update-date {
  flex-shrink: 0;
  width: 120px;
  font-weight: 600;
  color: #3b82f6;
  font-size: 0.875rem;
}

.update-content {
  flex: 1;
}

.update-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.update-details {
  list-style: none;
  padding: 0;
  margin: 0;
}

.update-details li {
  padding: 0.25rem 0;
  color: #6b7280;
  position: relative;
  padding-left: 1rem;
}

.update-details li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #3b82f6;
}

/* 가이드 섹션 */
.guide-section {
  margin-bottom: 4rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  padding: 3rem 2rem;
  border-radius: 1rem;
}

.guide-steps {
  max-width: 800px;
  margin: 0 auto;
}

.guide-step {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.step-number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
}

.step-content {
  flex: 1;
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.step-description {
  color: #6b7280;
  line-height: 1.6;
}

/* 연락처 섹션 */
.contact-section {
  margin-bottom: 4rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.contact-card {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.contact-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.contact-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.contact-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.contact-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.contact-link:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* 푸터 */
.about-footer {
  margin-top: 4rem;
  padding: 2rem 0;
  border-top: 1px solid #e5e7eb;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-info {
  flex: 1;
}

.footer-text {
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.footer-tech {
  color: #9ca3af;
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  gap: 1rem;
}

.footer-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #2563eb;
}

/* 반응형 */
@media (max-width: 768px) {
  .about-container {
    padding: 1rem 0.5rem;
  }

  .about-header {
    padding: 2rem 1rem;
    margin-bottom: 2rem;
  }

  .about-title {
    font-size: 2rem;
  }

  .about-subtitle {
    font-size: 1rem;
  }

  .features-grid,
  .tech-grid,
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .feature-card,
  .tech-category,
  .contact-card {
    padding: 1.5rem;
  }

  .update-item {
    flex-direction: column;
    gap: 1rem;
  }

  .update-date {
    width: auto;
  }

  .guide-step {
    flex-direction: column;
    gap: 1rem;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .version-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
