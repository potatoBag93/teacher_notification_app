-- Add weather notice columns to notices table
-- 날씨 문구 관련 컬럼 추가

-- 날씨 문구 여부를 나타내는 컬럼
ALTER TABLE notices ADD COLUMN is_weather_notice BOOLEAN DEFAULT false;

-- 날씨 조건을 저장하는 JSONB 컬럼
ALTER TABLE notices ADD COLUMN weather_conditions JSONB;

-- 성능 최적화를 위한 인덱스 추가
CREATE INDEX idx_notices_weather_notice ON notices(is_weather_notice);

-- 날씨 조건에 대한 GIN 인덱스 (JSONB 검색 최적화)
CREATE INDEX idx_notices_weather_conditions ON notices USING GIN (weather_conditions);

-- 기존 데이터에 대한 기본값 설정 (모든 기존 문구는 일반 문구로 설정)
UPDATE notices SET is_weather_notice = false WHERE is_weather_notice IS NULL;
