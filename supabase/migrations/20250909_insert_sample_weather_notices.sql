-- Insert sample weather notices
-- 샘플 날씨 문구 데이터 입력

-- 폭염 주의 문구 (바리에이션 1)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌡️ 폭염 주의',
  '기온이 높습니다. 충분한 수분을 섭취하고 그늘에서 휴식하세요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['물 자주 마시기', '그늘에서 휴식', '야외활동 자제', '시원한 곳 이용'],
  true,
  '{"temperature": {"min": 30}}',
  NOW()
);

-- 폭염 주의 문구 (바리에이션 2)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🔥 무더위 주의',
  '오늘은 매우 덥습니다! 열사병 예방을 위해 건강 관리에 신경써주세요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['냉수 준비하기', '모자 꼭 착용', '에어컨 적절히 사용', '얼음물 마시기'],
  true,
  '{"temperature": {"min": 30}}',
  NOW()
);

-- 폭염 주의 문구 (바리에이션 3)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '☀️ 찜통더위 경보',
  '기온이 급상승했어요. 시원하게 지내며 건강을 지켜주세요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['선풍기 활용하기', '가벼운 옷 입기', '염분 보충하기', '충분한 휴식'],
  true,
  '{"temperature": {"min": 30}}',
  NOW()
);

-- 우산 지참 문구 (바리에이션 1)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '☔ 우산 지참',
  '비 예보가 있습니다. 우산을 꼭 챙기세요.',
  ARRAY['안전', '생활지도'],
  '날씨 알림',
  ARRAY['우산 준비하기', '미끄러짐 주의', '천천히 걷기', '물웅덩이 피하기'],
  true,
  '{"condition": ["비", "이슬비"]}',
  NOW()
);

-- 우산 지참 문구 (바리에이션 2)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌧️ 비 소식',
  '오늘 비가 올 예정이에요. 비 준비 잊지 마세요!',
  ARRAY['안전', '생활지도'],
  '날씨 알림',
  ARRAY['우비 또는 우산', '방수 가방 준비', '신발 미끄럼 주의', '여분 양말 준비'],
  true,
  '{"condition": ["비", "이슬비"]}',
  NOW()
);

-- 우산 지참 문구 (바리에이션 3)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '💧 빗방울 알림',
  '구름이 잔뜩 끼었네요. 비 대비 하고 오세요.',
  ARRAY['안전', '생활지도'],
  '날씨 알림',
  ARRAY['접이식 우산 추천', '교복 보호하기', '안전하게 등교', '실내화 준비'],
  true,
  '{"condition": ["비", "이슬비"]}',
  NOW()
);

-- 한파 주의 문구 (바리에이션 1)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🧥 한파 주의',
  '기온이 낮습니다. 따뜻하게 입고 등교하세요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['따뜻한 옷 입기', '목도리 착용', '장갑 준비', '실내에서 따뜻하게'],
  true,
  '{"temperature": {"max": 5}}',
  NOW()
);

-- 한파 주의 문구 (바리에이션 2)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '❄️ 추위 경보',
  '매서운 추위가 예상됩니다. 보온에 각별히 신경써주세요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['두꺼운 외투 착용', '핫팩 준비하기', '따뜻한 음료 마시기', '감기 예방하기'],
  true,
  '{"temperature": {"max": 5}}',
  NOW()
);

-- 한파 주의 문구 (바리에이션 3)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌨️ 혹한 주의',
  '오늘은 정말 춥네요! 몸을 따뜻하게 유지해주세요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['레이어드 착용법', '귀마개 착용', '동상 예방하기', '실내 난방 적정 유지'],
  true,
  '{"temperature": {"max": 5}}',
  NOW()
);

-- 강풍 주의 문구 (바리에이션 1)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '💨 강풍 주의',
  '바람이 강합니다. 안전에 유의하세요.',
  ARRAY['안전'],
  '날씨 알림',
  ARRAY['물건 단단히 고정', '모자 끈 매기', '넘어지지 않게 주의', '야외활동 주의'],
  true,
  '{"windSpeed": {"min": 10}}',
  NOW()
);

