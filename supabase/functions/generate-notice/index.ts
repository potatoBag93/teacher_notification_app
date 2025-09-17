    // Supabase Edge Function: AI로 알림장 문구 생성하기
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
    const { topic, grade, style, context } = await req.json()

    // 필수 필드 검증 (topic 또는 context 중 하나는 있어야 함)
    if (!topic && !context) {
      return new Response(
        JSON.stringify({ error: '주제 또는 컨텍스트 정보는 필수입니다' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }        // OpenAI API 키 확인
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openaiApiKey) {
        return new Response(
            JSON.stringify({ error: 'OpenAI API 키가 설정되지 않았습니다' }),
            { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
        )
        }

    // AI 프롬프트 생성
    const prompt = generatePrompt(topic, grade, style, context)        // OpenAI API 호출
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
            {
                role: 'system',
                content: '당신은 경험 많은 교사입니다. 학생들에게 도움이 되는 알림장 문구를 작성해주세요.'
            },
            {
                role: 'user',
                content: prompt
            }
            ],
            max_tokens: 500,
            temperature: 0.7
        })
        })

        if (!openaiResponse.ok) {
        const error = await openaiResponse.text()
        console.error('OpenAI API Error:', error)
        return new Response(
            JSON.stringify({ error: 'AI 문구 생성에 실패했습니다' }),
            { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
        )
        }

        const aiResult = await openaiResponse.json()
        const generatedContent = aiResult.choices[0]?.message?.content

        if (!generatedContent) {
        return new Response(
            JSON.stringify({ error: 'AI가 문구를 생성하지 못했습니다' }),
            { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
        )
        }

        // 생성된 문구 파싱 (제목과 내용 분리)
        const parsed = parseGeneratedContent(generatedContent)

        // 성공 응답
        return new Response(
        JSON.stringify({ 
            success: true, 
            generated: {
            title: parsed.title,
            content: parsed.content,
            subItems: parsed.subItems,
            tags: parsed.tags,
            raw: generatedContent
            },
            topic: topic,
            style: style || 'normal'
        }),
        {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
        )

    } catch (error) {
        console.error('Function error:', error)
        return new Response(
        JSON.stringify({ error: '서버 오류가 발생했습니다' }),
        { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
        )
    }
    })

// AI 프롬프트 생성 함수
function generatePrompt(topic?: string, grade?: string, style?: string, context?: string) {
  const gradeText = grade ? `${grade} 학생들에게 맞는` : '초등학생들에게 맞는'
  const styleText = getStyleText(style)
  
  // 컨텍스트가 있으면 컨텍스트 기반, 없으면 주제 기반
  let basePrompt = ''
  if (context) {
    basePrompt = `다음 정보를 바탕으로 ${gradeText} 교육적인 알림장 문구를 ${styleText} 작성해주세요.

참고 정보:
${context}

${topic ? `주제: ${topic}` : ''}`
  } else {
    basePrompt = `다음 주제에 대한 ${gradeText} 알림장 문구를 ${styleText} 작성해주세요.

주제: ${topic}`
  }
  
  return `${basePrompt}

반드시 다음 JSON 형식으로만 응답해주세요:
{
  "title": "간단하고 명확한 제목",
  "content": "메인 메시지 (한 문장으로)",
  "subItems": [
    "구체적인 행동 지침 1",
    "구체적인 행동 지침 2",
    "구체적인 행동 지침 3"
  ],
  "tags": ["관련태그1", "관련태그2"]
}

예시:
{
  "title": "여름철 물놀이 안전수칙",
  "content": "안전한 물놀이를 위해 다음 사항을 꼭 지켜주세요.",
  "subItems": [
    "깊은 물에는 절대 들어가지 마세요",
    "혼자서 물놀이 하지 마세요", 
    "구명조끼를 꼭 착용하세요",
    "물놀이 전 충분한 준비운동을 하세요"
  ],
  "tags": ["안전", "여름활동"]
}

교육적이고 실용적이며, 학생들이 쉽게 이해할 수 있도록 작성해주세요. JSON 형식 외의 다른 텍스트는 포함하지 마세요.`
}    // 스타일 텍스트 변환
    function getStyleText(style?: string) {
    switch (style) {
        case 'friendly': return '친근하고 따뜻한 톤으로'
        case 'formal': return '정중하고 격식있게'
        case 'simple': return '쉽고 간단하게'
        default: return '자연스럽게'
    }
    }

    // 생성된 내용 파싱
    function parseGeneratedContent(content: string) {
    try {
        // JSON 형태로 파싱 시도
        const parsed = JSON.parse(content.trim())
        
        return {
        title: parsed.title || '생성된 알림장 문구',
        content: parsed.content || '',
        subItems: Array.isArray(parsed.subItems) ? parsed.subItems : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['일반']
        }
    } catch (error) {
        console.log('JSON 파싱 실패, 텍스트 파싱으로 대체:', error)
        
        // 기존 텍스트 파싱 로직 (백업용)
        const lines = content.split('\n').filter(line => line.trim())
        
        let title = ''
        let mainContent = ''
        let subItems: string[] = []
        let isContent = false
        let isSubItems = false
        
        for (const line of lines) {
        if (line.includes('제목:')) {
            title = line.replace('제목:', '').trim()
        } else if (line.includes('내용:')) {
            isContent = true
            isSubItems = false
            const contentAfterColon = line.replace('내용:', '').trim()
            if (contentAfterColon) {
            mainContent = contentAfterColon
            isContent = false
            isSubItems = true
            }
        } else if (isContent && line.trim() && !line.startsWith('-') && !line.match(/^\d/)) {
            mainContent = line.trim()
            isContent = false
            isSubItems = true
        } else if ((isSubItems || isContent) && line.trim()) {
            const cleaned = line.replace(/^[-•\d.)\s]+/, '').trim()
            if (cleaned) {
            subItems.push(cleaned)
            }
        }
        }
        
        if (!title && subItems.length > 0) {
        title = subItems[0]
        subItems = subItems.slice(1)
        }
        
        const tags = estimateTags(title, mainContent + ' ' + subItems.join(' '))
        
        return {
        title: title || '생성된 알림장 문구',
        content: mainContent || '',
        subItems: subItems,
        tags: tags
        }
    }
    }

    // 내용 기반 태그 추정
    function estimateTags(title: string, content: string) {
    const text = (title + ' ' + content).toLowerCase()
    const tags: string[] = []
    
    if (text.includes('안전') || text.includes('조심') || text.includes('주의')) {
        tags.push('안전')
    }
    if (text.includes('건강') || text.includes('운동') || text.includes('식사')) {
        tags.push('건강')
    }
    if (text.includes('학습') || text.includes('공부') || text.includes('숙제')) {
        tags.push('학습')
    }
    if (text.includes('예절') || text.includes('인사') || text.includes('행동')) {
        tags.push('생활지도')
    }
    if (text.includes('환경') || text.includes('청소') || text.includes('정리')) {
        tags.push('환경')
    }
    
    // 최소 하나의 태그는 보장
    if (tags.length === 0) {
        tags.push('일반')
    }
    
    return tags
    }
