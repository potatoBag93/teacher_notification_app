import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodeRequest {
  address: string;
}

interface LocationResponse {
  address: string;
  latitude: number;
  longitude: number;
  gridX: number;
  gridY: number;
}

// 한국 주요 지역별 기상청 격자좌표 매핑 테이블
const KOREA_GRID_MAP = {
  // 광역시/도 메인
  '서울특별시': { nx: 60, ny: 127, lat: 37.5665, lng: 126.9780 },
  '서울': { nx: 60, ny: 127, lat: 37.5665, lng: 126.9780 },
  '부산광역시': { nx: 98, ny: 76, lat: 35.1796, lng: 129.0756 },
  '부산': { nx: 98, ny: 76, lat: 35.1796, lng: 129.0756 },
  '대구광역시': { nx: 89, ny: 90, lat: 35.8714, lng: 128.6014 },
  '대구': { nx: 89, ny: 90, lat: 35.8714, lng: 128.6014 },
  '인천광역시': { nx: 55, ny: 124, lat: 37.4563, lng: 126.7052 },
  '인천': { nx: 55, ny: 124, lat: 37.4563, lng: 126.7052 },
  '광주광역시': { nx: 58, ny: 74, lat: 35.1595, lng: 126.8526 },
  '광주': { nx: 58, ny: 74, lat: 35.1595, lng: 126.8526 },
  '대전광역시': { nx: 67, ny: 100, lat: 36.3504, lng: 127.3845 },
  '대전': { nx: 67, ny: 100, lat: 36.3504, lng: 127.3845 },
  '울산광역시': { nx: 102, ny: 84, lat: 35.5384, lng: 129.3114 },
  '울산': { nx: 102, ny: 84, lat: 35.5384, lng: 129.3114 },
  '세종특별자치시': { nx: 66, ny: 103, lat: 36.4801, lng: 127.2890 },
  '세종': { nx: 66, ny: 103, lat: 36.4801, lng: 127.2890 },

  // 경기도
  '경기도': { nx: 60, ny: 120, lat: 37.4138, lng: 127.5183 },
  '경기': { nx: 60, ny: 120, lat: 37.4138, lng: 127.5183 },
  '수원시': { nx: 60, ny: 121, lat: 37.2636, lng: 127.0286 },
  '수원': { nx: 60, ny: 121, lat: 37.2636, lng: 127.0286 },
  '성남시': { nx: 63, ny: 124, lat: 37.4386, lng: 127.1378 },
  '성남': { nx: 63, ny: 124, lat: 37.4386, lng: 127.1378 },
  '용인시': { nx: 64, ny: 119, lat: 37.2342, lng: 127.2106 },
  '용인': { nx: 64, ny: 119, lat: 37.2342, lng: 127.2106 },
  '안양시': { nx: 59, ny: 123, lat: 37.3943, lng: 126.9568 },
  '안양': { nx: 59, ny: 123, lat: 37.3943, lng: 126.9568 },
  '안산시': { nx: 58, ny: 121, lat: 37.3218, lng: 126.8309 },
  '안산': { nx: 58, ny: 121, lat: 37.3218, lng: 126.8309 },
  '고양시': { nx: 57, ny: 128, lat: 37.6584, lng: 126.8320 },
  '고양': { nx: 57, ny: 128, lat: 37.6584, lng: 126.8320 },
  '과천시': { nx: 60, ny: 124, lat: 37.4292, lng: 126.9876 },
  '과천': { nx: 60, ny: 124, lat: 37.4292, lng: 126.9876 },
  '구리시': { nx: 62, ny: 127, lat: 37.5943, lng: 127.1296 },
  '구리': { nx: 62, ny: 127, lat: 37.5943, lng: 127.1296 },
  '남양주시': { nx: 64, ny: 128, lat: 37.6360, lng: 127.2164 },
  '남양주': { nx: 64, ny: 128, lat: 37.6360, lng: 127.2164 },
  '부천시': { nx: 56, ny: 125, lat: 37.5036, lng: 126.7660 },
  '부천': { nx: 56, ny: 125, lat: 37.5036, lng: 126.7660 },
  '시흥시': { nx: 57, ny: 123, lat: 37.3800, lng: 126.8031 },
  '시흥': { nx: 57, ny: 123, lat: 37.3800, lng: 126.8031 },
  '군포시': { nx: 59, ny: 122, lat: 37.3617, lng: 126.9353 },
  '군포': { nx: 59, ny: 122, lat: 37.3617, lng: 126.9353 },
  '의왕시': { nx: 60, ny: 122, lat: 37.3447, lng: 126.9684 },
  '의왕': { nx: 60, ny: 122, lat: 37.3447, lng: 126.9684 },
  '하남시': { nx: 64, ny: 126, lat: 37.5389, lng: 127.2145 },
  '하남': { nx: 64, ny: 126, lat: 37.5389, lng: 127.2145 },
  '오산시': { nx: 62, ny: 118, lat: 37.1573, lng: 127.0776 },
  '오산': { nx: 62, ny: 118, lat: 37.1573, lng: 127.0776 },
  '이천시': { nx: 68, ny: 121, lat: 37.2723, lng: 127.4348 },
  '이천': { nx: 68, ny: 121, lat: 37.2723, lng: 127.4348 },
  '안성시': { nx: 65, ny: 115, lat: 37.0078, lng: 127.2698 },
  '안성': { nx: 65, ny: 115, lat: 37.0078, lng: 127.2698 },
  '김포시': { nx: 56, ny: 128, lat: 37.6153, lng: 126.7159 },
  '김포': { nx: 56, ny: 128, lat: 37.6153, lng: 126.7159 },
  '화성시': { nx: 57, ny: 119, lat: 37.1995, lng: 126.8317 },
  '화성': { nx: 57, ny: 119, lat: 37.1995, lng: 126.8317 },
  '광주시': { nx: 65, ny: 123, lat: 37.4197, lng: 127.2551 },
  '양주시': { nx: 61, ny: 131, lat: 37.7854, lng: 127.0453 },
  '양주': { nx: 61, ny: 131, lat: 37.7854, lng: 127.0453 },
  '포천시': { nx: 64, ny: 134, lat: 37.8951, lng: 127.2006 },
  '포천': { nx: 64, ny: 134, lat: 37.8951, lng: 127.2006 },
  '여주시': { nx: 71, ny: 121, lat: 37.2984, lng: 127.6377 },
  '여주': { nx: 71, ny: 121, lat: 37.2984, lng: 127.6377 },
  '파주시': { nx: 56, ny: 131, lat: 37.7608, lng: 126.7800 },
  '파주': { nx: 56, ny: 131, lat: 37.7608, lng: 126.7800 },
  '평택시': { nx: 62, ny: 114, lat: 36.9921, lng: 127.1127 },
  '평택': { nx: 62, ny: 114, lat: 36.9921, lng: 127.1127 },

  // 강원도
  '강원도': { nx: 73, ny: 134, lat: 37.8228, lng: 128.1555 },
  '강원': { nx: 73, ny: 134, lat: 37.8228, lng: 128.1555 },
  '춘천시': { nx: 73, ny: 134, lat: 37.8813, lng: 127.7298 },
  '춘천': { nx: 73, ny: 134, lat: 37.8813, lng: 127.7298 },
  '원주시': { nx: 76, ny: 122, lat: 37.3422, lng: 127.9202 },
  '원주': { nx: 76, ny: 122, lat: 37.3422, lng: 127.9202 },
  '강릉시': { nx: 92, ny: 131, lat: 37.7519, lng: 128.8761 },
  '강릉': { nx: 92, ny: 131, lat: 37.7519, lng: 128.8761 },
  '동해시': { nx: 97, ny: 127, lat: 37.5247, lng: 129.1143 },
  '동해': { nx: 97, ny: 127, lat: 37.5247, lng: 129.1143 },
  '태백시': { nx: 95, ny: 119, lat: 37.1640, lng: 128.9856 },
  '태백': { nx: 95, ny: 119, lat: 37.1640, lng: 128.9856 },
  '속초시': { nx: 87, ny: 141, lat: 38.2072, lng: 128.5918 },
  '속초': { nx: 87, ny: 141, lat: 38.2072, lng: 128.5918 },
  '삼척시': { nx: 98, ny: 125, lat: 37.4498, lng: 129.1656 },
  '삼척': { nx: 98, ny: 125, lat: 37.4498, lng: 129.1656 },

  // 충청북도
  '충청북도': { nx: 69, ny: 107, lat: 36.6356, lng: 127.4917 },
  '충북': { nx: 69, ny: 107, lat: 36.6356, lng: 127.4917 },
  '청주시': { nx: 69, ny: 106, lat: 36.6424, lng: 127.4890 },
  '청주': { nx: 69, ny: 106, lat: 36.6424, lng: 127.4890 },
  '충주시': { nx: 76, ny: 114, lat: 36.9910, lng: 127.9259 },
  '충주': { nx: 76, ny: 114, lat: 36.9910, lng: 127.9259 },
  '제천시': { nx: 81, ny: 118, lat: 37.1326, lng: 128.1907 },
  '제천': { nx: 81, ny: 118, lat: 37.1326, lng: 128.1907 },

  // 충청남도
  '충청남도': { nx: 68, ny: 100, lat: 36.5184, lng: 126.8000 },
  '충남': { nx: 68, ny: 100, lat: 36.5184, lng: 126.8000 },
  '천안시': { nx: 63, ny: 110, lat: 36.8151, lng: 127.1139 },
  '천안': { nx: 63, ny: 110, lat: 36.8151, lng: 127.1139 },
  '공주시': { nx: 60, ny: 103, lat: 36.4465, lng: 127.1189 },
  '공주': { nx: 60, ny: 103, lat: 36.4465, lng: 127.1189 },
  '보령시': { nx: 54, ny: 100, lat: 36.3331, lng: 126.6127 },
  '보령': { nx: 54, ny: 100, lat: 36.3331, lng: 126.6127 },
  '아산시': { nx: 60, ny: 109, lat: 36.7898, lng: 127.0018 },
  '아산': { nx: 60, ny: 109, lat: 36.7898, lng: 127.0018 },
  '서산시': { nx: 51, ny: 110, lat: 36.7848, lng: 126.4504 },
  '서산': { nx: 51, ny: 110, lat: 36.7848, lng: 126.4504 },
  '논산시': { nx: 62, ny: 97, lat: 36.1872, lng: 127.0989 },
  '논산': { nx: 62, ny: 97, lat: 36.1872, lng: 127.0989 },
  '계룡시': { nx: 65, ny: 99, lat: 36.2745, lng: 127.2487 },
  '계룡': { nx: 65, ny: 99, lat: 36.2745, lng: 127.2487 },
  '당진시': { nx: 54, ny: 112, lat: 36.8930, lng: 126.6275 },
  '당진': { nx: 54, ny: 112, lat: 36.8930, lng: 126.6275 },

  // 전라북도
  '전라북도': { nx: 63, ny: 89, lat: 35.7175, lng: 127.1530 },
  '전북': { nx: 63, ny: 89, lat: 35.7175, lng: 127.1530 },
  '전주시': { nx: 63, ny: 89, lat: 35.8242, lng: 127.1480 },
  '전주': { nx: 63, ny: 89, lat: 35.8242, lng: 127.1480 },
  '군산시': { nx: 56, ny: 92, lat: 35.9677, lng: 126.7369 },
  '군산': { nx: 56, ny: 92, lat: 35.9677, lng: 126.7369 },
  '익산시': { nx: 60, ny: 91, lat: 35.9483, lng: 126.9575 },
  '익산': { nx: 60, ny: 91, lat: 35.9483, lng: 126.9575 },
  '정읍시': { nx: 58, ny: 83, lat: 35.5699, lng: 126.8560 },
  '정읍': { nx: 58, ny: 83, lat: 35.5699, lng: 126.8560 },
  '남원시': { nx: 68, ny: 80, lat: 35.4163, lng: 127.3906 },
  '남원': { nx: 68, ny: 80, lat: 35.4163, lng: 127.3906 },
  '김제시': { nx: 59, ny: 88, lat: 35.8037, lng: 126.8804 },
  '김제': { nx: 59, ny: 88, lat: 35.8037, lng: 126.8804 },

  // 전라남도
  '전라남도': { nx: 51, ny: 67, lat: 34.8679, lng: 126.9910 },
  '전남': { nx: 51, ny: 67, lat: 34.8679, lng: 126.9910 },
  '목포시': { nx: 50, ny: 67, lat: 34.8118, lng: 126.3922 },
  '목포': { nx: 50, ny: 67, lat: 34.8118, lng: 126.3922 },
  '여수시': { nx: 73, ny: 66, lat: 34.7604, lng: 127.6622 },
  '여수': { nx: 73, ny: 66, lat: 34.7604, lng: 127.6622 },
  '순천시': { nx: 70, ny: 70, lat: 34.9506, lng: 127.4872 },
  '순천': { nx: 70, ny: 70, lat: 34.9506, lng: 127.4872 },
  '나주시': { nx: 56, ny: 71, lat: 35.0160, lng: 126.7107 },
  '나주': { nx: 56, ny: 71, lat: 35.0160, lng: 126.7107 },
  '광양시': { nx: 73, ny: 70, lat: 34.9407, lng: 127.5956 },
  '광양': { nx: 73, ny: 70, lat: 34.9407, lng: 127.5956 },

  // 경상북도
  '경상북도': { nx: 87, ny: 106, lat: 36.4919, lng: 128.8889 },
  '경북': { nx: 87, ny: 106, lat: 36.4919, lng: 128.8889 },
  '포항시': { nx: 102, ny: 94, lat: 36.0190, lng: 129.3435 },
  '포항': { nx: 102, ny: 94, lat: 36.0190, lng: 129.3435 },
  '경주시': { nx: 100, ny: 91, lat: 35.8562, lng: 129.2247 },
  '경주': { nx: 100, ny: 91, lat: 35.8562, lng: 129.2247 },
  '김천시': { nx: 80, ny: 96, lat: 36.1399, lng: 128.1137 },
  '김천': { nx: 80, ny: 96, lat: 36.1399, lng: 128.1137 },
  '안동시': { nx: 91, ny: 106, lat: 36.5684, lng: 128.7294 },
  '안동': { nx: 91, ny: 106, lat: 36.5684, lng: 128.7294 },
  '구미시': { nx: 84, ny: 96, lat: 36.1196, lng: 128.3441 },
  '구미': { nx: 84, ny: 96, lat: 36.1196, lng: 128.3441 },
  '영주시': { nx: 89, ny: 111, lat: 36.8056, lng: 128.6240 },
  '영주': { nx: 89, ny: 111, lat: 36.8056, lng: 128.6240 },
  '영천시': { nx: 95, ny: 93, lat: 35.9733, lng: 128.9386 },
  '영천': { nx: 95, ny: 93, lat: 35.9733, lng: 128.9386 },
  '상주시': { nx: 81, ny: 102, lat: 36.4107, lng: 128.1590 },
  '상주': { nx: 81, ny: 102, lat: 36.4107, lng: 128.1590 },
  '문경시': { nx: 81, ny: 106, lat: 36.5867, lng: 128.1864 },
  '문경': { nx: 81, ny: 106, lat: 36.5867, lng: 128.1864 },
  '경산시': { nx: 91, ny: 90, lat: 35.8252, lng: 128.7411 },
  '경산': { nx: 91, ny: 90, lat: 35.8252, lng: 128.7411 },

  // 경상남도
  '경상남도': { nx: 91, ny: 77, lat: 35.4606, lng: 128.2132 },
  '경남': { nx: 91, ny: 77, lat: 35.4606, lng: 128.2132 },
  '창원시': { nx: 90, ny: 77, lat: 35.2280, lng: 128.6811 },
  '창원': { nx: 90, ny: 77, lat: 35.2280, lng: 128.6811 },
  '진주시': { nx: 90, ny: 75, lat: 35.1800, lng: 128.1076 },
  '진주': { nx: 90, ny: 75, lat: 35.1800, lng: 128.1076 },
  '통영시': { nx: 87, ny: 68, lat: 34.8544, lng: 128.4331 },
  '통영': { nx: 87, ny: 68, lat: 34.8544, lng: 128.4331 },
  '사천시': { nx: 80, ny: 71, lat: 35.0034, lng: 128.0642 },
  '사천': { nx: 80, ny: 71, lat: 35.0034, lng: 128.0642 },
  '김해시': { nx: 95, ny: 77, lat: 35.2285, lng: 128.8890 },
  '김해': { nx: 95, ny: 77, lat: 35.2285, lng: 128.8890 },
  '밀양시': { nx: 92, ny: 83, lat: 35.5040, lng: 128.7469 },
  '밀양': { nx: 92, ny: 83, lat: 35.5040, lng: 128.7469 },
  '거제시': { nx: 90, ny: 69, lat: 34.8807, lng: 128.6212 },
  '거제': { nx: 90, ny: 69, lat: 34.8807, lng: 128.6212 },
  '양산시': { nx: 97, ny: 79, lat: 35.3349, lng: 129.0378 },
  '양산': { nx: 97, ny: 79, lat: 35.3349, lng: 129.0378 },

  // 제주특별자치도
  '제주특별자치도': { nx: 52, ny: 38, lat: 33.4996, lng: 126.5312 },
  '제주도': { nx: 52, ny: 38, lat: 33.4996, lng: 126.5312 },
  '제주': { nx: 52, ny: 38, lat: 33.4996, lng: 126.5312 },
  '제주시': { nx: 53, ny: 38, lat: 33.5097, lng: 126.5219 },
  '서귀포시': { nx: 52, ny: 33, lat: 33.2542, lng: 126.5603 },
  '서귀포': { nx: 52, ny: 33, lat: 33.2542, lng: 126.5603 }
};

