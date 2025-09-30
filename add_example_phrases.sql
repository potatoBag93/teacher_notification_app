-- 알림장 문구 예시 데이터 (메인/서브카테고리 포함, Notice 타입과 동기화)
-- 테이블 구조 예시
CREATE TABLE IF NOT EXISTS notices (
  id VARCHAR(32) PRIMARY KEY,
  content VARCHAR(128),
  tags TEXT,           -- 카테고리 배열 (CSV)
  subTags TEXT,        -- 서브태그 배열 (CSV)
  author VARCHAR(64),
  likeCount INTEGER,
  createdAt DATETIME,
  usageCount INTEGER,
  isReported BOOLEAN DEFAULT FALSE
);

-- 경고/예방 중심 예시 데이터 (Notice 타입 기반)
INSERT INTO notices (id, content, tags, subTags, author, likeCount, createdAt, usageCount, isReported) VALUES
('n-1', '창문에 기대어 앉지 않습니다', '안전보건', '안전주의', '관리자', 0, datetime('now','-1 day'), 0, FALSE),
('n-2', '교실에서 뛰지 않습니다', '생활지도', '규칙위반', '관리자', 0, datetime('now','-2 day'), 0, FALSE),
('n-3', '재채기를 할 땐 사람이 없는 곳으로 향하여 입을 가리고 합니다', '안전보건', '개인위생', '관리자', 0, datetime('now','-3 day'), 0, FALSE),
('n-4', '휴대폰은 수업 시간에 사용하지 않습니다', '학습관리', '전자기기', '관리자', 0, datetime('now','-4 day'), 0, FALSE),
('n-5', '쓰레기는 반드시 분리수거함에 버립니다', '환경정보', '분리수거', '관리자', 0, datetime('now','-5 day'), 0, FALSE);