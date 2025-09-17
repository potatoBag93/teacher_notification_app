/**
 * 날씨 데이터 기반 메시지 시스템
 * 온도, 습도, 강수량, 풍속 등을 종합하여 적절한 메시지 제공
 */

interface WeatherCondition {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  precipitationType: string;
}

interface WeatherMessage {
  category: 'health' | 'lifestyle' | 'school' | 'safety';
  priority: number; // 1=최고, 5=최저
  message: string;
  icon: string;
}

// 날씨 조건별 메시지 데이터베이스
const WEATHER_MESSAGES = {
  // 건강 관련 메시지
  health: {
    heatStroke: {
      condition: (w: WeatherCondition) => w.temperature >= 30,
      messages: [
        { category: 'health', priority: 1, message: '🌡️ 폭염주의! 충분한 수분 섭취와 그늘에서 휴식하세요.', icon: '🥵' },
        { category: 'health', priority: 1, message: '☀️ 열사병 예방을 위해 야외활동을 자제하고 시원한 곳에서 지내세요.', icon: '🌡️' },
        { category: 'health', priority: 1, message: '💧 체온 조절을 위해 물을 자주 마시고 헐렁한 옷을 입으세요.', icon: '💦' }
      ]
    },
    foodPoisoning: {
      condition: (w: WeatherCondition) => w.temperature >= 25 && w.humidity >= 70,
      messages: [
        { category: 'health', priority: 2, message: '🍽️ 고온다습한 날씨, 식중독 주의! 음식 보관에 각별히 신경쓰세요.', icon: '🦠' },
        { category: 'health', priority: 2, message: '🥪 도시락과 급식 관리에 주의하고, 상한 음식은 절대 드시지 마세요.', icon: '🍱' },
        { category: 'health', priority: 2, message: '🧼 식사 전후 손 씻기를 철저히 하고 날것 섭취를 피하세요.', icon: '🚿' }
      ]
    },
    coldPrevention: {
      condition: (w: WeatherCondition) => w.temperature <= 10,
      messages: [
        { category: 'health', priority: 2, message: '🧥 쌀쌀한 날씨, 감기 예방을 위해 따뜻하게 입으세요.', icon: '🤧' },
        { category: 'health', priority: 2, message: '🫖 따뜻한 차나 물을 마시고 실내 온도를 적절히 유지하세요.', icon: '☕' },
        { category: 'health', priority: 2, message: '😷 면역력 강화를 위해 충분한 휴식과 영양 섭취에 신경쓰세요.', icon: '💊' }
      ]
    },
    dryness: {
      condition: (w: WeatherCondition) => w.humidity <= 40,
      messages: [
        { category: 'health', priority: 3, message: '💨 건조한 날씨, 충분한 수분 섭취와 보습에 신경쓰세요.', icon: '🧴' },
        { category: 'health', priority: 3, message: '👃 코와 목이 마를 수 있으니 가습기 사용을 권장합니다.', icon: '💧' },
        { category: 'health', priority: 3, message: '👁️ 안구건조증 예방을 위해 인공눈물을 준비하세요.', icon: '👀' }
      ]
    }
  },

  // 생활 팁 메시지
  lifestyle: {
    clothing: {
      condition: (w: WeatherCondition) => w.temperature >= 25,
      messages: [
        { category: 'lifestyle', priority: 3, message: '👕 가벼운 면 소재 옷과 모자, 선글라스를 착용하세요.', icon: '🧢' },
        { category: 'lifestyle', priority: 3, message: '🩳 통풍이 잘 되는 옷차림으로 체온 조절에 도움을 받으세요.', icon: '👔' },
        { category: 'lifestyle', priority: 3, message: '🧴 외출 시 자외선 차단제를 꼭 발라주세요.', icon: '☀️' }
      ]
    },
    umbrella: {
      condition: (w: WeatherCondition) => w.precipitation > 0,
      messages: [
        { category: 'lifestyle', priority: 2, message: '☔ 우산이나 우비를 준비하고 안전한 등하교 하세요.', icon: '🌂' },
        { category: 'lifestyle', priority: 2, message: '👟 미끄러지지 않는 신발을 신고 조심히 걸으세요.', icon: '🥾' },
        { category: 'lifestyle', priority: 2, message: '📱 스마트폰이나 가방이 젖지 않도록 방수에 신경쓰세요.', icon: '💧' }
      ]
    },
    ventilation: {
      condition: (w: WeatherCondition) => w.humidity >= 80,
      messages: [
        { category: 'lifestyle', priority: 4, message: '🪟 습도가 높아 곰팡이 예방을 위해 환기를 자주 해주세요.', icon: '💨' },
        { category: 'lifestyle', priority: 4, message: '🌪️ 제습기 사용이나 숯 등으로 습도 조절을 해보세요.', icon: '🌀' }
      ]
    }
  },

  // 학교 활동 메시지
  school: {
    outdoorActivity: {
      condition: (w: WeatherCondition) => w.temperature >= 30 || w.precipitation > 5,
      messages: [
        { category: 'school', priority: 1, message: '🏃‍♂️ 야외 체육활동이나 운동회는 실내로 변경하거나 연기하세요.', icon: '🏫' },
        { category: 'school', priority: 1, message: '⚽ 축구, 농구 등 격한 운동은 피하고 가벼운 실내활동을 권장합니다.', icon: '🏀' },
        { category: 'school', priority: 1, message: '🎪 소풍이나 야외학습은 날씨를 고려해 일정 조정을 검토하세요.', icon: '🚌' }
      ]
    },
    lunchManagement: {
      condition: (w: WeatherCondition) => w.temperature >= 25 && w.humidity >= 65,
      messages: [
        { category: 'school', priority: 2, message: '🍚 급식실 위생관리에 각별히 신경쓰고 음식 보관에 주의하세요.', icon: '🍽️' },
        { category: 'school', priority: 2, message: '🥛 우유나 유제품 보관에 특히 신경쓰고 상온 방치를 피하세요.', icon: '🧊' }
      ]
    },
    airConditioning: {
      condition: (w: WeatherCondition) => w.temperature >= 28,
      messages: [
        { category: 'school', priority: 3, message: '❄️ 교실 에어컨 사용 시 적정 온도(24-26°C) 유지하세요.', icon: '🌡️' },
        { category: 'school', priority: 3, message: '🪟 실내외 온도차로 인한 감기 예방에 주의하세요.', icon: '🏠' }
      ]
    }
  },

  // 안전 주의 메시지
  safety: {
    slippery: {
      condition: (w: WeatherCondition) => w.precipitation > 0,
      messages: [
        { category: 'safety', priority: 1, message: '⚠️ 빗길 미끄러짐 주의! 천천히 걸으시고 계단 이용 시 난간을 꼭 잡으세요.', icon: '🚶‍♂️' },
        { category: 'safety', priority: 1, message: '🚗 등하교 시 차량 운행에 각별히 주의하고 횡단보도를 이용하세요.', icon: '🚦' },
        { category: 'safety', priority: 1, message: '🏫 학교 내 복도나 계단이 젖었을 수 있으니 조심히 다니세요.', icon: '⚡' }
      ]
    },
    strongWind: {
      condition: (w: WeatherCondition) => w.windSpeed >= 5,
      messages: [
        { category: 'safety', priority: 2, message: '💨 강풍 주의! 간판이나 나무가지 낙하에 조심하세요.', icon: '🌬️' },
        { category: 'safety', priority: 2, message: '👒 모자나 가벼운 물건이 날아가지 않도록 단단히 잡으세요.', icon: '🎩' },
        { category: 'safety', priority: 2, message: '🚪 문이나 창문이 갑자기 닫힐 수 있으니 손가락 끼임에 주의하세요.', icon: '🖐️' }
      ]
    },
    uvRays: {
      condition: (w: WeatherCondition) => w.temperature >= 25 && w.precipitationType === 'none',
      messages: [
        { category: 'safety', priority: 3, message: '☀️ 강한 자외선 주의! 선크림을 발라주세요.', icon: '🧴' },
        { category: 'safety', priority: 3, message: '🕶️ 선글라스와 모자 착용으로 눈과 피부를 보호하세요.', icon: '👓' },
        { category: 'safety', priority: 3, message: '🌳 가능한 한 그늘에서 활동하고 장시간 직사광선을 피하세요.', icon: '🌲' }
      ]
    }
  }
};

