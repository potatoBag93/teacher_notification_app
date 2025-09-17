import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeatherRequest {
  location: string;
  detailLocation?: string;
}

interface WeatherResponse {
  location: string;
  temperature: number;
  condition: string;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  rainProbability?: number;
  alerts?: string;
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

    const { location, detailLocation }: WeatherRequest = await req.json()

    if (!location) {
      return new Response(
        JSON.stringify({ success: false, error: '지역 정보가 필요합니다.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 기상청 API 호출을 위한 지역 코드 매핑
    const regionCodes = {
      '서울': '11B00000',
      '인천': '11B00000',
      '경기': '11B00000',
      '강원': '11D10000',
      '충북': '11C10000',
      '충남': '11C20000',
      '대전': '11C20000',
      '세종': '11C20000',
      '전북': '11F10000',
      '전남': '11F20000',
      '광주': '11F20000',
      '경북': '11H10000',
      '경남': '11H20000',
      '대구': '11H10000',
      '울산': '11H20000',
      '부산': '11H20000',
      '제주': '11G00000'
    };

    const regionCode = regionCodes[location as keyof typeof regionCodes];
    
    if (!regionCode) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `지원하지 않는 지역입니다: ${location}` 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 기상청 API 설정
    const SERVICE_KEY = Deno.env.get('KMA_API_KEY');
    if (!SERVICE_KEY) {
      console.error('기상청 API 키가 설정되지 않았습니다.');
      
      // 개발용 더미 데이터 반환
      const dummyWeather: WeatherResponse = {
        location: detailLocation ? `${location} ${detailLocation}` : location,
        temperature: Math.floor(Math.random() * 30) + 5, // 5-35도
        condition: ['맑음', '구름많음', '흐림', '비', '눈'][Math.floor(Math.random() * 5)],
        feelsLike: Math.floor(Math.random() * 30) + 5,
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 10) + 1, // 1-10 m/s
        rainProbability: Math.floor(Math.random() * 100), // 0-100%
      };

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

    // 기상청 단기예보 API 호출
    const now = new Date();
    const baseDate = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const baseTime = '0500'; // 05시 발표 기준

    const weatherApiUrl = new URL('http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst');
    weatherApiUrl.searchParams.append('serviceKey', SERVICE_KEY);
    weatherApiUrl.searchParams.append('numOfRows', '10');
    weatherApiUrl.searchParams.append('pageNo', '1');
    weatherApiUrl.searchParams.append('dataType', 'JSON');
    weatherApiUrl.searchParams.append('base_date', baseDate);
    weatherApiUrl.searchParams.append('base_time', baseTime);
    weatherApiUrl.searchParams.append('nx', '55'); // 서울 기준 격자 X
    weatherApiUrl.searchParams.append('ny', '127'); // 서울 기준 격자 Y

    console.log('기상청 API 호출:', weatherApiUrl.toString());

    const weatherResponse = await fetch(weatherApiUrl.toString());
    const weatherData = await weatherResponse.json();

    console.log('기상청 API 응답:', JSON.stringify(weatherData, null, 2));

    // API 응답 처리
    if (!weatherData.response?.body?.items?.item) {
      console.error('기상청 API 응답 형식 오류:', weatherData);
      
      // 기본 더미 데이터 반환
      const fallbackWeather: WeatherResponse = {
        location: detailLocation ? `${location} ${detailLocation}` : location,
        temperature: 15,
        condition: '맑음',
        feelsLike: 15,
        humidity: 60,
        windSpeed: 2,
        rainProbability: 20,
      };

      return new Response(
        JSON.stringify({
          success: true,
          weather: fallbackWeather,
          note: 'API 오류로 인한 기본 데이터입니다.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 기상 데이터 파싱
    const items = weatherData.response.body.items.item;
    const weatherInfo: any = {};

    for (const item of items) {
      switch (item.category) {
        case 'T1H': // 기온
          weatherInfo.temperature = parseFloat(item.obsrValue);
          break;
        case 'RN1': // 1시간 강수량
          weatherInfo.rainfall = parseFloat(item.obsrValue);
          break;
        case 'UUU': // 동서바람성분
          weatherInfo.windU = parseFloat(item.obsrValue);
          break;
        case 'VVV': // 남북바람성분
          weatherInfo.windV = parseFloat(item.obsrValue);
          break;
        case 'REH': // 습도
          weatherInfo.humidity = parseFloat(item.obsrValue);
          break;
        case 'PTY': // 강수형태
          weatherInfo.precipitationType = parseInt(item.obsrValue);
          break;
        case 'VEC': // 풍향
          weatherInfo.windDirection = parseFloat(item.obsrValue);
          break;
        case 'WSD': // 풍속
          weatherInfo.windSpeed = parseFloat(item.obsrValue);
          break;
      }
    }

    // 날씨 상태 결정
    let condition = '맑음';
    if (weatherInfo.precipitationType) {
      switch (weatherInfo.precipitationType) {
        case 1: condition = '비'; break;
        case 2: condition = '비/눈'; break;
        case 3: condition = '눈'; break;
        case 4: condition = '소나기'; break;
      }
    } else if (weatherInfo.humidity > 80) {
      condition = '흐림';
    } else if (weatherInfo.humidity > 60) {
      condition = '구름많음';
    }

    // 체감온도 계산 (간단한 공식 사용)
    const windSpeedKmh = (weatherInfo.windSpeed || 0) * 3.6;
    const feelsLike = weatherInfo.temperature - (windSpeedKmh * 0.2);

    const weather: WeatherResponse = {
      location: detailLocation ? `${location} ${detailLocation}` : location,
      temperature: weatherInfo.temperature || 15,
      condition: condition,
      feelsLike: Math.round(feelsLike * 10) / 10,
      humidity: weatherInfo.humidity,
      windSpeed: weatherInfo.windSpeed,
      rainProbability: weatherInfo.rainfall > 0 ? 80 : 20, // 간단한 강수확률 추정
    };

    // 기상특보 체크 (간단한 조건으로)
    const alerts: string[] = [];
    if (weather.temperature >= 35) alerts.push('폭염주의보');
    if (weather.temperature <= -10) alerts.push('한파주의보');
    if (weather.windSpeed && weather.windSpeed >= 10) alerts.push('강풍주의보');
    if (weatherInfo.rainfall > 20) alerts.push('호우주의보');

    if (alerts.length > 0) {
      weather.alerts = alerts.join(', ');
    }

    return new Response(
      JSON.stringify({
        success: true,
        weather: weather
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
