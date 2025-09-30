import { type Category } from '../constants/categories'

export type { Category }

export interface Notice {
  id: string
  content: string
  categories: Category[]
  tags?: string[]           // 세부 태그 (새로 추가)
  author: string
  likeCount: number
  // subItems 필드 제거됨
  createdAt: Date
  usageCount?: number
  isReported?: boolean         // 신고 여부
}


// 카테고리 목록 (새로운 13개 카테고리 시스템으로 업데이트)
export const categories: Category[] = [
  ...require('../constants/categories').categories
]
