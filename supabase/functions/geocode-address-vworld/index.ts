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

    console.log('🌍 V-world 주소 변환 요청:', address);

    // V-world 지오코딩 API 키
    const VWORLD_API_KEY = Deno.env.get('VWORLD_API_KEY');
    
    if (!VWORLD_API_KEY) {
      console.log('⚠️ V-world API 키가 설정되지 않았습니다. 더미 데이터로 응답합니다.');
      
      // 개발용 더미 데이터 반환 (지역별 다양화)
      const regionKeywords = [
        { keyword: '서울', lat: 37.5665, lng: 126.9780, nx: 60, ny: 127 },
        { keyword: '부산', lat: 35.1796, lng: 129.0756, nx: 98, ny: 76 },
        { keyword: '대구', lat: 35.8714, lng: 128.6014, nx: 89, ny: 90 },
        { keyword: '인천', lat: 37.4563, lng: 126.7052, nx: 55, ny: 124 },
        { keyword: '광주', lat: 35.1595, lng: 126.8526, nx: 58, ny: 74 },
        { keyword: '대전', lat: 36.3504, lng: 127.3845, nx: 67, ny: 100 },
        { keyword: '울산', lat: 35.5384, lng: 129.3114, nx: 102, ny: 84 },
        { keyword: '경기', lat: 37.4138, lng: 127.5183, nx: 62, ny: 120 },
        { keyword: '강원', lat: 37.8228, lng: 128.1555, nx: 73, ny: 134 },
        { keyword: '충북', lat: 36.6356, lng: 127.4917, nx: 69, ny: 107 },
        { keyword: '충남', lat: 36.5184, lng: 126.8000, nx: 68, ny: 100 },
        { keyword: '전북', lat: 35.7175, lng: 127.1530, nx: 63, ny: 89 },
        { keyword: '전남', lat: 34.8679, lng: 126.9910, nx: 51, ny: 67 },
        { keyword: '경북', lat: 36.4919, lng: 128.8889, nx: 87, ny: 106 },
        { keyword: '경남', lat: 35.4606, lng: 128.2132, nx: 91, ny: 77 },
        { keyword: '제주', lat: 33.4996, lng: 126.5312, nx: 52, ny: 38 }
      ];

      const foundRegion = regionKeywords.find(region => address.includes(region.keyword));
      const selectedRegion = foundRegion || regionKeywords[0]; // 기본값 서울

      const dummyLocation: LocationResponse = {
        address: address,
        latitude: selectedRegion.lat + (Math.random() - 0.5) * 0.02,
        longitude: selectedRegion.lng + (Math.random() - 0.5) * 0.02,
        gridX: selectedRegion.nx + Math.floor(Math.random() * 3) - 1,
        gridY: selectedRegion.ny + Math.floor(Math.random() * 3) - 1
      };

      return new Response(
        JSON.stringify({
          success: true,
          location: dummyLocation,
          note: `개발 모드: ${selectedRegion.keyword} 지역 더미 데이터입니다.`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // V-world 지오코딩 API 호출
    const vworldApiUrl = new URL('https://api.vworld.kr/req/address');
    vworldApiUrl.searchParams.append('service', 'address');
    vworldApiUrl.searchParams.append('request', 'getCoord');
    vworldApiUrl.searchParams.append('version', '2.0');
    vworldApiUrl.searchParams.append('crs', 'epsg:4326');
    vworldApiUrl.searchParams.append('address', address);
    vworldApiUrl.searchParams.append('refine', 'true');
    vworldApiUrl.searchParams.append('simple', 'false');
    vworldApiUrl.searchParams.append('format', 'json');
    vworldApiUrl.searchParams.append('type', 'ROAD');
    vworldApiUrl.searchParams.append('key', VWORLD_API_KEY);

    console.log('🔗 V-world API 호출:', vworldApiUrl.toString());

    const vworldResponse = await fetch(vworldApiUrl.toString());
    
    if (!vworldResponse.ok) {
      throw new Error(`V-world API HTTP 오류: ${vworldResponse.status}`);
    }

    const vworldData = await vworldResponse.json();
    console.log('📝 V-world API 응답:', JSON.stringify(vworldData, null, 2));

    // API 응답 처리
    if (vworldData.response?.status !== 'OK') {
      return new Response(
        JSON.stringify({
          success: false,
          error: `주소를 찾을 수 없습니다. (${vworldData.response?.status})`,
          address: address,
          vworldError: vworldData.response?.error
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!vworldData.response?.result?.point) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '좌표 정보를 찾을 수 없습니다.',
          address: address
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // V-world 응답에서 좌표 추출
    const point = vworldData.response.result.point;
    const latitude = parseFloat(point.y);
    const longitude = parseFloat(point.x);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('유효하지 않은 좌표 값');
    }

    // 위도/경도를 기상청 격자 좌표로 변환
    const gridCoords = convertToGrid(latitude, longitude);

    const location: LocationResponse = {
      address: vworldData.response.refined?.text || address,
      latitude: latitude,
      longitude: longitude,
      gridX: gridCoords.nx,
      gridY: gridCoords.ny
    };

    console.log('✅ 변환된 위치 정보:', location);

    return new Response(
      JSON.stringify({
        success: true,
        location: location,
        vworldResult: {
          refinedAddress: vworldData.response.refined?.text,
          structure: vworldData.response.refined?.structure,
          originalCrs: vworldData.response.result.crs,
          inputAddress: vworldData.response.input?.address
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ 주소 변환 중 오류:', error);
    
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
