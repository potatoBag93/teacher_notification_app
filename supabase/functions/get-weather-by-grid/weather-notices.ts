// 날씨 기반 공지사항 생성 시스템

interface Notice {
  title: string;      // 공지사항 제목
  content: string;    // 공지사항 내용
  date: string;       // 발송 날짜
  category: string;   // 카테고리 (건강, 생활, 학교활동, 안전)
  priority: number;   // 우선순위 (1: 높음, 2: 보통, 3: 낮음)
  icon: string;       // 아이콘
}

interface WeatherConditions {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  precipitationType: string;
}

// 날씨별 Notice 데이터베이스
const WEATHER_NOTICES = {
  // 고온 조건 (28도 이상)
  hot_weather: [
    {
      title: "폭염 주의보 - 교실 환기 및 수분 섭취 안내",
      content: "기온이 28도를 넘어 폭염이 예상됩니다. 수업 중 정기적인 환기를 실시하고, 학생들의 충분한 수분 섭취를 독려해 주시기 바랍니다. 체육 수업은 실내로 변경하거나 시간을 단축해 주세요.",
      category: "건강",
      priority: 1,
      icon: "🌡️"
    },
    {
      title: "무더위 대비 학생 건강관리 협조 요청",
      content: "연일 계속되는 무더위로 학생들의 컨디션 난조가 우려됩니다. 교실 온도 체크를 자주 해주시고, 학생들이 어지러움이나 메스꺼움을 호소할 경우 즉시 보건실로 안내해 주시기 바랍니다.",
      category: "건강",
      priority: 1,
      icon: "🏥"
    },
    {
      title: "여름철 교실 온도 관리 및 에어컨 사용 안내",
      content: "폭염으로 인해 에어컨 사용량이 증가하고 있습니다. 적정 온도(26-28도)를 유지하여 전력 절약에 협조해 주시고, 에어컨 가동 시에도 환기를 위해 창문을 살짝 열어두시기 바랍니다.",
      category: "생활",
      priority: 2,
      icon: "❄️"
    },
    {
      title: "폭염 경보 - 야외활동 전면 금지",
      content: "기상청에서 폭염 경보를 발령했습니다. 모든 야외 수업과 활동을 중단하고 실내에서 진행해 주시기 바랍니다. 운동장, 체육관 등 직사광선이 닿는 곳에서의 활동을 금지합니다.",
      category: "안전",
      priority: 1,
      icon: "🚨"
    },
    {
      title: "고온 주의 - 쿨매트 및 부채 사용 권장",
      content: "오늘 최고기온이 30도를 넘을 예정입니다. 학생들이 개인 부채나 쿨매트를 가져와도 좋다고 안내해 주시고, 냉수 공급이 원활히 이뤄지도록 확인해 주세요.",
      category: "생활",
      priority: 2,
      icon: "🧊"
    },
    {
      title: "무더위 피해 예방 - 그늘막 설치 안내",
      content: "운동장 일부에 그늘막을 설치했습니다. 부득이 야외활동이 필요한 경우 그늘진 곳에서만 진행하시고, 10분마다 휴식시간을 가져주시기 바랍니다.",
      category: "학교활동",
      priority: 2,
      icon: "⛱️"
    },
    {
      title: "열사병 예방 교육 실시 요청",
      content: "무더위가 계속되고 있어 열사병 예방 교육이 필요합니다. 학생들에게 충분한 수분 섭취, 적절한 휴식, 시원한 곳에서 머물기 등을 교육해 주시기 바랍니다.",
      category: "건강",
      priority: 1,
      icon: "👨‍⚕️"
    },
    {
      title: "더위 속 집중력 관리 - 수업시간 단축 고려",
      content: "고온으로 인해 학생들의 집중력이 떨어질 수 있습니다. 수업 중간중간 휴식시간을 늘리시거나, 필요시 수업시간을 5-10분 단축하여 진행해 주세요.",
      category: "학교활동",
      priority: 2,
      icon: "⏰"
    },
    {
      title: "냉방병 예방 - 적정 온도 유지 안내",
      content: "에어컨 과도한 사용으로 냉방병이 우려됩니다. 실내외 온도차가 5-7도를 넘지 않도록 에어컨 온도를 26-27도로 설정해 주시기 바랍니다.",
      category: "건강",
      priority: 2,
      icon: "🌡️"
    },
    {
      title: "폭염 대비 응급처치 준비 안내",
      content: "폭염으로 인한 응급상황에 대비해 보건실 연락처를 숙지해 주세요. 학생이 어지러움, 구토, 두통을 호소할 경우 즉시 시원한 곳으로 이동시키고 보건실에 연락바랍니다.",
      category: "안전",
      priority: 1,
      icon: "🚑"
    },
    {
      title: "여름 방학 전 안전 교육 강화",
      content: "방학 전 무더위 안전 교육을 강화해 주세요. 가정에서도 충분한 수분 섭취, 외출 시 모자 착용, 한낮 시간대 야외활동 금지 등을 학생과 학부모에게 안내바랍니다.",
      category: "안전",
      priority: 2,
      icon: "🏖️"
    },
    {
      title: "고온 대비 급식실 위생 관리 강화",
      content: "무더위로 인해 식중독 위험이 높아졌습니다. 급식 시간에 학생들이 손 씻기를 철저히 하도록 지도하시고, 음식 보관과 위생 관리에 각별히 신경써 주시기 바랍니다.",
      category: "건강",
      priority: 2,
      icon: "🍽️"
    },
    {
      title: "무더위 스트레스 관리 - 심리적 지원",
      content: "지속되는 무더위로 학생들의 스트레스가 증가할 수 있습니다. 평소보다 짜증이나 피로감을 많이 호소하는 학생이 있다면 충분한 휴식을 취하도록 배려해 주세요.",
      category: "건강",
      priority: 3,
      icon: "💆"
    },
    {
      title: "폭염 시 교통안전 교육 강화",
      content: "무더위로 인해 등하교 시 주의력이 떨어질 수 있습니다. 학생들에게 횡단보도에서 더욱 신중하게 행동하고, 가능한 그늘진 길로 다니도록 안내해 주시기 바랍니다.",
      category: "안전",
      priority: 2,
      icon: "🚸"
    },
    {
      title: "여름철 화재 예방 - 전기 사용량 점검",
      content: "에어컨 과부하 사용으로 전기 화재 위험이 증가합니다. 교실 내 전기용품 동시 사용을 자제하시고, 이상 발열이나 냄새가 날 경우 즉시 사용을 중단해 주세요.",
      category: "안전",
      priority: 1,
      icon: "🔥"
    }
  ],

  // 저온 조건 (5도 이하)
  cold_weather: [
    {
      title: "한파 주의보 - 등하교 시 학생 안전 점검",
      content: "기온이 5도 이하로 떨어져 한파 주의보가 발효되었습니다. 학생들의 방한용품 착용 상태를 확인해 주시고, 동상이나 저체온증 증상이 있는지 세심히 관찰해 주시기 바랍니다.",
      category: "안전",
      priority: 1,
      icon: "🥶"
    },
    {
      title: "겨울철 교실 난방 관리 및 환기 수칙",
      content: "추위로 인해 교실을 밀폐하는 경우가 많습니다. 적절한 실내 온도(18-20도)를 유지하되, 1시간마다 5분씩 환기를 실시하여 공기질을 관리해 주시기 바랍니다.",
      category: "생활",
      priority: 2,
      icon: "🏠"
    },
    {
      title: "추위 대비 학생 복장 지도 요청",
      content: "급격한 기온 하강으로 학생들의 건강이 우려됩니다. 충분한 방한복 착용을 지도해 주시고, 특히 목도리, 장갑, 모자 등 말단 부위 보온에 신경 써주시기 바랍니다.",
      category: "건강",
      priority: 2,
      icon: "🧥"
    },
    {
      title: "한파 경보 - 실외 활동 전면 중단",
      content: "기상청에서 한파 경보를 발령했습니다. 모든 실외 수업과 활동을 중단하고 실내에서만 진행해 주시기 바랍니다. 급식실 이동 시에도 충분히 보온하도록 지도해 주세요.",
      category: "안전",
      priority: 1,
      icon: "❄️"
    },
    {
      title: "동파 방지 - 교실 수도시설 점검 요청",
      content: "극심한 추위로 수도관 동파가 우려됩니다. 교실 내 수도꼭지에서 물이 잘 나오는지 확인해 주시고, 이상이 있을 경우 즉시 관리실로 연락해 주시기 바랍니다.",
      category: "생활",
      priority: 2,
      icon: "🚰"
    },
    {
      title: "겨울철 화재 예방 - 난방기구 안전 점검",
      content: "난방 사용량 증가로 화재 위험이 높아졌습니다. 교실 내 전기 난방기구 주변에 가연물이 없는지 확인하시고, 과부하 방지를 위해 동시 사용을 자제해 주세요.",
      category: "안전",
      priority: 1,
      icon: "🔥"
    },
    {
      title: "추위 속 면역력 관리 - 감기 예방 교육",
      content: "추운 날씨로 감기나 독감이 유행할 수 있습니다. 학생들에게 손 씻기, 마스크 착용, 충분한 수면 등 감기 예방 수칙을 교육해 주시기 바랍니다.",
      category: "건강",
      priority: 2,
      icon: "🤧"
    },
    {
      title: "저체온증 예방 - 실내 체온 유지 수칙",
      content: "극한 추위로 저체온증 위험이 증가했습니다. 학생들이 떨림, 창백함, 의식 저하 등의 증상을 보일 경우 즉시 따뜻한 곳으로 이동시키고 보건실에 연락바랍니다.",
      category: "건강",
      priority: 1,
      icon: "🌡️"
    },
    {
      title: "겨울철 교통안전 - 빙판길 주의 교육",
      content: "새벽과 밤사이 도로가 얼어 빙판길이 형성됩니다. 등하교 시 천천히 걷기, 계단에서 난간 잡기, 급하게 뛰지 않기 등을 지도해 주시기 바랍니다.",
      category: "안전",
      priority: 1,
      icon: "🧊"
    },
    {
      title: "한겨울 피부 관리 - 건조함 예방 안내",
      content: "춥고 건조한 날씨로 학생들의 피부가 거칠어질 수 있습니다. 핸드크림이나 립밤 사용을 권장하시고, 심한 경우 보건실 상담을 받도록 안내해 주세요.",
      category: "건강",
      priority: 3,
      icon: "🧴"
    },
    {
      title: "추위 스트레스 관리 - 우울감 예방",
      content: "지속되는 추위와 일조량 부족으로 계절성 우울감이 생길 수 있습니다. 평소보다 의기소침하거나 활력이 없는 학생이 있다면 따뜻한 관심을 보여주시기 바랍니다.",
      category: "건강",
      priority: 3,
      icon: "😔"
    },
    {
      title: "겨울 방학 전 안전 교육 실시",
      content: "겨울 방학을 앞두고 한파 대비 안전 교육을 실시해 주세요. 가정에서도 적정 실내온도 유지, 외출 시 충분한 보온, 일산화탄소 중독 예방 등을 안내바랍니다.",
      category: "안전",
      priority: 2,
      icon: "🏔️"
    },
    {
      title: "동계 스포츠 안전 - 실내 체육 활동 권장",
      content: "추운 날씨에 야외 체육활동은 위험합니다. 실내에서 할 수 있는 체조, 요가, 실내 게임 등으로 체육 수업을 변경해 주시고, 충분한 준비운동을 실시해 주세요.",
      category: "학교활동",
      priority: 2,
      icon: "🤸"
    },
    {
      title: "겨울철 정전 대비 - 비상용품 점검",
      content: "한파로 인한 정전에 대비해 교실 내 비상용품을 점검해 주세요. 손전등, 양초, 담요 등의 위치를 파악하시고, 정전 시 행동요령을 학생들에게 미리 안내바랍니다.",
      category: "안전",
      priority: 2,
      icon: "🔦"
    },
    {
      title: "혹한기 급식 관리 - 따뜻한 음식 제공",
      content: "추운 날씨에 따뜻한 급식이 더욱 중요합니다. 급식 배식 시간을 단축하여 음식이 식지 않도록 하시고, 따뜻한 국물이나 차를 충분히 제공해 주시기 바랍니다.",
      category: "생활",
      priority: 3,
      icon: "🍲"
    }
  ],

  // 강수 조건 (비)
  rainy_weather: [
    {
      title: "우천 시 우산 지참 및 안전 귀가 지도",
      content: "오늘 하루 종일 비가 예상됩니다. 학생들이 우산을 준비했는지 확인해 주시고, 하교 시 미끄러운 길면에서의 안전사고 예방을 위한 주의사항을 당부해 주시기 바랍니다.",
      category: "안전",
      priority: 2,
      icon: "☔"
    },
    {
      title: "비 오는 날 실내 체육활동 전환 안내",
      content: "강수로 인해 야외 체육활동이 어려운 상황입니다. 실내에서 할 수 있는 체육활동으로 수업 계획을 변경해 주시고, 체육관 사용 일정을 미리 조율해 주시기 바랍니다.",
      category: "학교활동",
      priority: 2,
      icon: "🏃"
    },
    {
      title: "우기철 교실 습도 관리 및 곰팡이 예방",
      content: "비로 인해 습도가 높아졌습니다. 교실 내 제습기 가동을 확인해 주시고, 벽면이나 모서리에 습기가 차지 않도록 주의해 주시기 바랍니다. 환기도 자주 실시해 주세요.",
      category: "생활",
      priority: 3,
      icon: "💧"
    },
    {
      title: "호우 경보 - 등하교 안전 관리 강화",
      content: "기상청에서 호우 경보를 발령했습니다. 등하교 시간 조정을 검토하시고, 학부모 차량 이용을 권장해 주시기 바랍니다. 도로 침수 지역은 우회하도록 안내해 주세요.",
      category: "안전",
      priority: 1,
      icon: "🌊"
    },
    {
      title: "빗길 교통안전 - 시야 확보 및 서행 교육",
      content: "비로 인해 시야가 불량하고 제동거리가 늘어납니다. 학생들에게 밝은 색 옷 착용, 횡단보도에서 좌우 확인, 급하게 뛰지 않기 등을 교육해 주시기 바랍니다.",
      category: "안전",
      priority: 1,
      icon: "🚗"
    },
    {
      title: "우천 시 전기 안전 - 누전 방지 교육",
      content: "비 오는 날 전기 안전사고가 증가합니다. 젖은 손으로 전기 제품을 만지지 않기, 물이 있는 곳에서 전자기기 사용 금지 등을 학생들에게 교육해 주시기 바랍니다.",
      category: "안전",
      priority: 1,
      icon: "⚡"
    },
    {
      title: "장마철 건강 관리 - 습진 및 무좀 예방",
      content: "높은 습도로 인해 피부 질환이 발생하기 쉽습니다. 학생들에게 깨끗하고 건조한 옷 착용, 발가락 사이 건조 유지 등을 교육하시고, 증상이 있으면 보건실 상담을 받도록 안내해 주세요.",
      category: "건강",
      priority: 2,
      icon: "🦶"
    },
    {
      title: "비 오는 날 심리 케어 - 우울감 예방",
      content: "흐린 날씨가 계속되면 학생들의 기분이 우울해질 수 있습니다. 교실을 밝게 하고, 활기찬 분위기를 만들어 주시며, 평소보다 학생들과 많은 대화를 나누어 주시기 바랍니다.",
      category: "건강",
      priority: 3,
      icon: "😊"
    },
    {
      title: "우산 분실 방지 - 개인 물품 관리 교육",
      content: "비 오는 날 우산 분실이 자주 발생합니다. 학생들에게 우산에 이름표 부착, 정해진 곳에 보관하기, 다른 사람 우산 사용 금지 등을 교육해 주시기 바랍니다.",
      category: "생활",
      priority: 3,
      icon: "🏷️"
    },
    {
      title: "급식실 안전 - 미끄럼 방지 및 위생 관리",
      content: "비 오는 날 급식실 바닥이 미끄러워질 수 있습니다. 학생들이 천천히 이동하도록 지도하시고, 음식 위생 관리에도 각별히 신경써 주시기 바랍니다.",
      category: "안전",
      priority: 2,
      icon: "🍽️"
    },
    {
      title: "운동장 물빠짐 점검 - 배수구 관리",
      content: "강수량이 많아 운동장 배수에 문제가 생길 수 있습니다. 배수구 주변에 낙엽이나 쓰레기가 막혀있지 않은지 확인해 주시고, 웅덩이가 생긴 곳은 학생 출입을 금지해 주세요.",
      category: "안전",
      priority: 2,
      icon: "🏃‍♂️"
    },
    {
      title: "빗소리 활용 교육 - 자연 체험 학습",
      content: "비 오는 날을 자연 체험 학습의 기회로 활용해 보세요. 빗소리 듣기, 물의 순환 과정 설명, 식물에게 주는 비의 역할 등을 주제로 수업을 진행해 보시기 바랍니다.",
      category: "학교활동",
      priority: 3,
      icon: "🌱"
    },
    {
      title: "우천 시 방과후 활동 조정 안내",
      content: "비로 인해 야외 방과후 활동이 어려울 수 있습니다. 실내 활동으로 변경하거나 일정을 조정해 주시고, 학부모님께 변경사항을 미리 안내해 주시기 바랍니다.",
      category: "학교활동",
      priority: 2,
      icon: "📅"
    },
    {
      title: "장마철 가정통신문 - 안전 수칙 안내",
      content: "장기간 비가 예상되어 가정에서도 주의가 필요합니다. 학부모님께 실내 환기, 습도 관리, 아이들 외출 시 주의사항 등을 안내하는 가정통신문을 발송해 주시기 바랍니다.",
      category: "생활",
      priority: 3,
      icon: "📋"
    },
    {
      title: "우수 대비 - 지하실 및 저지대 안전 점검",
      content: "많은 비로 침수가 우려되는 지역이 있습니다. 학교 지하실이나 저지대 시설물 안전 점검을 실시하시고, 학생들이 위험 지역에 접근하지 않도록 안내해 주시기 바랍니다.",
      category: "안전",
      priority: 1,
      icon: "🏢"
    }
  ],

  // 눈 조건
  snowy_weather: [
    {
      title: "대설 주의보 - 교내 빙판길 안전사고 예방",
      content: "눈이 내려 교내에 빙판길이 형성될 수 있습니다. 학생들에게 천천히 걷기를 지도해 주시고, 계단이나 경사로에서는 특히 주의하도록 안내해 주시기 바랍니다.",
      category: "안전",
      priority: 1,
      icon: "⛄"
    },
    {
      title: "설날씨 대비 등하교 시간 조정 안내",
      content: "폭설로 인해 교통상황이 원활하지 않을 수 있습니다. 지각생이 발생할 수 있으니 관대한 처리를 부탁드리며, 조기 하교가 필요한 경우 즉시 안내해 드리겠습니다.",
      category: "학교활동",
      priority: 2,
      icon: "🚌"
    },
    {
      title: "눈놀이 안전수칙 및 교육활동 기회 활용",
      content: "학생들이 눈을 좋아하지만 안전사고가 우려됩니다. 눈싸움이나 눈사람 만들기 등의 활동 시 안전수칙을 미리 교육해 주시고, 자연 관찰의 좋은 기회로 활용해 주시기 바랍니다.",
      category: "학교활동",
      priority: 3,
      icon: "☃️"
    },
    {
      title: "대설 경보 - 전면 휴교 검토",
      content: "기상청에서 대설 경보를 발령했습니다. 학생과 교직원의 안전을 위해 휴교를 검토 중이며, 결정사항은 즉시 안내해 드리겠습니다. 현재 등교한 학생들의 안전에 특별히 유의해 주세요.",
      category: "안전",
      priority: 1,
      icon: "🚨"
    },
    {
      title: "제설 작업 협조 - 학교 진입로 확보",
      content: "학교 주변 제설 작업이 진행됩니다. 학생들이 제설 차량이나 작업 구역에 접근하지 않도록 지도해 주시고, 안전한 등하교 통로를 이용하도록 안내해 주시기 바랍니다.",
      category: "안전",
      priority: 2,
      icon: "🚧"
    },
    {
      title: "눈길 보행 안전 - 미끄럼 방지 교육",
      content: "눈과 얼음으로 미끄러운 길이 많습니다. 학생들에게 보폭을 줄여 걷기, 주머니에서 손 빼고 걷기, 급하게 뛰지 않기 등의 안전 수칙을 교육해 주시기 바랍니다.",
      category: "안전",
      priority: 1,
      icon: "👟"
    },
    {
      title: "설화 대비 - 방한용품 착용 점검",
      content: "눈과 함께 기온이 급격히 떨어집니다. 학생들의 방한복, 장갑, 목도리, 모자 착용 상태를 점검해 주시고, 준비가 부족한 학생에게는 여분의 용품을 제공해 주세요.",
      category: "건강",
      priority: 2,
      icon: "🧤"
    },
    {
      title: "눈 관련 과학 수업 - 자연 현상 학습",
      content: "눈이 내리는 날을 과학 학습의 기회로 활용해 보세요. 눈 결정 관찰, 온도와 습도의 관계, 기상 현상 등을 주제로 흥미로운 수업을 진행해 보시기 바랍니다.",
      category: "학교활동",
      priority: 3,
      icon: "🔬"
    },
    {
      title: "눈 치우기 활동 - 봉사 정신 교육",
      content: "학생들과 함께 교내 눈 치우기 활동을 해보는 것은 어떨까요? 안전을 우선으로 하되, 공동체 의식과 봉사 정신을 기를 수 있는 좋은 기회가 될 것입니다.",
      category: "학교활동",
      priority: 3,
      icon: "🧹"
    },
    {
      title: "폭설 시 급식 운영 - 온실효과 방지",
      content: "눈으로 인해 급식 재료 납품이 지연될 수 있습니다. 비상 급식 계획을 준비하시고, 따뜻한 음식 제공에 중점을 두어 학생들의 체온 유지에 도움이 되도록 해주시기 바랍니다.",
      category: "생활",
      priority: 2,
      icon: "🍲"
    },
    {
      title: "눈 축제 기획 - 겨울 정서 함양",
      content: "적당한 적설량이라면 눈 축제를 기획해 보세요. 안전한 눈사람 만들기 대회, 눈 조각 전시회 등을 통해 겨울의 정취를 만끽하고 학생들의 창의성을 발휘할 기회를 제공해 주세요.",
      category: "학교활동",
      priority: 3,
      icon: "🎭"
    },
    {
      title: "설맹 예방 - 자외선 차단 교육",
      content: "눈이 반사하는 자외선으로 눈부심과 설맹이 발생할 수 있습니다. 학생들에게 선글라스나 모자 착용을 권장하시고, 눈을 비비지 않도록 교육해 주시기 바랍니다.",
      category: "건강",
      priority: 2,
      icon: "🕶️"
    }
  ],

  // 강풍 조건
  windy_weather: [
    {
      title: "강풍 주의보 - 야외활동 전면 금지",
      content: "풍속 10m/s 이상의 강풍이 예상됩니다. 모든 야외활동을 중단하고 실내로 대피시켜 주시기 바랍니다. 창문 점검을 실시하여 파손 위험을 사전에 차단해 주세요.",
      category: "안전",
      priority: 1,
      icon: "💨"
    },
    {
      title: "강풍 시 창문 점검 및 안전사고 예방",
      content: "강한 바람으로 인해 창문이나 문이 갑자기 열리거나 닫힐 수 있습니다. 모든 창문의 잠금장치를 확인해 주시고, 학생들이 창가에 가까이 가지 않도록 지도해 주시기 바랍니다.",
      category: "안전",
      priority: 1,
      icon: "🪟"
    },
    {
      title: "태풍 대비 - 비상계획 점검",
      content: "강풍을 동반한 태풍이 접근하고 있습니다. 비상대피 계획을 점검하시고, 학생들에게 태풍 시 행동요령을 교육해 주시기 바랍니다. 비상용품 위치도 다시 한 번 확인해 주세요.",
      category: "안전",
      priority: 1,
      icon: "🌀"
    },
    {
      title: "강풍 피해 점검 - 시설물 안전 확인",
      content: "강풍으로 인한 교내 시설물 피해를 점검해 주세요. 간판, 화분, 우산꽂이 등이 넘어지거나 날아갈 위험이 있는 물건들을 안전한 곳으로 이동시켜 주시기 바랍니다.",
      category: "안전",
      priority: 2,
      icon: "🏗️"
    },
    {
      title: "바람 소음 대비 - 수업 집중도 관리",
      content: "강한 바람 소리로 인해 수업 집중도가 떨어질 수 있습니다. 목소리를 조금 더 크게 하시거나, 시청각 자료를 활용하여 학생들의 주의를 집중시켜 주시기 바랍니다.",
      category: "학교활동",
      priority: 3,
      icon: "📢"
    },
    {
      title: "먼지 주의 - 황사와 함께하는 강풍",
      content: "강풍과 함께 먼지나 황사가 날릴 수 있습니다. 창문을 닫아 실내 공기질을 관리하시고, 학생들에게 마스크 착용을 권장해 주시기 바랍니다.",
      category: "건강",
      priority: 2,
      icon: "😷"
    },
    {
      title: "강풍 체험 학습 - 날씨 현상 이해",
      content: "안전한 실내에서 강풍 현상을 관찰하며 학습해 보세요. 바람의 원리, 기압 차이, 날씨 변화 등을 주제로 과학 수업을 진행하면 좋은 교육 기회가 될 것입니다.",
      category: "학교활동",
      priority: 3,
      icon: "🌪️"
    },
    {
      title: "강풍 후 정리 - 환경 정화 활동",
      content: "강풍이 지나간 후 교내에 나뭇잎이나 쓰레기가 많이 날려올 수 있습니다. 학생들과 함께 교내 환경 정화 활동을 통해 깨끗한 학교 만들기에 참여해 주시기 바랍니다.",
      category: "학교활동",
      priority: 3,
      icon: "🧹"
    }
  ],

  // 고습도 조건 (80% 이상)
  humid_weather: [
    {
      title: "고습도 주의 - 교실 제습 및 환기 관리",
      content: "습도가 80% 이상으로 매우 높습니다. 제습기를 가동하고 자주 환기를 실시해 주시기 바랍니다. 학생들이 답답함을 호소할 경우 즉시 조치를 취해주세요.",
      category: "생활",
      priority: 2,
      icon: "💧"
    },
    {
      title: "습도 과다 - 곰팡이 및 세균 번식 주의",
      content: "높은 습도로 인해 곰팡이와 세균이 번식하기 쉬운 환경입니다. 교실 구석구석 습기가 차지 않도록 주의하시고, 특히 사물함이나 책꽂이 뒤쪽을 점검해 주시기 바랍니다.",
      category: "건강",
      priority: 2,
      icon: "🦠"
    },
    {
      title: "무더위 습도 - 열대야 현상 대비",
      content: "고온다습한 날씨로 열대야 현상이 나타날 수 있습니다. 학생들의 수면 부족을 고려하여 수업 진행 속도를 조절하시고, 충분한 휴식시간을 제공해 주시기 바랍니다.",
      category: "건강",
      priority: 2,
      icon: "🌙"
    },
    {
      title: "습기 제거 - 책과 교구 보관 관리",
      content: "높은 습도로 책이나 종이류가 눅눅해질 수 있습니다. 중요한 서류나 교구는 건조한 곳에 보관하시고, 제습제를 활용하여 습기를 제거해 주시기 바랍니다.",
      category: "생활",
      priority: 3,
      icon: "📚"
    },
    {
      title: "끈적한 날씨 - 개인위생 관리 강화",
      content: "습도가 높아 끈적끈적한 느낌이 들 수 있습니다. 학생들에게 손 씻기, 얼굴 닦기 등 개인위생 관리를 더욱 철저히 하도록 지도해 주시기 바랍니다.",
      category: "건강",
      priority: 2,
      icon: "🧼"
    },
    {
      title: "고습도 스트레스 - 심리적 안정감 제공",
      content: "끈적하고 답답한 날씨로 학생들이 스트레스를 받을 수 있습니다. 평소보다 인내심을 갖고 따뜻하게 대해주시며, 시원한 물이나 차를 제공해 주시기 바랍니다.",
      category: "건강",
      priority: 3,
      icon: "😌"
    }
  ],

  // 일반 날씨 (온화한 날씨)
  normal_weather: [
    {
      title: "쾌적한 날씨 - 야외 교육활동 추천",
      content: "오늘은 야외활동하기 좋은 날씨입니다. 자연 관찰, 운동장 체육활동, 산책 등을 통해 학생들이 자연과 함께할 수 있는 시간을 가져보시기 바랍니다.",
      category: "학교활동",
      priority: 3,
      icon: "🌤️"
    },
    {
      title: "좋은 날씨 - 교실 환기 및 자연 학습 기회",
      content: "맑고 온화한 날씨로 교실 환기에 최적의 조건입니다. 창문을 활짝 열어 신선한 공기를 들이시고, 날씨와 계절 변화를 주제로 한 학습 기회로 활용해 보시기 바랍니다.",
      category: "생활",
      priority: 3,
      icon: "🌱"
    },
    {
      title: "완벽한 소풍날 - 야외 수업 계획",
      content: "소풍이나 현장체험학습하기에 완벽한 날씨입니다. 가능하다면 일부 수업을 야외에서 진행해 보시거나, 향후 야외 활동 계획을 세워보시기 바랍니다.",
      category: "학교활동",
      priority: 3,
      icon: "🎒"
    },
    {
      title: "건강한 하루 - 신체활동 활성화",
      content: "날씨가 좋아 신체활동하기에 최적입니다. 쉬는 시간에 운동장에서 뛰어놀기, 체육 시간 연장, 간단한 산책 등을 통해 학생들의 건강을 증진시켜 주시기 바랍니다.",
      category: "건강",
      priority: 3,
      icon: "🏃‍♀️"
    },
    {
      title: "맑은 하늘 - 천체 관측 기회",
      content: "맑은 날씨로 하늘 관찰하기에 좋습니다. 구름 모양 관찰, 태양의 위치 변화, 계절별 별자리 등을 주제로 한 과학 수업을 진행해 보시기 바랍니다.",
      category: "학교활동",
      priority: 3,
      icon: "🌟"
    },
    {
      title: "상쾌한 아침 - 에너지 충전 시간",
      content: "상쾌한 날씨로 학습 의욕이 높아질 것 같습니다. 학생들과 함께 깊은 숨을 들이마시며 하루를 시작하고, 긍정적인 에너지로 수업에 임해 주시기 바랍니다.",
      category: "건강",
      priority: 3,
      icon: "😊"
    }
  ],

  // 미세먼지 조건 (새로 추가)
  dusty_weather: [
    {
      title: "미세먼지 나쁨 - 실외활동 금지",
      content: "오늘 미세먼지 농도가 '나쁨' 수준입니다. 모든 실외 수업과 활동을 실내로 변경해 주시고, 창문을 닫아 실내 공기질을 관리해 주시기 바랍니다.",
      category: "건강",
      priority: 1,
      icon: "😷"
    },
    {
      title: "황사 주의보 - 마스크 착용 권장",
      content: "황사 현상으로 대기 중 먼지가 많습니다. 학생들에게 마스크 착용을 권장하시고, 눈이나 목이 따가울 경우 즉시 실내로 들어오도록 지도해 주시기 바랍니다.",
      category: "건강",
      priority: 1,
      icon: "🌫️"
    },
    {
      title: "공기질 관리 - 공기청정기 가동",
      content: "미세먼지로 인해 실내 공기질 관리가 중요합니다. 교실 공기청정기를 가동하시고, 학생들이 기침이나 목 아픔을 호소할 경우 충분한 수분 섭취를 하도록 안내해 주세요.",
      category: "건강",
      priority: 2,
      icon: "💨"
    }
  ],

  // 폭우 조건 (강수량 20mm 이상)
  heavy_rain: [
    {
      title: "폭우 경보 - 침수 지역 우회 안내",
      content: "시간당 20mm 이상의 폭우가 내리고 있습니다. 학교 주변 침수 위험 지역을 파악하시고, 안전한 등하교 경로를 학생들에게 안내해 주시기 바랍니다.",
      category: "안전",
      priority: 1,
      icon: "🌊"
    },
    {
      title: "집중호우 - 하수구 역류 주의",
      content: "집중호우로 하수구 역류가 발생할 수 있습니다. 학교 화장실과 배수구 주변을 점검하시고, 이상이 있을 경우 즉시 관리실에 신고해 주시기 바랍니다.",
      category: "안전",
      priority: 1,
      icon: "�"
    }
  ]
};
};

