import type { Notice, Category } from './notices'

export interface EditBlock {
  id: string
  title: string
  content: string
  tags: Category[]
  subItems: string[]
  order: number
  isEditing?: boolean
  metadata?: {
    originalId?: string
    originalTitle?: string
    type?: 'text' | 'image' | 'list'
  }
}

export interface EditSession {
  id: string
  blocks: EditBlock[]
  createdAt: Date
  lastModified: Date
  title?: string
}

// 편집 가능한 블록으로 변환
export function noticeToEditBlock(notice: Notice, order: number): EditBlock {
  return {
    id: `block-${notice.id}-${Date.now()}`,
    title: notice.title,
    content: notice.content,
    tags: [...notice.tags],
    subItems: [...notice.subItems],
    order,
    isEditing: false
  }
}

// 최종 알림장 텍스트 생성
export function generateNoticeText(blocks: EditBlock[], format: 'simple' | 'numbered' | 'bullet' = 'simple'): string {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)
  
  let result = `${new Date().toLocaleDateString('ko-KR')} 알림장\n\n`
  
  sortedBlocks.forEach((block, index) => {
    if (format === 'numbered') {
      result += `${index + 1}. ${block.title}\n`
    } else {
      result += `${block.title}\n`
    }
    
    result += `${block.content}\n`
    
    if (block.subItems && block.subItems.length > 0) {
      block.subItems.forEach(item => {
        switch (format) {
          case 'numbered':
            result += `   - ${item}\n`
            break
          case 'bullet':
            result += `• ${item}\n`
            break
          default:
            result += `- ${item}\n`
        }
      })
    }
    
    result += '\n'
  })
  
  return result.trim()
}

// 포맷 옵션
export const formatOptions = [
  { value: 'simple', label: '기본 형식' },
  { value: 'numbered', label: '번호 매기기' },
  { value: 'bullet', label: '불릿 포인트' }
] as const
