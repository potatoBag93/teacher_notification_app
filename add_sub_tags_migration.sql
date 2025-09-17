-- =====================================================
-- Add sub_tags column to notices table
-- =====================================================

-- 1. notices 테이블에 sub_tags 컬럼 추가
ALTER TABLE notices 
ADD COLUMN sub_tags TEXT[];

-- 2. sub_tags 컬럼에 대한 코멘트 추가
COMMENT ON COLUMN notices.sub_tags IS '세부 태그 (카테고리별 세분화된 분류)';

-- 3. 기존 데이터에 샘플 sub_tags 추가 (선택사항)
-- 안전 관련 문구들에 세부 태그 추가
UPDATE notices 
SET sub_tags = ARRAY['교통안전', '등하교'] 
WHERE title LIKE '%교통%' OR title LIKE '%등교%' OR title LIKE '%하교%';

UPDATE notices 
SET sub_tags = ARRAY['빗길안전', '우산'] 
WHERE title LIKE '%비%' OR title LIKE '%우산%' OR content LIKE '%비%';

UPDATE notices 
SET sub_tags = ARRAY['폭염대비', '수분섭취'] 
WHERE title LIKE '%폭염%' OR title LIKE '%더위%' OR content LIKE '%더위%';

UPDATE notices 
SET sub_tags = ARRAY['한파대비', '체온조절'] 
WHERE title LIKE '%추위%' OR title LIKE '%한파%' OR content LIKE '%추위%';

-- 학습 관련 문구들에 세부 태그 추가
UPDATE notices 
SET sub_tags = ARRAY['숙제안내'] 
WHERE title LIKE '%숙제%' OR content LIKE '%숙제%';

UPDATE notices 
SET sub_tags = ARRAY['준비물'] 
WHERE title LIKE '%준비%' OR content LIKE '%준비%';

-- 건강 관련 문구들에 세부 태그 추가
UPDATE notices 
SET sub_tags = ARRAY['감기예방', '환기'] 
WHERE title LIKE '%감기%' OR content LIKE '%감기%';

UPDATE notices 
SET sub_tags = ARRAY['영양관리', '급식'] 
WHERE title LIKE '%영양%' OR title LIKE '%급식%' OR content LIKE '%영양%';

-- 4. 날씨 문구들에 특별히 세부 태그 추가
UPDATE notices 
SET sub_tags = CASE 
  WHEN title LIKE '%비%' OR content LIKE '%비%' THEN ARRAY['빗길안전', '우산', '미끄러짐주의']
  WHEN title LIKE '%더위%' OR title LIKE '%폭염%' THEN ARRAY['폭염대비', '수분섭취', '그늘휴식']
  WHEN title LIKE '%추위%' OR title LIKE '%한파%' THEN ARRAY['한파대비', '체온조절', '두꺼운옷']
  WHEN title LIKE '%바람%' OR title LIKE '%강풍%' THEN ARRAY['강풍대비', '안전보행']
  WHEN title LIKE '%눈%' THEN ARRAY['눈길안전', '미끄럼방지']
  ELSE sub_tags
END
WHERE is_weather_notice = true;

-- 5. 인덱스 생성 (선택사항 - 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_notices_sub_tags ON notices USING GIN (sub_tags);

-- 6. 확인 쿼리
SELECT 
  title, 
  tags, 
  sub_tags, 
  is_weather_notice
FROM notices 
WHERE sub_tags IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;

-- 실행 완료 메시지
SELECT 'sub_tags 컬럼 추가 및 데이터 마이그레이션 완료!' as status;