-- 강풍 주의 문구 (바리에이션 2)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌪️ 돌풍 경고',
  '세찬 바람이 불고 있어요. 날아갈 수 있는 물건들을 잘 챙겨주세요.',
  ARRAY['안전'],
  '날씨 알림',
  ARRAY['가방 단단히 잡기', '우산 사용 주의', '간판 아래 피하기', '먼지 조심하기'],
  true,
  '{"windSpeed": {"min": 10}}',
  NOW()
);

-- 강풍 주의 문구 (바리에이션 3)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🍃 바람 주의보',
  '바람이 매우 거세요! 걸을 때 중심을 잘 잡고 다니세요.',
  ARRAY['안전'],
  '날씨 알림',
  ARRAY['바람막이 착용', '안전한 경로 이용', '건물 사이 조심', '눈에 이물질 주의'],
  true,
  '{"windSpeed": {"min": 10}}',
  NOW()
);

-- 습도 높음 주의 문구 (바리에이션 1)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '💧 습도 주의',
  '습도가 높습니다. 환기를 자주 해주세요.',
  ARRAY['건강', '생활지도'],
  '날씨 알림',
  ARRAY['교실 환기하기', '제습제 사용', '축축한 곳 피하기', '깔끔하게 정리'],
  true,
  '{"humidity": {"min": 80}}',
  NOW()
);

-- 습도 높음 주의 문구 (바리에이션 2)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '☁️ 습기 주의보',
  '공기가 눅눅해요. 곰팡이와 세균 번식을 막기 위해 환기가 중요해요!',
  ARRAY['건강', '생활지도'],
  '날씨 알림',
  ARRAY['선풍기 활용하기', '물기 제거하기', '옷 잘 말리기', '신발 건조시키기'],
  true,
  '{"humidity": {"min": 80}}',
  NOW()
);

-- 습도 높음 주의 문구 (바리에이션 3)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌊 후끈습기 경보',
  '습도가 매우 높아 불쾌감이 느껴질 수 있어요. 시원하게 지내세요.',
  ARRAY['건강', '생활지도'],
  '날씨 알림',
  ARRAY['에어컨 제습 모드', '통풍 잘되는 옷', '물 많이 마시기', '그늘에서 휴식'],
  true,
  '{"humidity": {"min": 80}}',
  NOW()
);

-- 미세먼지 주의 문구 (바리에이션 1)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '😷 미세먼지 주의',
  '미세먼지 농도가 높습니다. 마스크를 착용하고 야외활동을 자제하세요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['마스크 착용하기', '야외활동 자제', '실내 활동 권장', '창문 닫기'],
  true,
  '{"airQuality": "나쁨"}',
  NOW()
);

-- 미세먼지 주의 문구 (바리에이션 2)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌫️ 공기질 나쁨',
  '오늘 공기가 탁해요. 호흡기 건강을 위해 마스크 필수!',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['KF94 마스크 권장', '물 많이 마시기', '외출 후 세안', '공기청정기 가동'],
  true,
  '{"airQuality": "나쁨"}',
  NOW()
);

-- 미세먼지 주의 문구 (바리에이션 3)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '💨 스모그 경보',
  '미세먼지가 심각해요. 실내 활동을 늘리고 외출을 줄여주세요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['실내 운동 권장', '손 자주 씻기', '목 보호하기', '알레르기 주의'],
  true,
  '{"airQuality": "나쁨"}',
  NOW()
);

-- 폭우 주의 문구 (바리에이션 1)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌧️ 폭우 주의',
  '강한 비가 예상됩니다. 안전에 각별히 유의하세요.',
  ARRAY['안전', '생활지도'],
  '날씨 알림',
  ARRAY['우산과 우비 준비', '침수지역 피하기', '천천히 걷기', '하수구 주의'],
  true,
  '{"precipitation": {"min": 30}}',
  NOW()
);

