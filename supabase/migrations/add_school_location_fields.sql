-- 학교 위치 정보 필드 추가
-- 2024년 9월 8일

-- 학교 위치 정보 컬럼 추가
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS school_lat decimal(10, 8),  -- 학교 위도
ADD COLUMN IF NOT EXISTS school_lng decimal(11, 8);  -- 학교 경도
