
<template>
  <div class="legal-container">
    <div class="legal-card">
      <h1 class="legal-title">개인정보 처리방침</h1>
      <div class="legal-content">
        <h2 class="legal-section-title">🔒 알뭐 개인정보 처리방침 </h2>
        <section>
          <h3>제1조 (수집하는 개인정보 항목)</h3>
          <ul>
            <li>구글 로그인 시: 이메일, 이름</li>
            <li>회원 입력: 학교명 (위도·경도 변환에 활용)</li>
          </ul>
        </section>
        <section>
          <h3>제2조 (개인정보의 수집 및 이용 목적)</h3>
          <ul>
            <li>맞춤형 알림장 제공</li>
            <li>계정 생성 및 관리</li>
          </ul>
        </section>
        <section>
          <h3>제3조 (개인정보 보관 및 이용 기간)</h3>
          <p>회원 탈퇴 시 수집된 개인정보는 즉시 파기합니다. 단, 법령에 따라 일정 기간 보관이 필요한 경우 해당 법령을 따릅니다.</p>
        </section>
        <section>
          <h3>제4조 (개인정보의 파기 방법)</h3>
          <ul>
            <li>전자적 파일 형태: 복구할 수 없는 기술적 방법으로 삭제합니다.</li>
            <li>문서 형태: 분쇄 또는 소각하여 파기합니다.</li>
          </ul>
        </section>
        <section>
          <h3>제5조 (개인정보 처리의 위탁)</h3>
          <p>운영자는 알뭐의 안정적 제공을 위해 클라우드 호스팅 업체(Supabase, Firebase 등)에 일부 개인정보 처리를 위탁합니다.</p>
        </section>
        <section>
          <h3>제6조 (개인정보의 국외 이전)</h3>
          <p>Supabase, Firebase 등 클라우드 서비스는 국외 서버를 이용할 수 있으며, 이 과정에서 개인정보가 국외로 이전될 수 있습니다. 운영자는 관련 법령에 따른 보호조치를 이행합니다.</p>
        </section>
        <section>
          <h3>제7조 (개인정보의 제3자 제공)</h3>
          <p>운영자는 이용자의 동의 없이는 개인정보를 제3자에게 제공하지 않습니다.</p>
        </section>
        <section>
          <h3>제8조 (이용자의 권리)</h3>
          <p>이용자는 언제든지 자신의 개인정보 열람, 수정, 삭제를 요청할 수 있습니다.</p>
        </section>
        <section>
          <h3>제9조 (개인정보 보호 책임자)</h3>
          <p>알뭐는 개인정보 보호 책임자를 다음과 같이 지정합니다.</p>
          <ul>
            <li>책임자 이메일: <a href="mailto:potatobag93@gmail.com">potatobag93@gmail.com</a></li>
          </ul>
        </section>
        <section>
          <h3>제10조 (쿠키 및 로그 데이터의 수집·이용)</h3>
          <p>알뭐는 로그인 유지 목적의 세션 쿠키를 사용합니다. 별도의 마케팅·추적 쿠키는 사용하지 않습니다.</p>
        </section>
        <section>
          <h3>제11조 (정책 변경 고지)</h3>
          <p>본 방침이 변경되는 경우 웹사이트 공지사항을 통해 공지하며, 중요한 변경 시 회원에게 개별 통지합니다.</p>
        </section>
        <section>
          <h3>제12조 (문의처)</h3>
          <p>이용자는 개인정보 보호와 관련된 문의를 언제든지 다음 이메일로 접수할 수 있습니다.</p>
          <ul>
            <li>이메일: <a href="mailto:potatobag93@gmail.com">potatobag93@gmail.com</a></li>
          </ul>
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