-- 폭우 주의 문구 (바리에이션 2)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '⛈️ 집중호우 경보',
  '매우 많은 비가 내릴 예정이에요. 물이 차는 곳은 절대 피해주세요!',
  ARRAY['안전', '생활지도'],
  '날씨 알림',
  ARRAY['장화 착용 권장', '지하 공간 피하기', '급류 주의하기', '안전한 경로 이용'],
  true,
  '{"precipitation": {"min": 30}}',
  NOW()
);

-- 폭우 주의 문구 (바리에이션 3)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌊 물폭탄 주의',
  '강수량이 많아 도로가 위험할 수 있어요. 무리하지 말고 안전하게!',
  ARRAY['안전', '생활지도'],
  '날씨 알림',
  ARRAY['대중교통 이용', '맨홀 뚜껑 주의', '전기 감전 주의', '높은 곳으로 대피'],
  true,
  '{"precipitation": {"min": 30}}',
  NOW()
);

-- 눈 내림 문구 (바리에이션 1)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '❄️ 눈 주의보',
  '눈이 내립니다. 미끄러짐에 주의하고 따뜻하게 입어주세요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['미끄럼 방지 신발', '천천히 걸으며 등교', '보온 용품 착용', '빙판길 주의'],
  true,
  '{"condition": ["눈", "진눈깨비"]}',
  NOW()
);

-- 눈 내림 문구 (바리에이션 2)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '⛄ 설경 주의',
  '하얀 눈이 내리네요! 길이 미끄러우니 조심히 다녀요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['논슬립 신발 착용', '여유있게 출발', '눈사람 만들기 금지', '차도 피하기'],
  true,
  '{"condition": ["눈", "진눈깨비"]}',
  NOW()
);

-- 눈 내림 문구 (바리에이션 3)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌨️ 함박눈 알림',
  '눈이 펑펑 내려요. 안전하게 등교하고 감기 조심하세요!',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['방한용품 착용', '눈길 주의보행', '따뜻한 차 마시기', '실내 활동 권장'],
  true,
  '{"condition": ["눈", "진눈깨비"]}',
  NOW()
);

-- 건조 주의 문구
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🏜️ 건조 주의',
  '공기가 매우 건조합니다. 화재 예방과 건강 관리에 유의하세요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['수분 섭취 늘리기', '가습기 사용', '로션 발라주기', '화재 예방'],
  true,
  '{"humidity": {"max": 30}}',
  NOW()
);

-- 안개 주의 문구
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌫️ 안개 주의',
  '시야가 흐립니다. 등하교 시 안전에 특히 주의하세요.',
  ARRAY['안전', '생활지도'],
  '날씨 알림',
  ARRAY['밝은 색 옷 입기', '천천히 걷기', '차량 주의하기', '반사용품 착용'],
  true,
  '{"condition": ["안개", "박무"]}',
  NOW()
);

-- 자외선 강함 문구 (바리에이션 1)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '☀️ 자외선 주의',
  '자외선이 강합니다. 피부 보호에 신경써주세요.',
  ARRAY['건강', '생활지도'],
  '날씨 알림',
  ARRAY['자외선 차단제 바르기', '모자 착용하기', '긴팔 옷 입기', '그늘 이용하기'],
  true,
  '{"uvIndex": {"min": 8}}',
  NOW()
);

-- 자외선 강함 문구 (바리에이션 2)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🕶️ 햇빛 화상 주의',
  'UV 지수가 매우 높아요! 피부가 타지 않도록 보호해주세요.',
  ARRAY['건강', '생활지도'],
  '날씨 알림',
  ARRAY['선글라스 착용', 'SPF 30 이상 차단제', '2시간마다 재발라주기', '그늘막 활용'],
  true,
  '{"uvIndex": {"min": 8}}',
  NOW()
);

