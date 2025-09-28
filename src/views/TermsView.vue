<template>
  <div class="legal-container">
    <div class="legal-card">
      <h1 class="legal-title">서비스 이용약관</h1>
      <div class="legal-content">
        <h2 class="legal-section-title">📑 알뭐 서비스 이용약관</h2>
        <section>
          <h3>제1조 (목적)</h3>
          <p>본 약관은 “알뭐”(이하 “서비스”)가 제공하는 맞춤형 알림장 서비스의 이용 조건 및 절차, 운영자의 권리·의무와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </section>
        <section>
          <h3>제2조 (정의)</h3>
          <ul>
            <li>“회원”이라 함은 본 서비스에 접속하여 본 약관에 따라 서비스 이용계약을 체결하고 서비스를 이용하는 자를 말합니다.</li>
            <li>“운영자”라 함은 서비스를 관리·운영하는 주체를 말합니다.</li>
          </ul>
        </section>
        <section>
          <h3>제3조 (약관의 효력 및 변경)</h3>
          <ul>
            <li>본 약관은 서비스 화면에 게시하거나 기타 방법으로 공지함으로써 효력이 발생합니다.</li>
            <li>운영자는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정 시 사전 공지합니다.</li>
          </ul>
        </section>
        <section>
          <h3>제4조 (서비스의 제공 및 변경)</h3>
          <ul>
            <li>본 서비스는 구글 로그인 기반 알림장 추천, 학교 위치 기반 맞춤형 알림장 제공, 알림장 문구 추천 기능을 제공합니다.</li>
            <li>운영자는 기술적 사양 변경 등의 이유로 서비스 내용을 변경할 수 있으며, 이 경우 사전 공지합니다.</li>
          </ul>
        </section>
        <section>
          <h3>제5조 (서비스의 중단)</h3>
          <p>운영자는 정기 점검, 시스템 교체, 천재지변, 통신 장애 등 불가피한 사유가 있을 때 서비스 제공을 일시 중단할 수 있습니다.</p>
        </section>
        <section>
          <h3>제6조 (회원의 의무)</h3>
          <ul>
            <li>타인의 계정을 도용하는 행위</li>
            <li>불법적으로 데이터를 수집·복제·배포하는 행위</li>
            <li>상업적 목적으로 서비스를 이용하는 행위</li>
          </ul>
        </section>
        <section>
          <h3>제7조 (지적재산권)</h3>
          <p>서비스에서 제공되는 콘텐츠 및 데이터의 저작권은 운영자에게 있으며, 회원은 사전 허락 없이 이를 복제, 배포, 전송할 수 없습니다.</p>
        </section>
        <section>
          <h3>제8조 (운영자의 면책)</h3>
          <ul>
            <li>천재지변, 서버 장애 등 불가항력적 사유</li>
            <li>구글 OAuth 및 외부 서비스의 장애</li>
            <li>회원의 고의 또는 과실로 발생한 손해</li>
          </ul>
        </section>
        <section>
          <h3>제9조 (관할 법원)</h3>
          <p>본 서비스와 관련하여 분쟁이 발생한 경우, 관할 법원은 서울중앙지방법원으로 합니다.</p>
        </section>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>

<style scoped>
.legal-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 24px;
}
.legal-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  max-width: 600px;
  width: 100%;
  padding: 2.5rem 2rem;
}
.legal-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: -0.5px;
}
.legal-content {
  color: #374151;
  font-size: 1.05rem;
  line-height: 1.7;
  word-break: keep-all;
}
.legal-section-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1d4ed8;
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: -0.5px;
}
.legal-content section {
  margin-bottom: 2rem;
}
.legal-content h3 {
  font-size: 1.08rem;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 0.5rem;
  margin-top: 0;
}
.legal-content ul {
  margin: 0 0 0.5rem 1.2rem;
  padding: 0;
  list-style: disc inside;
}
.legal-content li {
  margin-bottom: 0.2rem;
}
@media (max-width: 700px) {
  .legal-card {
    padding: 1.2rem 0.5rem;
    max-width: 98vw;
  }
  .legal-title {
    font-size: 1.3rem;
  }
  .legal-section-title {
    font-size: 1rem;
  }

}
</style>
