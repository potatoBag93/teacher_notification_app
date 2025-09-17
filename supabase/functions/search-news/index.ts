// Supabase Edge Function: 네이버 뉴스 검색 API
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 요청 데이터 파싱
    const { query, display } = await req.json()

    // 필수 필드 검증
    if (!query) {
      return new Response(
        JSON.stringify({ error: '검색어는 필수입니다' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 네이버 API 키 확인
    const clientId = Deno.env.get('NAVER_CLIENT_ID')
    const clientSecret = Deno.env.get('NAVER_CLIENT_SECRET')
    
    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: '네이버 API 키가 설정되지 않았습니다' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 네이버 뉴스 검색 API 호출
    const searchUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display || 10}&start=1&sort=sim`
    
    const naverResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'User-Agent': 'Mozilla/5.0 (compatible; teacher-notice-app/1.0)'
      }
    })

    if (!naverResponse.ok) {
      const error = await naverResponse.text()
      console.error('네이버 API 오류:', error)
      return new Response(
        JSON.stringify({ 
          error: '뉴스 검색에 실패했습니다',
          details: error 
        }),
        { 
          status: naverResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const searchResult = await naverResponse.json()

    // 교육 관련 필터링 (선택적)
    const educationKeywords = ['교육', '학교', '학생', '교사', '수업', '학습', '안전', '건강', '환경', '독서', '체험', '활동']
    const filteredItems = searchResult.items.filter((item: any) => {
      const text = (item.title + ' ' + item.description).toLowerCase()
      return educationKeywords.some(keyword => text.includes(keyword)) || 
             query.includes('교육') || query.includes('학교') || query.includes('학생')
    })

    // 결과가 너무 적으면 원본 결과 사용
    const finalItems = filteredItems.length >= 3 ? filteredItems : searchResult.items

    // HTML 태그 제거 및 데이터 정리
    const cleanedItems = finalItems.map((item: any) => ({
      title: item.title.replace(/<[^>]*>/g, ''),
      originallink: item.originallink,
      link: item.link,
      description: item.description.replace(/<[^>]*>/g, ''),
      pubDate: item.pubDate,
      postdate: convertToKoreanDate(item.pubDate)
    }))

    // 성공 응답
    return new Response(
      JSON.stringify({ 
        success: true,
        total: searchResult.total,
        start: searchResult.start,
        display: searchResult.display,
        items: cleanedItems,
        query: query,
        filtered: filteredItems.length !== searchResult.items.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: '서버 오류가 발생했습니다',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// 네이버 날짜 형식을 한국 날짜로 변환
function convertToKoreanDate(pubDate: string): string {
  try {
    // 네이버 API에서 오는 날짜 형식: "Mon, 04 Sep 2025 14:30:00 +0900"
    const date = new Date(pubDate)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return pubDate // 변환 실패시 원본 반환
  }
}