-- 자외선 강함 문구 (바리에이션 3)
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌞 햇볕 경보',
  '따가운 햇살이 내리쬐어요. 피부 건강을 위해 차단에 신경써주세요!',
  ARRAY['건강', '생활지도'],
  '날씨 알림',
  ARRAY['양산 사용하기', '목과 얼굴 보호', '수분 크림 발라주기', '10-16시 야외활동 자제'],
  true,
  '{"uvIndex": {"min": 8}}',
  NOW()
);

-- 황사 주의 문구
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌪️ 황사 주의',
  '황사가 예상됩니다. 마스크 착용과 실내 활동을 권장합니다.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['마스크 필수 착용', '창문 밀폐하기', '야외활동 금지', '손 자주 씻기'],
  true,
  '{"condition": ["황사"]}',
  NOW()
);

-- 열대야 주의 문구
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌙 열대야 주의',
  '밤 기온이 높아 잠들기 어려울 수 있습니다. 충분한 휴식을 취하세요.',
  ARRAY['건강', '생활지도'],
  '날씨 알림',
  ARRAY['충분한 수면 취하기', '시원한 잠자리', '수분 보충', '가벼운 옷 입기'],
  true,
  '{"nightTemperature": {"min": 25}}',
  NOW()
);

-- 우박 주의 문구
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🧊 우박 주의',
  '우박이 내릴 가능성이 있습니다. 안전한 곳으로 대피하세요.',
  ARRAY['안전'],
  '날씨 알림',
  ARRAY['실내로 대피하기', '차량 주차 주의', '머리 보호하기', '유리창 피하기'],
  true,
  '{"condition": ["우박"]}',
  NOW()
);

-- 봄철 꽃가루 주의 문구
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌸 꽃가루 주의',
  '꽃가루가 많이 날립니다. 알레르기가 있는 학생들은 주의하세요.',
  ARRAY['건강', '생활지도'],
  '날씨 알림',
  ARRAY['마스크 착용하기', '창문 닫기', '안약 준비', '외출 후 세안하기'],
  true,
  '{"season": "봄", "pollenLevel": "높음"}',
  NOW()
);

-- 태풍 예비 문구
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌀 태풍 대비',
  '태풍이 접근하고 있습니다. 안전 대비를 철저히 하세요.',
  ARRAY['안전', '긴급'],
  '날씨 알림',
  ARRAY['창문 고정하기', '실외 물건 정리', '응급용품 준비', '기상정보 확인'],
  true,
  '{"condition": ["태풍"], "windSpeed": {"min": 25}}',
  NOW()
);

-- 일교차 큰 날 문구
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌡️ 일교차 주의',
  '낮과 밤의 기온차가 큽니다. 체온 조절에 신경써주세요.',
  ARRAY['건강', '생활지도'],
  '날씨 알림',
  ARRAY['겉옷 준비하기', '감기 예방하기', '체온 조절하기', '수분 섭취'],
  true,
  '{"temperatureDifference": {"min": 15}}',
  NOW()
);

-- 서리 주의 문구
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🧊 서리 주의',
  '새벽에 서리가 내릴 예정입니다. 미끄러짐과 추위에 주의하세요.',
  ARRAY['안전', '건강'],
  '날씨 알림',
  ARRAY['따뜻하게 입기', '미끄럼 주의', '일찍 등교하기', '보온용품 착용'],
  true,
  '{"condition": ["서리"], "temperature": {"max": 3}}',
  NOW()
);

-- 기압 변화 문구
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '📊 기압 변화',
  '기압 변화가 큽니다. 몸이 아픈 학생들은 더욱 조심하세요.',
  ARRAY['건강'],
  '날씨 알림',
  ARRAY['충분한 휴식', '수분 섭취', '무리하지 않기', '보건실 이용'],
  true,
  '{"pressureChange": "급변"}',
  NOW()
);

-- 맑은 날씨 문구 (바리에이션 1) - 테스트용
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '☀️ 좋은 날씨',
  '오늘은 맑고 쾌적한 날씨입니다! 기분 좋게 하루를 시작하세요.',
  ARRAY['생활지도'],
  '날씨 알림',
  ARRAY['실외 활동 권장', '산책하기 좋은 날', '환기하기', '비타민D 합성'],
  true,
  '{"condition": ["맑음"], "temperature": {"min": 20, "max": 30}}',
  NOW()
);