// 날씨 조건에 따른 Notice 생성 함수
export function getWeatherNotices(conditions: WeatherConditions): Notice[] {
  const notices: Notice[] = [];
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];

  // 온도 기반 Notice 선택 (더 세분화)
  if (conditions.temperature >= 33) {
    // 폭염 (33도 이상)
    const hotNotices = WEATHER_NOTICES.hot_weather.filter(notice => notice.priority === 1);
    if (hotNotices.length > 0) {
      const selectedNotice = hotNotices[Math.floor(Math.random() * hotNotices.length)];
      notices.push({ ...selectedNotice, date: dateString });
    }
  } else if (conditions.temperature >= 28) {
    // 고온 (28-32도)
    const hotNotices = WEATHER_NOTICES.hot_weather;
    const selectedNotice = hotNotices[Math.floor(Math.random() * hotNotices.length)];
    notices.push({ ...selectedNotice, date: dateString });
  } else if (conditions.temperature <= 0) {
    // 혹한 (0도 이하)
    const coldNotices = WEATHER_NOTICES.cold_weather.filter(notice => notice.priority === 1);
    if (coldNotices.length > 0) {
      const selectedNotice = coldNotices[Math.floor(Math.random() * coldNotices.length)];
      notices.push({ ...selectedNotice, date: dateString });
    }
  } else if (conditions.temperature <= 5) {
    // 추위 (5도 이하)
    const coldNotices = WEATHER_NOTICES.cold_weather;
    const selectedNotice = coldNotices[Math.floor(Math.random() * coldNotices.length)];
    notices.push({ ...selectedNotice, date: dateString });
  }

  // 강수 기반 Notice 선택 (더 세분화)
  if (conditions.precipitation >= 20) {
    // 폭우 (20mm 이상)
    const heavyRainNotices = WEATHER_NOTICES.heavy_rain;
    const selectedNotice = heavyRainNotices[Math.floor(Math.random() * heavyRainNotices.length)];
    notices.push({ ...selectedNotice, date: dateString });
  } else if (conditions.precipitation > 0) {
    if (conditions.precipitationType === 'snow') {
      const snowNotices = WEATHER_NOTICES.snowy_weather;
      const selectedNotice = snowNotices[Math.floor(Math.random() * snowNotices.length)];
      notices.push({ ...selectedNotice, date: dateString });
    } else if (conditions.precipitationType === 'rain') {
      const rainNotices = WEATHER_NOTICES.rainy_weather;
      const selectedNotice = rainNotices[Math.floor(Math.random() * rainNotices.length)];
      notices.push({ ...selectedNotice, date: dateString });
    }
  }

  // 풍속 기반 Notice 선택
  if (conditions.windSpeed >= 14) {
    // 강풍 (14m/s 이상) - 태풍급
    const windyNotices = WEATHER_NOTICES.windy_weather.filter(notice => notice.priority === 1);
    if (windyNotices.length > 0) {
      const selectedNotice = windyNotices[Math.floor(Math.random() * windyNotices.length)];
      notices.push({ ...selectedNotice, date: dateString });
    }
  } else if (conditions.windSpeed >= 10) {
    // 강풍 (10m/s 이상)
    const windyNotices = WEATHER_NOTICES.windy_weather;
    const selectedNotice = windyNotices[Math.floor(Math.random() * windyNotices.length)];
    notices.push({ ...selectedNotice, date: dateString });
  }

  // 습도 기반 Notice 선택
  if (conditions.humidity >= 85) {
    // 매우 높은 습도 (85% 이상)
    const humidNotices = WEATHER_NOTICES.humid_weather.filter(notice => notice.priority <= 2);
    if (humidNotices.length > 0) {
      const selectedNotice = humidNotices[Math.floor(Math.random() * humidNotices.length)];
      notices.push({ ...selectedNotice, date: dateString });
    }
  } else if (conditions.humidity >= 80) {
    // 높은 습도 (80% 이상)
    const humidNotices = WEATHER_NOTICES.humid_weather;
    const selectedNotice = humidNotices[Math.floor(Math.random() * humidNotices.length)];
    notices.push({ ...selectedNotice, date: dateString });
  }

  // 미세먼지 조건 (향후 API 연동 시 활용)
  // if (conditions.dustLevel && conditions.dustLevel >= 76) {
  //   const dustyNotices = WEATHER_NOTICES.dusty_weather;
  //   const selectedNotice = dustyNotices[Math.floor(Math.random() * dustyNotices.length)];
  //   notices.push({ ...selectedNotice, date: dateString });
  // }

  // 특별한 조건이 없으면 일반 날씨 Notice
  if (notices.length === 0) {
    const normalNotices = WEATHER_NOTICES.normal_weather;
    const selectedNotice = normalNotices[Math.floor(Math.random() * normalNotices.length)];
    notices.push({ ...selectedNotice, date: dateString });
  }

  // 복합 조건일 경우 최대 3개까지만 선택
  const maxNotices = 3;
  const selectedNotices = notices.slice(0, maxNotices);

  // 우선순위에 따라 정렬 (1이 가장 높음)
  return selectedNotices.sort((a, b) => a.priority - b.priority);
}

// 특정 조건에 맞는 모든 Notice 가져오기 (미리보기용)
export function getAllNoticesForCondition(conditionType: string): Notice[] {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  
  if (conditionType in WEATHER_NOTICES) {
    return WEATHER_NOTICES[conditionType as keyof typeof WEATHER_NOTICES].map(notice => ({
      ...notice,
      date: dateString
    }));
  }
  
  return [];
}

// 사용 가능한 모든 조건 타입 반환
export function getAvailableConditions(): string[] {
  return Object.keys(WEATHER_NOTICES);
}