// 주소 전처리 함수 - V-world API용 주소 포맷으로 변환
function preprocessAddressForVworld(address: string): string {
  // 주소를 공백으로 분리
  const parts = address.replace(/[(),]/g, ' ').split(/\s+/).filter(part => part.length > 1);
  
  console.log('원본 주소:', address);
  console.log('주소 분석:', parts);
  
  // 도/특별시/광역시 제거 패턴
  const provincePatterns = [
    '서울특별시', '서울시', '서울',
    '부산광역시', '부산시', '부산',
    '대구광역시', '대구시', '대구', 
    '인천광역시', '인천시', '인천',
    '광주광역시', '광주시',
    '대전광역시', '대전시', '대전',
    '울산광역시', '울산시', '울산',
    '세종특별자치시', '세종시', '세종',
    '경기도', '경기',
    '강원도', '강원',
    '충청북도', '충북',
    '충청남도', '충남',
    '전라북도', '전북',
    '전라남도', '전남',
    '경상북도', '경북',
    '경상남도', '경남',
    '제주특별자치도', '제주도'
  ];
  
  // 도/특별시/광역시 부분 제거
  let filteredParts = parts.filter(part => {
    return !provincePatterns.some(pattern => part === pattern);
  });
  
  // 시/군/구부터 시작하도록 처리
  let startIndex = 0;
  for (let i = 0; i < filteredParts.length; i++) {
    const part = filteredParts[i];
    if (part.endsWith('시') || part.endsWith('군') || part.endsWith('구')) {
      startIndex = i;
      break;
    }
  }
  
  // 시/군/구부터 끝까지 가져오기
  const processedAddress = filteredParts.slice(startIndex).join(' ');
  
  console.log('전처리된 주소:', processedAddress);
  
  return processedAddress || address; // 전처리 실패 시 원본 반환
}

