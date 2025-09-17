// 공통 타입 정의

export interface WeatherData {
  temperature: number;        // 기온 (섭씨)
  condition: string;         // 날씨 상태 (맑음, 비, 눈 등)
  humidity: number;          // 습도 (%)
  windSpeed: number;         // 풍속 (m/s)
  precipitationProbability?: number; // 강수확률 (%)
}

export interface WeatherAlert {
  type: string;              // 특보 종류 (폭염, 한파, 태풍 등)
  level: 'watch' | 'warning' | 'advisory'; // 특보 단계
  description: string;       // 특보 설명
}

export interface AirQualityData {
  pm10: number;              // 미세먼지 농도
  pm25: number;              // 초미세먼지 농도
  ozone?: number;            // 오존 농도
  grade: 'good' | 'normal' | 'bad' | 'very_bad'; // 등급
}

export interface GridCoordinate {
  nx: number;                // 기상청 격자 X 좌표
  ny: number;                // 기상청 격자 Y 좌표
}

export interface GeographicCoordinate {
  latitude: number;          // 위도
  longitude: number;         // 경도
}