/**
 * 날씨 조건에 따른 메시지 선택 함수
 */
export function getWeatherMessages(weatherData: WeatherCondition): WeatherMessage[] {
  const selectedMessages: WeatherMessage[] = [];
  
  // 모든 카테고리에서 조건에 맞는 메시지 찾기
  Object.values(WEATHER_MESSAGES).forEach(category => {
    Object.values(category).forEach(messageGroup => {
      if (messageGroup.condition(weatherData)) {
        // 조건에 맞으면 랜덤하게 하나 선택
        const randomMessage = messageGroup.messages[Math.floor(Math.random() * messageGroup.messages.length)];
        selectedMessages.push(randomMessage as WeatherMessage);
      }
    });
  });
  
  // 우선순위별로 정렬 (낮은 숫자가 높은 우선순위)
  selectedMessages.sort((a, b) => a.priority - b.priority);
  
  // 최대 3개까지만 반환 (너무 많으면 혼란스러우니까)
  return selectedMessages.slice(0, 3);
}

/**
 * 사용 예시:
 * const messages = getWeatherMessages({
 *   temperature: 32,
 *   humidity: 85,
 *   precipitation: 0,
 *   windSpeed: 2,
 *   precipitationType: 'none'
 * });
 * 
 * 결과:
 * [
 *   { category: 'health', priority: 1, message: '🌡️ 폭염주의! 충분한 수분 섭취...', icon: '🥵' },
 *   { category: 'health', priority: 2, message: '🍽️ 고온다습한 날씨, 식중독 주의!...', icon: '🦠' },
 *   { category: 'school', priority: 1, message: '🏃‍♂️ 야외 체육활동이나 운동회는...', icon: '🏫' }
 * ]
 */
