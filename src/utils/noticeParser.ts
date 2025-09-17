// 현재 Notice 구조를 유지하면서 클라이언트에서 파싱하는 유틸리티

export interface ParsedNoticeContent {
  title: string
  description: string
  items: ParsedItem[]
  footer?: string
}

export interface ParsedItem {
  type: 'bullet' | 'number' | 'text'
  text: string
  level: number // 들여쓰기 레벨 (0, 1, 2...)
  icon?: string
}

/**
 * Notice의 content를 파싱하여 구조화된 형태로 변환
 */
export function parseNoticeContent(content: string): ParsedNoticeContent {
  const lines = content.split('\n').filter(line => line.trim())
  
  const result: ParsedNoticeContent = {
    title: '',
    description: '',
    items: []
  }
  
  let isFirstLine = true
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 첫 번째 줄은 description으로 처리
    if (isFirstLine && !trimmed.startsWith('-') && !trimmed.startsWith('•')) {
      result.description = trimmed
      isFirstLine = false
      continue
    }
    
    // 불릿 포인트 처리
    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      const level = (line.length - line.trimStart().length) / 2 // 들여쓰기 레벨 계산
      const text = trimmed.replace(/^[-•]\s*/, '')
      
      result.items.push({
        type: 'bullet',
        text,
        level: Math.floor(level),
        icon: getIconForContent(text)
      })
    }
    // 숫자 리스트 처리
    else if (/^\d+\./.test(trimmed)) {
      const level = (line.length - line.trimStart().length) / 2
      const text = trimmed.replace(/^\d+\.\s*/, '')
      
      result.items.push({
        type: 'number',
        text,
        level: Math.floor(level),
        icon: getIconForContent(text)
      })
    }
    // 일반 텍스트
    else {
      result.items.push({
        type: 'text',
        text: trimmed,
        level: 0
      })
    }
    
    isFirstLine = false
  }
  
  return result
}

/**
 * 내용에 따라 적절한 아이콘 반환
 */
function getIconForContent(text: string): string {
  const lower = text.toLowerCase()
  
  if (lower.includes('주의') || lower.includes('조심') || lower.includes('금지')) {
    return '⚠️'
  }
  if (lower.includes('시간') || lower.includes('제한')) {
    return '⏰'
  }
  if (lower.includes('보호') || lower.includes('안전')) {
    return '🔒'
  }
  if (lower.includes('예방') || lower.includes('방지')) {
    return '🛡️'
  }
  if (lower.includes('건강') || lower.includes('운동')) {
    return '💪'
  }
  if (lower.includes('물') || lower.includes('수분')) {
    return '💧'
  }
  
  return '•'
}

/**
 * 파싱된 내용을 HTML로 렌더링
 */
export function renderParsedContent(parsed: ParsedNoticeContent): string {
  let html = ''
  
  if (parsed.description) {
    html += `<p class="notice-description">${parsed.description}</p>`
  }
  
  if (parsed.items.length > 0) {
    html += '<ul class="notice-items">'
    
    for (const item of parsed.items) {
      const indentClass = `indent-${item.level}`
      const icon = item.icon || '•'
      
      html += `<li class="notice-item ${indentClass}">
        <span class="item-icon">${icon}</span>
        <span class="item-text">${item.text}</span>
      </li>`
    }
    
    html += '</ul>'
  }
  
  if (parsed.footer) {
    html += `<p class="notice-footer">${parsed.footer}</p>`
  }
  
  return html
}

// 사용 예시
export const exampleUsage = () => {
  const originalContent = `올바른 스마트폰 사용법을 익혀주세요.
- 사용 시간 제한하기
- 보행 중 사용 금지
- 개인정보 보호하기
- 사이버 폭력 예방하기`

  const parsed = parseNoticeContent(originalContent)
  const html = renderParsedContent(parsed)
  return { parsed, html }
}
