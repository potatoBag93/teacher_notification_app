/**
 * 기상청 격자 좌표 변환 유틸리티
 * 위도/경도를 기상청 날씨 API에서 사용하는 격자 좌표(nx, ny)로 변환
 */

// 기상청 격자 시스템 매개변수 (Lambert Conformal Conic 투영)
// 단기예보 API 기준 (5km 격자)
const GRID_CONSTANTS = {
  RE: 6371.00877,     // 지구 반지름 (km)
  GRID: 5.0,          // 격자 간격 (km) - 단기예보 API 기준
  SLAT1: 30.0,        // 투영 위도1 (degree)
  SLAT2: 60.0,        // 투영 위도2 (degree)
  OLON: 126.0,        // 기준점 경도 (degree)
  OLAT: 38.0,         // 기준점 위도 (degree)
  XO: 43,             // 기준점 X좌표 (GRID) - 5km 기준
  YO: 136,            // 기준점 Y좌표 (GRID) - 5km 기준
};

interface LatLng {
  lat: number;  // 위도
  lng: number;  // 경도
}

interface GridCoords {
  nx: number;   // 격자 X 좌표
  ny: number;   // 격자 Y 좌표
}

/**
 * 각도를 라디안으로 변환
 */
function toRadians(degrees: number): number {
  return degrees * Math.PI / 180.0;
}

/**
 * 위도/경도를 기상청 격자 좌표로 변환
 * Lambert Conformal Conic 투영법 사용
 */
export function convertLatLngToGrid(lat: number, lng: number): GridCoords {
  const { RE, GRID, SLAT1, SLAT2, OLON, OLAT, XO, YO } = GRID_CONSTANTS;
  
  const DEGRAD = Math.PI / 180.0;
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
  
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  
  let theta = lng * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  
  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  
  return { nx: x, ny: y };
}

/**
 * 격자 좌표를 위도/경도로 변환 (역변환)
 */
export function convertGridToLatLng(nx: number, ny: number): LatLng {
  const { RE, GRID, SLAT1, SLAT2, OLON, OLAT, XO, YO } = GRID_CONSTANTS;
  
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
  
  const xn = nx - XO;
  const yn = ro - ny + YO;
  const ra = Math.sqrt(xn * xn + yn * yn);
  let alat = Math.pow((re * sf / ra), (1.0 / sn));
  alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;
  
  let theta = 0.0;
  if (xn === 0.0) {
    theta = 0.0;
  } else {
    if (yn === 0.0) {
      theta = Math.PI * 0.5;
      if (xn < 0.0) theta = -theta;
    } else {
      theta = Math.atan2(xn, yn);
    }
  }
  const alon = theta / sn + olon;
  
  return {
    lat: alat * RADDEG,
    lng: alon * RADDEG
  };
}

/**
 * 주요 도시의 격자 좌표 매핑 (5km 기준)
 */
export const MAJOR_CITIES_GRID = {
  서울: { nx: 60, ny: 127 },
  부산: { nx: 98, ny: 76 },
  대구: { nx: 89, ny: 90 },
  인천: { nx: 55, ny: 124 },
  광주: { nx: 58, ny: 74 },
  대전: { nx: 67, ny: 100 },
  울산: { nx: 102, ny: 84 },
  세종: { nx: 66, ny: 103 },
  수원: { nx: 60, ny: 121 },
  성남: { nx: 63, ny: 124 },
  고양: { nx: 57, ny: 128 },
  용인: { nx: 64, ny: 119 },
  창원: { nx: 90, ny: 77 },
  전주: { nx: 63, ny: 89 },
  천안: { nx: 63, ny: 110 },
  안산: { nx: 58, ny: 121 },
  안양: { nx: 59, ny: 123 },
  제주: { nx: 52, ny: 38 }
};

/**
 * 격자 좌표가 유효한 범위인지 확인
 * 5km 격자 기준
 */
export function isValidGridCoords(nx: number, ny: number): boolean {
  // 기상청 5km 격자 좌표의 유효 범위
  return nx >= 1 && nx <= 149 && ny >= 1 && ny <= 253;
}

/**
 * 위경도가 한반도 영역인지 확인
 */
export function isKoreaRegion(lat: number, lng: number): boolean {
  // 한반도 전체 영역 (제주도, 북한 포함)
  return lat >= 33.0 && lat <= 43.0 && lng >= 124.5 && lng <= 132.0;
}
