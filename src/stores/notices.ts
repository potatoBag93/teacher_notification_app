/**
 * 알림장 문구 관리 상태 스토어 (Pinia)
 * 
 * 알림장 문구들의 상태 관리와 관련 기능들을 제공합니다.
 * - 문구 목록 관리 및 CRUD 작업
 * - 필터링, 검색, 정렬 기능
 * - 문구 선택 관리 (다중 선택 지원)
 * - 좋아요 및 사용 기록 처리
 * - 추천 및 인기 문구 조회
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { NoticeService } from '../services/noticeService'
import type { Notice, Category } from '../data/notices'

export const useNoticeStore = defineStore('notices', () => {
  // ==================== 상태 (State) ====================
  
  /** 현재 로드된 문구 목록 */
  const notices = ref<Notice[]>([])
  
  /** 사용자가 선택한 문구들 (다중 선택 지원) */
  const selectedNotices = ref<Notice[]>([])
  
  /** 현재 상세 보기 중인 문구 */
  const currentNotice = ref<Notice | null>(null)
  
  /** 로딩 상태 (문구 조회, 생성, 수정 등) */
  const isLoading = ref(false)
  
  /** 에러 메시지 */
  const error = ref<string | null>(null)
  
  // ==================== 필터 상태 ====================
  
  /** 현재 선택된 태그 필터들 */
  const currentTags = ref<Category[]>([])
  
  /** 검색어 */
  const searchQuery = ref('')
  
  /** 정렬 기준 */
  const sortBy = ref<'created_at' | 'usage_count' | 'like_count'>('created_at')
  
  /** 정렬 순서 */
  const sortOrder = ref<'asc' | 'desc'>('desc')

  // ==================== 페이징 상태 ====================
  
  /** 현재 페이지 번호 */
  const currentPage = ref(1)
  
  /** 페이지당 아이템 수 */
  const itemsPerPage = ref(20)
  
  /** 전체 아이템 수 */
  const totalItems = ref(0)

  // ==================== 계산된 값 (Getters) ====================
  
  /**
   * 현재 필터 조건에 맞는 문구들을 반환합니다
   * 클라이언트 사이드 필터링 (서버 사이드 필터링과 함께 사용)
   */
  const filteredNotices = computed(() => {
    let filtered = notices.value

    // 태그 필터링
    if (currentTags.value.length > 0) {
      filtered = filtered.filter((notice: Notice) => 
        notice.tags.some((tag: Category) => currentTags.value.includes(tag))
      )
    }

    // 검색어 필터링 (제목과 내용에서 검색)
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter((notice: Notice) =>
        notice.title.toLowerCase().includes(query) ||
        notice.content.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  /** 선택된 문구가 있는지 확인 */
  const hasSelectedNotices = computed(() => selectedNotices.value.length > 0)
  
  /** 선택된 문구의 개수 */
  const selectedNoticesCount = computed(() => selectedNotices.value.length)

  // ==================== 액션 (Actions) ====================
  
  /**
   * 문구 목록을 서버에서 로드합니다
   * 
   * @param options 조회 옵션
   */
  const loadNotices = async (options: {
    tags?: Category[]
    search?: string
    orderBy?: 'created_at' | 'usage_count' | 'like_count'
    order?: 'asc' | 'desc'
    limit?: number
    offset?: number
    isRecommended?: boolean
    isPopular?: boolean
  } = {}) => {
    isLoading.value = true
    error.value = null
    
    try {
      // 현재 필터 상태와 전달받은 옵션을 결합
      const loadOptions = {
        tags: options.tags || currentTags.value,
        search: options.search || searchQuery.value,
        orderBy: options.orderBy || sortBy.value,
        order: options.order || sortOrder.value,
        limit: options.limit || itemsPerPage.value,
        offset: options.offset || (currentPage.value - 1) * itemsPerPage.value,
        isRecommended: options.isRecommended,
        isPopular: options.isPopular
      }

      const data = await NoticeService.getNotices(loadOptions)
      
      // 첫 페이지거나 offset이 0인 경우 목록을 교체, 아니면 추가 (무한 스크롤용)
      if (options.offset === 0 || !options.offset) {
        notices.value = data || []
      } else {
        notices.value.push(...(data || []))
      }
      
    } catch (err: any) {
      error.value = err.message || '문구를 불러오는데 실패했습니다.'
      console.error('Failed to load notices:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 추천 문구들을 로드합니다
   * 
   * @param limit 조회할 최대 개수
   * @returns 추천 문구 배열
   */
  const loadRecommendedNotices = async (limit: number = 10) => {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await NoticeService.getRecommendedNotices(limit)
      return data || []
    } catch (err: any) {
      error.value = err.message || '추천 문구를 불러오는데 실패했습니다.'
      console.error('Failed to load recommended notices:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 인기 문구들을 로드합니다 (좋아요 순)
   * 
   * @param limit 조회할 최대 개수
   * @returns 인기 문구 배열
   */
  const loadPopularNotices = async (limit: number = 10) => {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await NoticeService.getPopularNotices(limit)
      return data || []
    } catch (err: any) {
      error.value = err.message || '인기 문구를 불러오는데 실패했습니다.'
      console.error('Failed to load popular notices:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 특정 ID의 문구를 상세 조회합니다
   * 
   * @param id 조회할 문구 ID
   * @returns 문구 데이터 또는 null
   */
  const getNotice = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const notice = await NoticeService.getNotice(id)
      currentNotice.value = notice  // 현재 문구로 설정
      return notice
    } catch (err: any) {
      error.value = err.message || '문구를 불러오는데 실패했습니다.'
      console.error('Failed to get notice:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 새로운 문구를 생성합니다
   * 
   * @param noticeData 생성할 문구 데이터
   * @returns 생성 결과 객체 { success: boolean, notice?: Notice, error?: string }
   */
  const createNotice = async (noticeData: Omit<Notice, 'createdAt'>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const newNotice = await NoticeService.createNotice(noticeData)
      
      // 새 문구를 목록 맨 앞에 추가 (최신순 유지)
      notices.value.unshift(newNotice)
      
      return { success: true, notice: newNotice }
    } catch (err: any) {
      error.value = err.message || '문구 생성에 실패했습니다.'
      console.error('Failed to create notice:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateNotice = async (id: string, updates: Partial<Notice>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedNotice = await NoticeService.updateNotice(id, updates)
      
      // 문구 목록 업데이트
      const index = notices.value.findIndex((notice: Notice) => notice.id === id)
      if (index !== -1) {
        notices.value[index] = updatedNotice
      }
      
      return { success: true, notice: updatedNotice }
    } catch (err: any) {
      error.value = err.message || '문구 수정에 실패했습니다.'
      console.error('Failed to update notice:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const deleteNotice = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      await NoticeService.deleteNotice(id)
      
      // 문구 목록에서 제거
      notices.value = notices.value.filter((notice: Notice) => notice.id !== id)
      selectedNotices.value = selectedNotices.value.filter((notice: Notice) => notice.id !== id)
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message || '문구 삭제에 실패했습니다.'
      console.error('Failed to delete notice:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const incrementLikeCount = async (noticeId: string) => {
    try {
      await NoticeService.incrementLikeCount(noticeId)
      
      // 문구 목록의 좋아요 수 업데이트
      const notice = notices.value.find((n: Notice) => n.id === noticeId)
      if (notice) {
        notice.likeCount += 1
      }
      
      return true
    } catch (err: any) {
      error.value = err.message || '좋아요 처리에 실패했습니다.'
      console.error('Failed to increment like count:', err)
      return false
    }
  }

  const incrementUsageCount = async (noticeId: string) => {
    try {
      await NoticeService.incrementUsageCount(noticeId)
      
      // 문구 목록의 사용 횟수 업데이트
      const notice = notices.value.find((n: Notice) => n.id === noticeId)
      if (notice) {
        notice.usageCount = (notice.usageCount || 0) + 1
      }
    } catch (err: any) {
      console.error('Failed to record usage:', err)
    }
  }

  // ==================== 문구 선택 관리 ====================
  
  /**
   * 문구를 선택 목록에 추가합니다
   * 
   * @param notice 선택할 문구
   */
  const selectNotice = (notice: Notice) => {
    const index = selectedNotices.value.findIndex((n: Notice) => n.id === notice.id)
    if (index === -1) {
      selectedNotices.value.push(notice)
    }
  }

  /**
   * 문구를 선택 목록에서 제거합니다
   * 
   * @param noticeId 제거할 문구 ID
   */
  const deselectNotice = (noticeId: string) => {
    selectedNotices.value = selectedNotices.value.filter((notice: Notice) => notice.id !== noticeId)
  }

  /**
   * 문구 선택 상태를 토글합니다 (선택 ↔ 선택 해제)
   * 
   * @param notice 토글할 문구
   */
  const toggleNoticeSelection = (notice: Notice) => {
    const index = selectedNotices.value.findIndex((n: Notice) => n.id === notice.id)
    if (index === -1) {
      selectNotice(notice)
    } else {
      deselectNotice(notice.id)
    }
  }

  /**
   * 모든 선택을 해제합니다
   */
  const clearSelection = () => {
    selectedNotices.value = []
  }

  /**
   * 특정 문구가 선택되어 있는지 확인합니다
   * 
   * @param noticeId 확인할 문구 ID
   * @returns 선택 여부
   */
  const isNoticeSelected = (noticeId: string) => {
    return selectedNotices.value.some((notice: Notice) => notice.id === noticeId)
  }

  // ==================== 필터 관리 ====================
  
  /**
   * 태그 필터를 설정합니다
   * 
   * @param tags 필터링할 태그 배열
   */
  const setTagFilter = (tags: Category[]) => {
    currentTags.value = tags
    currentPage.value = 1  // 필터 변경시 첫 페이지로 이동
  }

  /**
   * 검색어를 설정합니다
   * 
   * @param query 검색할 키워드
   */
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    currentPage.value = 1  // 검색시 첫 페이지로 이동
  }

  /**
   * 정렬 설정을 변경합니다
   * 
   * @param by 정렬 기준
   * @param order 정렬 순서
   */
  const setSorting = (by: 'created_at' | 'usage_count' | 'like_count', order: 'asc' | 'desc') => {
    sortBy.value = by
    sortOrder.value = order
    currentPage.value = 1  // 정렬 변경시 첫 페이지로 이동
  }

  /**
   * 모든 필터를 초기화합니다
   */
  const clearFilters = () => {
    currentTags.value = []
    searchQuery.value = ''
    currentPage.value = 1
  }

  // ==================== 반환할 상태와 메서드들 ====================
  
  return {
    // 상태 (State)
    notices,                    // 문구 목록
    selectedNotices,           // 선택된 문구들
    currentNotice,             // 현재 상세 보기 문구
    isLoading,               // 로딩 상태
    error,                   // 에러 메시지
    currentTags,             // 현재 태그 필터
    searchQuery,             // 검색어
    sortBy,                  // 정렬 기준
    sortOrder,               // 정렬 순서
    currentPage,             // 현재 페이지
    itemsPerPage,            // 페이지당 아이템 수
    totalItems,              // 전체 아이템 수
    
    // 계산된 값 (Getters)
    filteredNotices,          // 필터링된 문구 목록
    hasSelectedNotices,       // 선택된 문구 존재 여부
    selectedNoticesCount,     // 선택된 문구 개수
    
    // 문구 관리 액션
    loadNotices,              // 문구 목록 로드
    loadRecommendedNotices,   // 추천 문구 로드
    loadPopularNotices,       // 인기 문구 로드
    getNotice,               // 단일 문구 조회
    createNotice,            // 문구 생성
    updateNotice,            // 문구 수정
    deleteNotice,            // 문구 삭제
    incrementLikeCount,      // 좋아요 수 증가
    incrementUsageCount,     // 사용 횟수 증가
    
    // 선택 관리 액션
    selectNotice,            // 문구 선택
    deselectNotice,          // 문구 선택 해제
    toggleNoticeSelection,   // 문구 선택 토글
    clearSelection,         // 전체 선택 해제
    isNoticeSelected,       // 문구 선택 여부 확인
    
    // 필터 관리 액션
    setTagFilter,           // 태그 필터 설정
    setSearchQuery,         // 검색어 설정
    setSorting,             // 정렬 설정
    clearFilters            // 필터 초기화
  }
})