// 주소에서 지역 정보 추출하는 함수
function extractLocationFromAddress(address: string) {
  // 주소를 공백과 특수문자로 분리
  const parts = address.replace(/[(),]/g, ' ').split(/\s+/).filter(part => part.length > 1);
  
  console.log('주소 분석:', parts);
  
  // 우선순위: 시/군 > 구 > 도
  for (const part of parts) {
    // 시/군 우선 검색
    if (part.endsWith('시') || part.endsWith('군')) {
      if (KOREA_GRID_MAP[part]) {
        console.log('매치된 시/군:', part);
        return { region: part, ...KOREA_GRID_MAP[part] };
      }
    }
  }
  
  for (const part of parts) {
    // 구 검색
    if (part.endsWith('구')) {
      if (KOREA_GRID_MAP[part]) {
        console.log('매치된 구:', part);
        return { region: part, ...KOREA_GRID_MAP[part] };
      }
    }
  }
  
  for (const part of parts) {
    // 도/특별시/광역시 검색
    if (part.endsWith('도') || part.includes('특별시') || part.includes('광역시')) {
      if (KOREA_GRID_MAP[part]) {
        console.log('매치된 도/특별시/광역시:', part);
        return { region: part, ...KOREA_GRID_MAP[part] };
      }
    }
  }
  
  // 부분 매칭 시도
  for (const part of parts) {
    for (const [key, value] of Object.entries(KOREA_GRID_MAP)) {
      if (key.includes(part) || part.includes(key)) {
        console.log('부분 매치:', part, '->', key);
        return { region: key, ...value };
      }
    }
  }
  
  // 기본값 (서울)
  console.log('매칭 실패, 서울로 기본 설정');
  return { region: '서울특별시', ...KOREA_GRID_MAP['서울특별시'] };
}