-- 맑은 날씨 문구 (바리에이션 2) - 테스트용
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌞 화창한 하루',
  '푸른 하늘이 아름다운 날이에요. 야외 활동하기 좋은 날씨입니다!',
  ARRAY['생활지도'],
  '날씨 알림',
  ARRAY['체육 활동 권장', '신선한 공기 마시기', '밝은 기분으로', '햇볕 쬐기'],
  true,
  '{"condition": ["맑음"], "temperature": {"min": 20, "max": 30}}',
  NOW()
);

-- 맑은 날씨 문구 (바리에이션 3) - 테스트용
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌤️ 완벽한 날씨',
  '구름 한 점 없는 맑은 하늘! 오늘은 모든 일이 잘 될 것 같아요.',
  ARRAY['생활지도'],
  '날씨 알림',
  ARRAY['긍정적인 마음가짐', '활기찬 하루', '야외 수업 추천', '자연 관찰'],
  true,
  '{"condition": ["맑음"], "temperature": {"min": 20, "max": 30}}',
  NOW()
);

-- 적당한 기온 문구 (바리에이션 1) - 테스트용
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌡️ 쾌적한 기온',
  '기온이 적당해서 활동하기 좋습니다. 편안한 옷차림으로 등교하세요.',
  ARRAY['생활지도'],
  '날씨 알림',
  ARRAY['가벼운 옷차림', '체온 조절 용이', '활동량 늘리기', '건강한 하루'],
  true,
  '{"temperature": {"min": 20, "max": 28}}',
  NOW()
);

-- 적당한 기온 문구 (바리에이션 2) - 테스트용
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌿 상쾌한 기온',
  '너무 덥지도 춥지도 않은 딱 좋은 온도예요! 몸과 마음이 상쾌합니다.',
  ARRAY['생활지도', '건강'],
  '날씨 알림',
  ARRAY['깊게 숨쉬기', '스트레스 해소', '집중력 향상', '에너지 충전'],
  true,
  '{"temperature": {"min": 20, "max": 28}}',
  NOW()
);

-- 보통 습도 문구 (바리에이션 1) - 테스트용
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '💨 쾌적한 습도',
  '습도가 적당해서 숨쉬기 편안합니다. 컨디션 관리하기 좋은 날이에요.',
  ARRAY['건강'],
  '날씨 알림',
  ARRAY['수분 적당히 섭취', '피부 관리 좋음', '호흡기 편안', '쾌적한 환경'],
  true,
  '{"humidity": {"min": 40, "max": 70}}',
  NOW()
);

-- 잔잔한 바람 문구 (바리에이션 1) - 테스트용
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🍃 살랑바람',
  '살랑살랑 부는 바람이 시원해요. 자연의 에어컨을 만끽하세요!',
  ARRAY['생활지도'],
  '날씨 알림',
  ARRAY['창문 열어두기', '자연 바람 즐기기', '시원함 만끽', '상쾌한 기분'],
  true,
  '{"windSpeed": {"min": 0, "max": 3}}',
  NOW()
);

-- 전체적으로 좋은 날씨 종합 문구 (바리에이션 1) - 테스트용
INSERT INTO notices (
  id, title, content, tags, author, sub_items, is_weather_notice, weather_conditions, created_at
) VALUES (
  gen_random_uuid(),
  '🌈 완벽한 날씨',
  '기온, 습도, 바람 모든 것이 완벽한 날이에요! 최고의 하루가 될 것 같습니다.',
  ARRAY['생활지도', '건강'],
  '날씨 알림',
  ARRAY['야외 활동 적극 권장', '깊은 호흡하기', '자연과 함께', '행복한 마음'],
  true,
  '{"condition": ["맑음"], "temperature": {"min": 20, "max": 30}, "humidity": {"min": 40, "max": 70}, "windSpeed": {"max": 5}}',
  NOW()
);
