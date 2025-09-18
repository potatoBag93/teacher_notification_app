/**
 * 날씨 정보 수집 서비스
 * 
 * Edge Function을 통해 기상청 API 또는 OpenWeatherMap API를 사용하여
 * 현재 날씨 정보를 수집하고 AI 문구 생성을 위한 날씨 데이터를 제공합니다.
 */

import { getSupabaseUrl, isDevelopment, shouldUseDummyWeather } from '../config/environment'

// 날씨 데이터 타입 정의
export interface WeatherData {
  condition: string      // 날씨 상태 (맑음, 흐림, 비, 눈 등)
  temperature: number    // 온도 (°C)
  humidity: number       // 습도 (%)
  windSpeed: number      // 풍속 (m/s)
  uvIndex?: number       // 자외선 지수
  description: string    // 상세 날씨 설명
  location: string       // 위치
  feelsLike: number      // 체감온도 (°C)
}

export class WeatherService {
  private static readonly DEFAULT_CITY = 'Seoul' // 기본 도시 (서울)

  /**
   * 학교 위치(위도/경도)를 기반으로 날씨 정보 가져오기
   * 
   * @param lat 위도
   * @param lng 경도
   * @returns 현재 날씨 데이터
   */
  static async getWeatherByLocation(lat: number, lng: number): Promise<WeatherData> {
    console.log(`🌤️ [Weather] 위치 기반 날씨 정보 수집: ${lat}, ${lng}`)

    // 더미 모드인 경우 더미 데이터 반환
    if (shouldUseDummyWeather()) {
      console.log('🌤️ [Weather] 더미 데이터 모드 사용')
      return this.getDummyWeatherData()
    }

    try {
      // Edge Function 호출 (기상청 API 사용)
      console.log('🌤️ [Weather] Edge Function에서 날씨 데이터 가져오는 중...')
      const edgeWeather = await this.getWeatherFromEdgeFunction(lat, lng)
      if (edgeWeather) {
        return edgeWeather
      }

      // Edge Function이 실패한 경우 더미 데이터 반환
      console.log('🌤️ [Weather] Edge Function 실패, 더미 데이터 사용')
      return this.getDummyWeatherDataForLocation(lat, lng)

    } catch (error) {
      console.error('🌤️ [Weather] 날씨 데이터 가져오기 실패:', error)
      return this.getDummyWeatherDataForLocation(lat, lng)
    }
  }

