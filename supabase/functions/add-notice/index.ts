// Supabase Edge Function: 새로운 notice 추가하기
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
Deno.serve(async (req)=>{
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Supabase 클라이언트 생성 (올바른 방식)
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') || ''
        }
      }
    });
    // 요청 데이터 파싱
    const { title, content, subItems, tags, author } = await req.json();
    // 필수 필드 검증
    if (!title || !content && (!subItems || subItems.length === 0)) {
      return new Response(JSON.stringify({
        error: '제목과 내용(또는 세부 항목)은 필수입니다'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // 데이터베이스에 notice 추가
    const { data, error } = await supabase.from('notices').insert({
      title,
      content: content || '',
      sub_items: subItems || [],
      tags: tags || [],
      author: author || 'anonymous',
      created_at: new Date().toISOString()
    }).select();
    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        error: '데이터베이스 오류'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // 성공 응답
    return new Response(JSON.stringify({
      success: true,
      data: data[0],
      message: '알림장 문구가 성공적으로 추가되었습니다'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: '서버 오류가 발생했습니다'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
