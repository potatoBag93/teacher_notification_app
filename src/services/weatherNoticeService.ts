/**
 * 날씨 기반 공지사항 생성 서비스
 * 
 * 사용자의 학교 위치 날씨를 기반으로
 * 데이터베이스에서 적절한 날씨 문구를 선택합니다.
 */

import type { Notice, Category } from '../data/notices'
import { WeatherService, type WeatherData } from './weatherService'
import { NoticeService } from './noticeService'

// 날씨 조건을 포함한 Notice 타입 확장
interface WeatherNotice extends Notice {
  is_weather_notice?: boolean
  weather_conditions?: {
    temperature?: {
      min?: number
      max?: number
    }
    condition?: string[]
    windSpeed?: {
      min?: number
    }
    humidity?: {
      min?: number
    }
  }
}

export class WeatherNoticeService {
  
  /**
   * 사용자 학교 위치 기반 날씨 공지사항 생성
   */
  static async generateWeatherNotices(schoolLat: number, schoolLng: number): Promise<Notice[]> {
    console.log('🌤️📝 날씨 기반 공지사항 생성 시작')
    
    try {
      // 1. 날씨 정보 가져오기
      const weather = await WeatherService.getWeatherByLocation(schoolLat, schoolLng)
      if (!weather) {
        console.warn('날씨 정보를 가져올 수 없어 공지사항을 생성하지 않습니다.')
        return []
      }
      
      // console.log(`🌤️📝 현재 날씨: ${weather.condition}, ${weather.temperature}°C, 습도 ${weather.humidity}%, 풍속 ${weather.windSpeed}m/s`)
      
      // 2. 날씨 조건에 맞는 랜덤 문구 선택
      const randomNotices = await NoticeService.getRandomNotices({
        weatherFilter: 'only',
        weatherConditions: weather
      }, 2)  // 3개에서 2개로 변경
      
      // console.log(`🌤️📝 랜덤 선택된 날씨 문구 ${randomNotices.length}개`)
      
      // 디버깅: 어떤 문구들이 선택되었는지 확인
      if (randomNotices.length > 0) {
        // console.log('🌤️📝 선택된 문구들:', randomNotices.map(n => n.title))
      } else {
        console.log('🌤️📝 매칭되는 문구가 없습니다. 현재 날씨 조건:', weather)
      }
      
      return randomNotices
      
    } catch (error) {
      console.error('🌤️📝 날씨 기반 공지사항 생성 실패:', error)
      return []
    }
  }

  /**
   * 날씨 조건이 문구 조건과 일치하는지 확인
   */
  private static isWeatherConditionMatch(weather: WeatherData, conditions: any): boolean {
    if (!conditions) return false
    
    // 온도 조건 체크
    if (conditions.temperature) {
      if (conditions.temperature.min && weather.temperature < conditions.temperature.min) {
        return false
      }
      if (conditions.temperature.max && weather.temperature > conditions.temperature.max) {
        return false
      }
    }
    
    // 날씨 상태 조건 체크
    if (conditions.condition && !conditions.condition.includes(weather.condition)) {
      return false
    }
    
    // 풍속 조건 체크
    if (conditions.windSpeed?.min && weather.windSpeed < conditions.windSpeed.min) {
      return false
    }

    // 습도 조건 체크
    if (conditions.humidity?.min && weather.humidity < conditions.humidity.min) {
      return false
    }
    
    return true
  }

  /**
   * 특정 날씨 조건에 맞는 문구를 랜덤으로 하나 선택
   */
  static async getRandomWeatherNotice(
    weatherConditions: any, 
    excludeIds: string[] = []
  ): Promise<Notice | null> {
    return NoticeService.getRandomNotice({
      weatherFilter: 'only',
      weatherConditions,
      excludeIds
    })
  }

  /**
   * 날씨 기반 키워드 생성 (참고용)
   */
  static generateWeatherKeywords(weather: WeatherData): string[] {
    const keywords: string[] = []

    // 온도 기반 키워드
    if (weather.temperature >= 30) {
      keywords.push('폭염', '더위', '수분섭취', '그늘', '휴식')
    } else if (weather.temperature >= 25) {
      keywords.push('무더위', '시원함', '물마시기')
    } else if (weather.temperature <= 5) {
      keywords.push('한파', '추위', '보온', '따뜻함')
    } else if (weather.temperature <= 10) {
      keywords.push('추위', '외투', '체온유지')
    }

    // 날씨 상태 기반 키워드
    if (weather.condition.includes('비')) {
      keywords.push('우산', '미끄러짐', '안전', '우비')
    }
    if (weather.condition.includes('눈')) {
      keywords.push('눈길', '미끄러짐', '보온', '안전')
    }

    // 바람 기반 키워드
    if (weather.windSpeed >= 8) {
      keywords.push('강풍', '안전', '고정', '주의')
    }

    // 습도 기반 키워드
    if (weather.humidity >= 80) {
      keywords.push('습도', '환기', '쾌적', '위생')
    }

    return keywords
  }

  /**
   * 날씨 아이콘 반환
   */
  static getWeatherIcon(condition: string): string {
    const iconMap: Record<string, string> = {
      '맑음': '☀️',
      '구름많음': '⛅',
      '흐림': '☁️', 
      '비': '🌧️',
      '소나기': '🌦️',
      '눈': '❄️',
      '안개': '🌫️',
      '뇌우': '⛈️'
    }
    
    return iconMap[condition] || '🌤️'
  }
  
  /**
   * 날씨 상태 메시지 생성
   */
  static generateWeatherStatusMessage(weather: WeatherData): string {
    const icon = this.getWeatherIcon(weather.condition)
    return `${icon} ${weather.condition} ${weather.temperature}°C (${weather.location})`
  }
}