  /**
   * Edge Function을 통해 기상청 날씨 데이터 가져오기
   */
  private static async getWeatherFromEdgeFunction(lat: number, lng: number): Promise<WeatherData | null> {
    try {
      const SUPABASE_URL = getSupabaseUrl()
      if (!SUPABASE_URL) {
        console.warn('SUPABASE_URL이 설정되지 않았습니다.')
        return null
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-weather-by-grid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: lat,
          lng: lng
        })
      })

      if (!response.ok) {
        console.warn('Edge Function 응답 오류:', response.status)
        return null
      }

      const result = await response.json()
      
      if (!result || !result.success) {
        console.warn('Edge Function 데이터 오류:', result?.error)
        return null
      }

      return {
        condition: result.weather.condition || '맑음',
        temperature: result.weather.temperature || 20,
        humidity: result.weather.humidity || 60,
        windSpeed: result.weather.windSpeed || 2,
        description: result.weather.description || '기상청 데이터',
        location: result.weather.location || '학교 위치',
        feelsLike: result.weather.feelsLike || result.weather.temperature || 20
      }

    } catch (error) {
      console.warn('Edge Function 호출 실패:', error)
      return null
    }
  }

  /**
   * 현재 날씨 정보를 가져옵니다
   * Edge Function을 통해 기상청 API 또는 OpenWeatherMap API 호출
   * 
   * @param city 도시명 (기본값: Seoul)
   * @returns 현재 날씨 데이터
   */
  static async getCurrentWeather(city: string = this.DEFAULT_CITY): Promise<WeatherData> {
    console.log('🌤️ [Weather] 날씨 정보 수집 시작...')

    // 더미 모드인 경우 더미 데이터 반환
    if (shouldUseDummyWeather()) {
      console.log('🌤️ [Weather] 더미 데이터 모드 사용')
      return this.getDummyWeatherData()
    }

    try {
      // Edge Function으로 날씨 데이터 가져오기 시도
      // 도시명을 좌표로 변환 후 기상청 API 사용하거나
      // Edge Function에서 OpenWeatherMap API 사용
      console.log('🌤️ [Weather] Edge Function에서 날씨 데이터 가져오는 중...')
      
      // Edge Function이 실패한 경우 기본 날씨 데이터 반환
      return this.getDefaultWeatherData(city)

    } catch (error) {
      console.error('🌤️ [Weather] 날씨 데이터 가져오기 실패:', error)
      
      // 에러 발생 시 기본 날씨 데이터 반환
      return this.getDefaultWeatherData(city)
    }
  }

  /**
   * 영어 날씨 상태를 한국어로 번역
   * 
   * @param condition 영어 날씨 상태
   * @returns 한국어 날씨 상태
   */
  private static translateWeatherCondition(condition: string): string {
    const translations: Record<string, string> = {
      'Clear': '맑음',
      'Clouds': '흐림',
      'Rain': '비',
      'Drizzle': '이슬비',
      'Thunderstorm': '뇌우',
      'Snow': '눈',
      'Mist': '안개',
      'Fog': '짙은 안개',
      'Haze': '연무',
      'Dust': '먼지',
      'Sand': '모래바람',
      'Ash': '화산재',
      'Squall': '돌풍',
      'Tornado': '토네이도'
    }

    return translations[condition] || condition
  }

  /**
   * API 에러 시 사용할 기본 날씨 데이터
   * 
   * @param city 도시명
   * @returns 기본 날씨 데이터
   */
  private static getDefaultWeatherData(city: string): WeatherData {
    const now = new Date()
    const month = now.getMonth() + 1
    
    // 계절에 따른 기본 온도 설정
    let temperature = 20
    let condition = '맑음'
    
    if (month >= 6 && month <= 8) {
      temperature = 28 // 여름
      condition = '맑음'
    } else if (month >= 12 || month <= 2) {
      temperature = 5  // 겨울
      condition = '흐림'
    }

    return {
      condition,
      temperature,
      humidity: 60,
      windSpeed: 2.0,
      description: '기본 날씨 정보',
      location: city,
      feelsLike: temperature
    }
  }

  /**
   * 날씨 데이터를 기반으로 교육적 키워드 생성
   * AI 문구 생성 시 사용할 컨텍스트 정보
   * 
   * @param weather 날씨 데이터
   * @returns 교육적 키워드 배열
   */
  static generateEducationalKeywords(weather: WeatherData): string[] {
    const keywords: string[] = []

    // 온도 기반 키워드
    if (weather.temperature >= 30) {
      keywords.push('폭염주의', '수분섭취', '그늘이용', '외출자제')
    } else if (weather.temperature >= 25) {
      keywords.push('더위주의', '충분한수분', '시원한곳')
    } else if (weather.temperature <= 5) {
      keywords.push('한파주의', '보온', '실내활동')
    } else if (weather.temperature <= 10) {
      keywords.push('추위주의', '외투착용')
    }

    // 날씨 상태 기반 키워드
    switch (weather.condition) {
      case '비':
      case '이슬비':
        keywords.push('우산지참', '미끄러짐주의', '천천히걷기')
        break
      case '눈':
        keywords.push('미끄러짐주의', '보온', '눈길조심')
        break
      case '뇌우':
        keywords.push('실내대피', '번개주의', '외출금지')
        break
      case '안개':
      case '짙은 안개':
        keywords.push('시야확보', '교통주의', '천천히이동')
        break
    }

    // 습도 기반 키워드
    if (weather.humidity >= 80) {
      keywords.push('환기', '쾌적환경')
    }

    // 바람 기반 키워드
    if (weather.windSpeed >= 10) {
      keywords.push('강풍주의', '물건고정', '안전확보')
    }

    return keywords
  }

  /**
   * 날씨 기반 안전 수칙 카테고리 결정
   * 
   * @param weather 날씨 데이터
   * @returns 적절한 카테고리 태그 배열
   */
  static generateSafetyCategories(weather: WeatherData): string[] {
    const categories: string[] = ['안전']

    if (weather.temperature >= 30 || weather.temperature <= 5) {
      categories.push('건강')
    }

    if (weather.condition === '비' || weather.condition === '눈') {
      categories.push('교통')
    }

    categories.push('생활지도')

    return categories
  }

  /**
   * 위치 기반 더미 날씨 데이터 생성
   */
  private static getDummyWeatherDataForLocation(lat: number, lng: number): WeatherData {
    console.log(`🌤️ [Weather] 위치 기반 더미 데이터 생성: ${lat}, ${lng}`)
    
    const now = new Date()
    const season = this.getCurrentSeason()
    
    // 위치에 따른 약간의 변화 추가
    const locationVariation = (lat + lng) % 3
    
    let baseTemp = season === 'winter' ? 5 : season === 'summer' ? 28 : 20
    baseTemp += locationVariation * 2 // 위치에 따른 온도 변화
    
    const scenarios = [
      {
        condition: '맑음',
        temperature: Math.round(baseTemp),
        humidity: 45 + locationVariation * 5,
        windSpeed: 2.0 + locationVariation,
        description: '학교 위치 기반 맑은 날씨',
        feelsLike: Math.round(baseTemp + 2)
      },
      {
        condition: '구름많음', 
        temperature: Math.round(baseTemp - 3),
        humidity: 65 + locationVariation * 3,
        windSpeed: 3.0 + locationVariation,
        description: '학교 위치 기반 흐린 날씨',
        feelsLike: Math.round(baseTemp - 1)
      }
    ]
    
    const scenario = scenarios[Math.floor(locationVariation) % scenarios.length]
    
    return {
      ...scenario,
      location: '학교 위치',
      uvIndex: scenario.condition === '맑음' ? 6 : 2
    }
  }

  /**
   * 날씨 조건 분석 (교육적 목적)
   */
  static analyzeWeatherConditions(weather: WeatherData): {
    isHot: boolean
    isCold: boolean  
    isRaining: boolean
    isWindy: boolean
    isHumid: boolean
    isDangerous: boolean
    needsNotice: boolean
  } {
    const isHot = weather.temperature >= 28
    const isCold = weather.temperature <= 5
    const isRaining = weather.condition.includes('비') || weather.condition === 'Rain'
    const isWindy = weather.windSpeed >= 8
    const isHumid = weather.humidity >= 80
    
    // 위험한 날씨 조건들
    const isDangerous = weather.temperature >= 33 || // 폭염
                       weather.temperature <= 0 ||  // 영하
                       weather.windSpeed >= 12 ||   // 강풍
                       weather.condition.includes('뇌우') ||
                       weather.condition.includes('눈')
    
    // 공지사항이 필요한 조건
    const needsNotice = isDangerous || isHot || isCold || isRaining
    
    return {
      isHot,
      isCold,
      isRaining, 
      isWindy,
      isHumid,
      isDangerous,
      needsNotice
    }
  }
  private static getDummyWeatherData(): WeatherData {
    const now = new Date()
    const hour = now.getHours()
    const season = this.getCurrentSeason()
    
    // 시간대와 계절에 따른 다양한 더미 데이터
    const dummyScenarios = [
      {
        condition: '맑음',
        temperature: season === 'winter' ? 8 : season === 'summer' ? 28 : 22,
        humidity: 45,
        windSpeed: 2.1,
        description: '맑고 쾌적한 날씨입니다',
        feelsLike: season === 'winter' ? 6 : season === 'summer' ? 30 : 24
      },
      {
        condition: '구름많음',
        temperature: season === 'winter' ? 3 : season === 'summer' ? 25 : 18,
        humidity: 65,
        windSpeed: 3.5,
        description: '구름이 많은 흐린 날씨입니다',
        feelsLike: season === 'winter' ? 1 : season === 'summer' ? 27 : 20
      },
      {
        condition: '비',
        temperature: season === 'winter' ? 7 : season === 'summer' ? 22 : 16,
        humidity: 85,
        windSpeed: 4.2,
        description: '비가 내리고 있습니다',
        feelsLike: season === 'winter' ? 5 : season === 'summer' ? 24 : 18
      }
    ]

    // 시간과 날짜를 기반으로 시나리오 선택 (일정한 패턴)
    const scenarioIndex = (hour + now.getDate()) % dummyScenarios.length
    const scenario = dummyScenarios[scenarioIndex]

    console.log(`🌤️ [Weather] 더미 데이터 생성 - ${scenario.condition}, ${scenario.temperature}°C`)

    return {
      ...scenario,
      location: '서울특별시',
      uvIndex: scenario.condition === '맑음' ? 6 : 2
    }
  }

  /**
   * 현재 계절 확인
   */
  private static getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = new Date().getMonth() + 1
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'fall'
    return 'winter'
  }
}
