-- notices 테이블에서 사용하지 않는 컬럼 제거
-- is_recommended와 is_popular 컬럼 삭제

-- 1. is_recommended 컬럼 삭제
ALTER TABLE notices DROP COLUMN IF EXISTS is_recommended;

-- 2. is_popular 컬럼 삭제  
ALTER TABLE notices DROP COLUMN IF EXISTS is_popular;

-- 3. 변경사항 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notices' 
AND table_schema = 'public'
ORDER BY ordinal_position;