// 위도/경도를 기상청 격자 좌표로 변환하는 함수
function convertToGrid(lat: number, lng: number) {
  const RE = 6371.00877; // 지구 반지름(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180.0;
  const RADDEG = 180.0 / Math.PI;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + (lat) * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  let theta = lng * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx: x, ny: y };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { address }: GeocodeRequest = await req.json()

    if (!address?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: '주소 정보가 필요합니다.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 먼저 한국 지역 매핑 테이블에서 찾기 시도
    const mappedLocation = extractLocationFromAddress(address);
    if (mappedLocation) {
      console.log('한국 지역 매핑 테이블에서 찾음:', mappedLocation);
      
      const location: LocationResponse = {
        address: address,
        latitude: mappedLocation.lat,
        longitude: mappedLocation.lng,
        gridX: mappedLocation.nx,
        gridY: mappedLocation.ny
      };

      return new Response(
        JSON.stringify({
          success: true,
          location: location,
          source: 'korea_mapping_table',
          mappedRegion: mappedLocation.region
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 매핑 테이블에서 찾지 못한 경우 V-world API 사용
    const VWORLD_API_KEY = Deno.env.get('VWORLD_API_KEY');
    
    if (!VWORLD_API_KEY) {
      console.error('V-world API 키가 설정되지 않았습니다. 서울로 기본 설정합니다.');
      
      // 기본값 (서울) 반환
      const defaultLocation: LocationResponse = {
        address: address,
        latitude: 37.5665,
        longitude: 126.9780,
        gridX: 60,
        gridY: 127
      };

      return new Response(
        JSON.stringify({
          success: true,
          location: defaultLocation,
          source: 'default_seoul',
          note: 'V-world API 키가 없어 서울로 기본 설정했습니다.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 주소 전처리: 시/군/구부터 시작하도록 변환
    function preprocessAddress(fullAddress: string): string {
      const parts = fullAddress.replace(/[(),]/g, ' ').split(/\s+/).filter(part => part.length > 1);
      
      // 도/특별시/광역시 제거하고 시/군/구부터 시작
      const filteredParts: string[] = [];
      let startAdding = false;
      
      for (const part of parts) {
        // 시/군/구를 만나면 시작
        if (part.endsWith('시') || part.endsWith('군') || part.endsWith('구')) {
          startAdding = true;
        }
        
        // 도/특별시/광역시는 건너뛰기
        if (part.endsWith('도') || part.includes('특별시') || part.includes('광역시')) {
          continue;
        }
        
        if (startAdding) {
          filteredParts.push(part);
        }
      }
      
      const processedAddress = filteredParts.join(' ');
      console.log('주소 전처리:', fullAddress, '->', processedAddress);
      return processedAddress || fullAddress; // 전처리 실패 시 원본 반환
    }

    const processedAddress = preprocessAddress(address);
    
    // V-world Geocoder API 호출
    const vworldApiUrl = new URL('https://api.vworld.kr/req/address');
    vworldApiUrl.searchParams.append('service', 'address');
    vworldApiUrl.searchParams.append('request', 'getCoord');
    vworldApiUrl.searchParams.append('version', '2.0');
    vworldApiUrl.searchParams.append('crs', 'epsg:4326');
    vworldApiUrl.searchParams.append('address', processedAddress); // 전처리된 주소 사용
    vworldApiUrl.searchParams.append('refine', 'true');
    vworldApiUrl.searchParams.append('simple', 'false');
    vworldApiUrl.searchParams.append('format', 'json');
    vworldApiUrl.searchParams.append('type', 'road'); // 도로명주소 우선
    vworldApiUrl.searchParams.append('key', VWORLD_API_KEY);

    console.log('V-world 지오코딩 API 호출 (전처리된 주소):', processedAddress);
    console.log('API URL:', vworldApiUrl.toString());

    const vworldResponse = await fetch(vworldApiUrl.toString());
    const vworldData = await vworldResponse.json();

    console.log('V-world API 응답:', JSON.stringify(vworldData, null, 2));

    // API 응답 처리
    if (vworldData.status !== 'OK' || !vworldData.result?.point) {
      // 도로명주소 실패 시 지번주소로 재시도
      vworldApiUrl.searchParams.set('type', 'parcel');
      
      console.log('도로명주소 실패, 지번주소로 재시도 (전처리된 주소):', vworldAddress);
      console.log('재시도 API URL:', vworldApiUrl.toString());
      
      const retryResponse = await fetch(vworldApiUrl.toString());
      const retryData = await retryResponse.json();
      
      if (retryData.status !== 'OK' || !retryData.result?.point) {
        return new Response(
          JSON.stringify({
            success: false,
            error: '주소를 찾을 수 없습니다.',
            address: address,
            vworldStatus: retryData.status,
            vworldError: retryData.error
          }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      // 재시도 성공 시 재시도 데이터 사용
      const point = retryData.result.point;
      const latitude = parseFloat(point.y);
      const longitude = parseFloat(point.x);
      
      // 위도/경도를 기상청 격자 좌표로 변환
      const gridCoords = convertToGrid(latitude, longitude);

      const location: LocationResponse = {
        address: retryData.refined?.text || address,
        latitude: latitude,
        longitude: longitude,
        gridX: gridCoords.nx,
        gridY: gridCoords.ny
      };

      return new Response(
        JSON.stringify({
          success: true,
          location: location,
          vworldResult: {
            status: retryData.status,
            inputAddress: retryData.input?.address,
            refinedAddress: retryData.refined?.text,
            crs: retryData.result?.crs,
            coordinates: {
              x: point.x,
              y: point.y
            },
            structure: retryData.refined?.structure,
            addressType: 'parcel'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 첫 번째 시도 성공
    const point = vworldData.result.point;
    const latitude = parseFloat(point.y);
    const longitude = parseFloat(point.x);

    // 위도/경도를 기상청 격자 좌표로 변환
    const gridCoords = convertToGrid(latitude, longitude);

    const location: LocationResponse = {
      address: vworldData.refined?.text || address,
      latitude: latitude,
      longitude: longitude,
      gridX: gridCoords.nx,
      gridY: gridCoords.ny
    };

    return new Response(
      JSON.stringify({
        success: true,
        location: location,
        vworldResult: {
          status: vworldData.status,
          inputAddress: vworldData.input?.address,
          refinedAddress: vworldData.refined?.text,
          crs: vworldData.result?.crs,
          coordinates: {
            x: point.x,
            y: point.y
          },
          structure: vworldData.refined?.structure,
          addressType: 'road'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('주소 변환 중 오류:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: '주소 변환 중 오류가 발생했습니다.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
