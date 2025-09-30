import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { convertLatLngToGrid, isKoreaRegion } from "./coordinate-converter.ts"
import { getWeatherNotices } from "./weather-notices.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeatherRequest {
  lat: number;  // 위도 (필수)
  lng: number;  // 경도 (필수)
  address?: string;
}

interface WeatherItem {
  category: string;
  baseDate: string;
  baseTime: string;
  obsrValue: string;  // 실황값
}

interface WeatherInfo {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  skyCondition: string;
  skyDescription: string;
  precipitationType: string;
  precipitationDescription: string;
  date: string;
  time: string;
  gridX: number;
  gridY: number;
  address?: string;
  notices?: Array<{
    title: string;
    content: string;
    date: string;
    category: string;
    priority: number;
    icon: string;
  }>;
}

// 하늘 상태 코드 변환
function getSkyDescription(skyCode: string): { condition: string; description: string } {
  switch (skyCode) {
    case '1': return { condition: 'clear', description: '맑음' };
    case '3': return { condition: 'partly_cloudy', description: '구름많음' };
    case '4': return { condition: 'cloudy', description: '흐림' };
    default: return { condition: 'unknown', description: '정보없음' };
  }
}

// 강수 형태 코드 변환
function getPrecipitationDescription(ptyCode: string): { type: string; description: string } {
  switch (ptyCode) {
    case '0': return { type: 'none', description: '없음' };
    case '1': return { type: 'rain', description: '비' };
    case '2': return { type: 'rain_snow', description: '비/눈' };
    case '3': return { type: 'snow', description: '눈' };
    case '5': return { type: 'rain', description: '빗방울' };
    case '6': return { type: 'rain_snow', description: '빗방울눈날림' };
    case '7': return { type: 'snow', description: '눈날림' };
    default: return { type: 'unknown', description: '정보없음' };
  }
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

    const { lat, lng, address }: WeatherRequest = await req.json()

    // 위경도 유효성 검사
    if (lat === undefined || lng === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: '위도(lat)와 경도(lng) 정보가 필요합니다.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!isKoreaRegion(lat, lng)) {
      return new Response(
        JSON.stringify({ success: false, error: '한반도 영역이 아닙니다.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // 위경도를 격자 좌표로 변환
    const gridCoords = convertLatLngToGrid(lat, lng);
    const finalGridX = gridCoords.nx;
    const finalGridY = gridCoords.ny;
    console.log(`위경도 (${lat}, ${lng}) → 격자좌표 (${finalGridX}, ${finalGridY}) 변환`);

    console.log(`날씨 조회 요청: 격자좌표 (${finalGridX}, ${finalGridY})${address ? `, 주소: ${address}` : ''}`);

    // 기상청 API 키
    // @ts-ignore: Deno is available in Supabase Edge Functions
    const WEATHER_API_KEY = Deno.env.get('KMA_API_KEY');
    
    if (!WEATHER_API_KEY) {
      console.error('기상청 API 키가 설정되지 않았습니다.');
      
      // 개발용 더미 데이터 반환
      const dummyWeather: WeatherInfo = {
        temperature: Math.floor(Math.random() * 15) + 10, // 10-24도
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        precipitation: Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0, // 30% 확률로 강수
        windSpeed: Math.floor(Math.random() * 5) + 1, // 1-5m/s
        skyCondition: ['clear', 'partly_cloudy', 'cloudy'][Math.floor(Math.random() * 3)],
        skyDescription: ['맑음', '구름많음', '흐림'][Math.floor(Math.random() * 3)],
        precipitationType: 'none',
        precipitationDescription: '없음',
        date: new Date().toISOString().slice(0, 8),
        time: new Date().getHours().toString().padStart(2, '0') + '00',
        gridX: finalGridX,
        gridY: finalGridY,
        address: address
      };

      // 더미 데이터도 Notice 생성
      const dummyNotices = getWeatherNotices({
        temperature: dummyWeather.temperature,
        humidity: dummyWeather.humidity,
        precipitation: dummyWeather.precipitation,
        windSpeed: dummyWeather.windSpeed,
        precipitationType: dummyWeather.precipitationType
      });
      dummyWeather.notices = dummyNotices;

      return new Response(
        JSON.stringify({
          success: true,
          weather: dummyWeather,
          note: '개발 모드: 더미 데이터입니다.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 현재 날짜와 시간 설정 (한국 시간 기준)
    const now = new Date();
    const kstOffset = 9 * 60; // 한국은 UTC+9
    const kstTime = new Date(now.getTime() + kstOffset * 60 * 1000);
    
    const baseDate = kstTime.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 초단기실황은 매시 40분에 발표되므로, 가장 최근 발표 시각을 찾아야 함
    let baseTime: string;
    const currentMinute = kstTime.getMinutes();
    const currentHour = kstTime.getHours();
    
    if (currentMinute >= 40) {
      // 현재 시간의 40분이 지났으면 현재 시간 사용 (예: 22:45 → 22:30 실황)
      baseTime = String(currentHour).padStart(2, '0') + '30';
    } else {
      // 현재 시간의 40분이 안 지났으면 이전 시간 사용 (예: 22:29 → 21:30 실황)
      const prevHour = currentHour === 0 ? 23 : currentHour - 1;
      baseTime = String(prevHour).padStart(2, '0') + '30';
    }
    
    console.log(`초단기실황 요청 (KST): ${baseDate} ${baseTime} (현재: ${kstTime.getHours()}:${String(kstTime.getMinutes()).padStart(2, '0')})`);

    // 기상청 초단기실황 API 호출 (현재 날씨)
    const apiUrl = new URL('http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst');
    apiUrl.searchParams.append('serviceKey', WEATHER_API_KEY);
    apiUrl.searchParams.append('pageNo', '1');
    apiUrl.searchParams.append('numOfRows', '1000');
    apiUrl.searchParams.append('dataType', 'JSON');
    apiUrl.searchParams.append('base_date', baseDate);
    apiUrl.searchParams.append('base_time', baseTime);
    apiUrl.searchParams.append('nx', finalGridX.toString());
    apiUrl.searchParams.append('ny', finalGridY.toString());

    console.log('기상청 초단기실황 API 호출:', apiUrl.toString());

    const response = await fetch(apiUrl.toString());

    // Check if the response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error('기상청 API에서 JSON이 아닌 응답 수신:', errorText);
      throw new Error(`기상청 API에서 예상치 못한 응답 형식 수신 (Content-Type: ${contentType}). 응답 내용: ${errorText.substring(0, 200)}...`);
    }

    const data = await response.json();

    console.log('기상청 API 응답 헤더:', data.response?.header);

    if (data.response?.header?.resultCode !== '00') {
      throw new Error(`기상청 API 오류: ${data.response?.header?.resultMsg || '알 수 없는 오류'}`);
    }

    const items: WeatherItem[] = data.response?.body?.items?.item || [];
    
    if (items.length === 0) {
      throw new Error('날씨 데이터를 찾을 수 없습니다.');
    }

    console.log(`초단기실황 데이터 ${items.length}개 수신`);

    // 현재 시각 기준 실황 데이터 처리
    const weatherData = {
      T1H: '', // 기온
      REH: '', // 습도
      RN1: '', // 1시간 강수량
      WSD: '', // 풍속
      VEC: '', // 풍향
      PTY: '', // 강수형태
    };

    // 실황 데이터 수집 (최신 데이터 사용)
    for (const item of items) {
      if (item.category in weatherData && !weatherData[item.category as keyof typeof weatherData]) {
        weatherData[item.category as keyof typeof weatherData] = item.obsrValue;
      }
    }

    // 필요한 데이터가 없으면 첫 번째 데이터 사용
    if (!weatherData.T1H) {
      for (const item of items) {
        if (item.category in weatherData && !weatherData[item.category as keyof typeof weatherData]) {
          weatherData[item.category as keyof typeof weatherData] = item.obsrValue;
        }
      }
    }

    // 하늘상태는 실황에 없으므로 강수형태로 추정
    const getSkyFromPrecipitation = (ptyCode: string) => {
      if (ptyCode === '0') return { condition: 'clear', description: '맑음' };
      if (ptyCode === '1' || ptyCode === '5') return { condition: 'rainy', description: '비' };
      if (ptyCode === '3' || ptyCode === '7') return { condition: 'snowy', description: '눈' };
      return { condition: 'cloudy', description: '흐림' };
    };

    const skyInfo = getSkyFromPrecipitation(weatherData.PTY);
    const precipitationInfo = getPrecipitationDescription(weatherData.PTY);

    const weatherInfo: WeatherInfo = {
      temperature: parseFloat(weatherData.T1H) || 0,
      humidity: parseFloat(weatherData.REH) || 0,
      precipitation: weatherData.RN1 === '강수없음' ? 0 : parseFloat(weatherData.RN1.replace('mm', '')) || 0,
      windSpeed: parseFloat(weatherData.WSD) || 0,
      skyCondition: skyInfo.condition,
      skyDescription: skyInfo.description,
      precipitationType: precipitationInfo.type,
      precipitationDescription: precipitationInfo.description,
      date: baseDate,
      time: baseTime,
      gridX: finalGridX,
      gridY: finalGridY,
      address: address
    };

    // 날씨 데이터 기반 Notice 생성
    const weatherNotices = getWeatherNotices({
      temperature: weatherInfo.temperature,
      humidity: weatherInfo.humidity,
      precipitation: weatherInfo.precipitation,
      windSpeed: weatherInfo.windSpeed,
      precipitationType: weatherInfo.precipitationType
    });

    // Notice를 응답에 추가
    weatherInfo.notices = weatherNotices;

    console.log('변환된 날씨 정보:', weatherInfo);

    return new Response(
      JSON.stringify({
        success: true,
        weather: weatherInfo,
        rawData: {
          itemCount: items.length,
          baseDate: baseDate,
          baseTime: baseTime,
          gridCoords: { nx: finalGridX, ny: finalGridY }
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('날씨 조회 중 오류:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: '날씨 정보를 가져오는 중 오류가 발생했습니다.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
