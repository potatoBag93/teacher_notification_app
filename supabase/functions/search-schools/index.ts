import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SchoolSearchRequest {
  schoolName?: string;
  sidoCode?: string;
  schoolType?: string;
  limit?: number;
}

interface SchoolInfo {
  ATPT_OFCDC_SC_CODE: string;    // 교육청코드
  SD_SCHUL_CODE: string;         // 학교코드
  SCHUL_NM: string;              // 학교명
  ENG_SCHUL_NM?: string;         // 영문학교명
  SCHUL_KND_SC_NM: string;       // 학교급명
  LCTN_SC_NM: string;            // 시도명
  JU_ORG_NM?: string;            // 관할기관명
  ORG_RDNMA?: string;            // 도로명주소
  ORG_RDNZC?: string;            // 우편번호
  ORG_TELNO?: string;            // 전화번호
  HMPG_ADRES?: string;           // 홈페이지주소
  COEDU_SC_NM?: string;          // 남녀공학구분명
  ORG_FAXNO?: string;            // 팩스번호
  HS_SC_NM?: string;             // 고등학교구분명
  INDST_SPECL_CCCCL_EXST_YN?: string; // 산업체특별학급존재여부
  HS_GNRL_BUSNS_SC_NM?: string;  // 고등학교일반실업구분명
  SPCLY_PURPS_HS_ORD_NM?: string; // 특수목적고등학교계열명
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

    const { schoolName, sidoCode, schoolType, limit = 10 }: SchoolSearchRequest = await req.json()

    // 최소한의 검색 조건 확인
    if (!schoolName && !sidoCode) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '학교명 또는 시도코드 중 하나는 필수입니다.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 교육부 나이스 API 키
    const NEIS_API_KEY = Deno.env.get('NEIS_API_KEY');
    
    if (!NEIS_API_KEY) {
      console.error('교육부 API 키가 설정되지 않았습니다.');
      
      // 개발용 더미 데이터 반환
      const dummySchools: SchoolInfo[] = [
        {
          ATPT_OFCDC_SC_CODE: "B10",
          SD_SCHUL_CODE: "7010569",
          SCHUL_NM: "서울초등학교",
          ENG_SCHUL_NM: "Seoul Elementary School",
          SCHUL_KND_SC_NM: "초등학교",
          LCTN_SC_NM: "서울특별시",
          JU_ORG_NM: "서울특별시강남구청",
          ORG_RDNMA: "서울특별시 강남구 테헤란로 123",
          ORG_RDNZC: "06234",
          ORG_TELNO: "02-1234-5678"
        },
        {
          ATPT_OFCDC_SC_CODE: "B10",
          SD_SCHUL_CODE: "7010570",
          SCHUL_NM: "서울중학교",
          ENG_SCHUL_NM: "Seoul Middle School",
          SCHUL_KND_SC_NM: "중학교",
          LCTN_SC_NM: "서울특별시",
          JU_ORG_NM: "서울특별시강남구청",
          ORG_RDNMA: "서울특별시 강남구 강남대로 456",
          ORG_RDNZC: "06235",
          ORG_TELNO: "02-2345-6789"
        },
        {
          ATPT_OFCDC_SC_CODE: "B10",
          SD_SCHUL_CODE: "7010571",
          SCHUL_NM: "서울고등학교",
          ENG_SCHUL_NM: "Seoul High School",
          SCHUL_KND_SC_NM: "고등학교",
          LCTN_SC_NM: "서울특별시",
          JU_ORG_NM: "서울특별시강남구청",
          ORG_RDNMA: "서울특별시 강남구 역삼로 789",
          ORG_RDNZC: "06236",
          ORG_TELNO: "02-3456-7890"
        }
      ];

      // 검색 조건에 따른 필터링
      let filteredSchools = dummySchools;
      
      if (schoolName) {
        filteredSchools = filteredSchools.filter(school => 
          school.SCHUL_NM.includes(schoolName)
        );
      }
      
      if (schoolType) {
        const typeMap = {
          '1': '유치원',
          '2': '초등학교', 
          '3': '중학교',
          '4': '고등학교'
        };
        const typeName = typeMap[schoolType as keyof typeof typeMap];
        if (typeName) {
          filteredSchools = filteredSchools.filter(school => 
            school.SCHUL_KND_SC_NM === typeName
          );
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          schools: filteredSchools.slice(0, limit),
          note: '개발 모드: 더미 데이터입니다.',
          totalCount: filteredSchools.length
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 나이스 API URL 구성
    const apiUrl = new URL('https://open.neis.go.kr/hub/schoolInfo');
    apiUrl.searchParams.append('KEY', NEIS_API_KEY);
    apiUrl.searchParams.append('Type', 'json');
    apiUrl.searchParams.append('pIndex', '1');
    apiUrl.searchParams.append('pSize', limit.toString());

    // 검색 조건 추가
    if (schoolName) {
      apiUrl.searchParams.append('SCHUL_NM', schoolName);
    }
    
    if (sidoCode) {
      apiUrl.searchParams.append('ATPT_OFCDC_SC_CODE', sidoCode);
    }
    
    if (schoolType) {
      // 학교급 코드 매핑
      const schoolTypeMap = {
        '1': '01', // 유치원
        '2': '02', // 초등학교
        '3': '03', // 중학교
        '4': '04'  // 고등학교
      };
      const typeCode = schoolTypeMap[schoolType as keyof typeof schoolTypeMap];
      if (typeCode) {
        apiUrl.searchParams.append('SCHUL_KND_SC_CODE', typeCode);
      }
    }

    console.log('나이스 API 호출:', apiUrl.toString());

    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    console.log('나이스 API 응답:', JSON.stringify(data, null, 2));

    // API 응답 처리
    if (!data.schoolInfo) {
      // 검색 결과가 없는 경우
      if (data.RESULT) {
        return new Response(
          JSON.stringify({
            success: true,
            schools: [],
            message: data.RESULT.MESSAGE || '검색 결과가 없습니다.',
            totalCount: 0
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: '학교 정보를 가져올 수 없습니다.',
          details: data
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 정상 응답 처리
    const schools = data.schoolInfo[1]?.row || [];
    
    return new Response(
      JSON.stringify({
        success: true,
        schools: schools,
        totalCount: schools.length,
        searchParams: {
          schoolName,
          sidoCode,
          schoolType,
          limit
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('학교 검색 중 오류:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: '학교 검색 중 오류가 발생했습니다.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
