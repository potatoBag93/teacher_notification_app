<template>
  <!-- 태그로 문구찾기 섹션 (2단 컬럼 스타일) -->
  <div class="tag-search-section flat-section">
    <h2 class="flat-section-title">카테고리/태그로 문구찾기</h2>

    <!-- Autocomplete Search Input -->
    <div class="autocomplete-wrapper">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="태그 검색... (예: #봄, #인사)"
        class="tag-search-input"
      />
      <div v-if="searchQuery && autocompleteResults.length" class="autocomplete-results">
        <div
          v-for="result in autocompleteResults"
          :key="result.tag"
          class="autocomplete-item"
          @click="selectTag(result)"
        >
          #{{ result.tag }} <span class="parent-category">({{ result.category }})</span>
        </div>
      </div>
       <div v-if="searchQuery && autocompleteResults.length === 0" class="autocomplete-results">
        <div class="autocomplete-item no-results">검색 결과가 없습니다.</div>
      </div>
    </div>

    <div class="tag-search-container">
      <div class="category-list">
        <template v-if="isLoading && categories.length === 0">
          <div class="main-tag-skeleton shimmer" v-for="n in 5" :key="n"></div>
        </template>
        <template v-else>
          <button
            v-for="category in categories"
            :key="category"
            :class="['main-tag-button', { active: selectedCategory === category }]"
            @click="() => { selectedCategory = category; loadNoticesByCategory(category); }"
            type="button"
          >
            {{ category }}
          </button>
        </template>
      </div>
      <div class="tag-panel">
        <h3>{{ selectedCategory }} 카테고리의 태그</h3>
        <div class="tag-list">
          <template v-if="isLoading && (!selectedCategory || !tagsByCategory[selectedCategory])">
            <div class="subtag-chip-skeleton shimmer" v-for="n in 8" :key="n"></div>
          </template>
          <template v-else>
            <span
              v-if="selectedCategory !== null"
              v-for="tag in tagsByCategory[selectedCategory]"
              :key="tag"
              class="subtag-chip"
              :class="{ highlighted: highlightedTag === tag }"
              @click="openModalForTag(tag, 'tag')"
            >
              #{{ tag }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </div>
  <!-- Tag-based Notices Modal -->
  <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <span class="tag-badge" :class="modalContent.type === 'category' ? 'category' : 'sub-tag'">{{ modalContent.tag }}</span>
          태그 관련 문구
        </h3>
        <button @click="closeModal" class="modal-close-btn">×</button>
      </div>
      <div class="modal-body">
        <div class="related-list">
          <div v-if="modalContent.Notices.length === 0" class="no-related-item">
            표시할 관련 문구가 없습니다.
          </div>
          <div
            v-for="(relatedNotice, rIdx) in modalContent.Notices"
            :key="rIdx"
            class="related-item"
            :class="{ selected: isSelected(relatedNotice.id) }"
            @click="toggleSelection(relatedNotice)"
          >
            <p>{{ relatedNotice.content }}</p>
            <div class="tags-list">
              <span v-if="relatedNotice.categories && relatedNotice.categories.length > 0"
                @click.stop="openModalForTag(relatedNotice.categories[0], 'category')"
                class="tag-badge category small">
                {{ relatedNotice.categories[0] }}
              </span>
              <span v-else class="tag-badge category small">기타사항</span>
              <span v-for="tag in relatedNotice.tags" :key="tag" @click.stop="openModalForTag(tag, 'tag')" class="tag-badge sub-tag small">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Notice, Category } from '../data/notices'
import { categories as allCategories, categoryTagsMap } from '../constants/categories'

// Props & Emits
const props = defineProps<{
  selectedNotices: Notice[]
}>()

const emit = defineEmits<{
  (e: 'toggle-selection', notice: Notice): void
}>()

// Component State
// 카테고리 변경 시 해당 카테고리 문구만 불러오기
const loadNoticesByCategory = async (category: Category) => {
  isLoading.value = true;
  try {
    const { NoticeService } = await import('../services/noticeService');
    // 카테고리 포함하는 문구만 불러오기
    //////console.log(category,"........................")
  const notices = await NoticeService.getNotices({ categories: [category] });
    allNotices.value = notices;
  } catch (e) {
    console.error('Error loading notices for category:', category, e);
    allNotices.value = [];
  } finally {
    isLoading.value = false;
  }
}
const isLoading = ref(true)
const allNotices = ref<Notice[]>([])
const categories = ref<Category[]>([...allCategories])
const selectedCategory = ref<Category | null>(null)
const tagsByCategory = ref<Record<string, string[]>>({})
const isModalOpen = ref(false)
const modalContent = ref<{ tag: string; type: 'category' | 'tag'; Notices: Notice[] }>({ tag: '', type: 'tag', Notices: [] });

// Autocomplete Search State
const searchQuery = ref('')
const allTags = ref<{ tag: string; category: Category }[]>([])
const highlightedTag = ref<string | null>(null)

// --- Computed Properties ---

const autocompleteResults = computed(() => {
  if (!searchQuery.value) {
    return []
  }
  // Normalize both query and tag for consistent matching
  const normalizedQuery = searchQuery.value.normalize('NFC').toLowerCase()
  return allTags.value.filter(item => 
    item.tag.normalize('NFC').toLowerCase().includes(normalizedQuery)
  ).slice(0, 10); // Limit results for performance
})

// --- Methods ---

const loadTagData = async () => {
  isLoading.value = true
  try {
    const { NoticeService } = await import('../services/noticeService')
    const notices = await NoticeService.getNotices();
    allNotices.value = notices;
    // 태그 목록을 중앙 정의에서 직접 불러옴
    const tagList: { tag: string; category: Category }[] = [];
    allCategories.forEach(cat => {
      const tags = categoryTagsMap[cat] || [];
      tagsByCategory.value[cat] = Array.isArray(tags) ? tags : [];
      tags.forEach(tag => {
        tagList.push({ tag, category: cat });
      });
    });
    allTags.value = tagList;
    categories.value = [...allCategories];
    if (categories.value.length > 0) {
      selectedCategory.value = categories.value[0];
    }
  } catch (e) {
    console.error('Error loading tag data:', e)
  } finally {
    isLoading.value = false
  }
}

const selectTag = (tagInfo: { tag: string; category: Category }) => {
  // 카테고리 변경 시 해당 카테고리 문구만 불러오기
  if (selectedCategory.value !== tagInfo.category) {
    selectedCategory.value = tagInfo.category;
    loadNoticesByCategory(tagInfo.category);
  }
  searchQuery.value = '';
  // Highlight the tag temporarily
  highlightedTag.value = tagInfo.tag;
  setTimeout(() => {
    highlightedTag.value = null;
  }, 2000); // Highlight for 2 seconds
}

const openModalForTag = (tag: string, type: 'category' | 'tag', externalNotices?: Notice[]) => {
  const sourceNotices = externalNotices || allNotices.value;
  // 디버깅: 태그 칩 클릭 시 Notice의 tags 필드와 비교되는 값 출력
  if (type === 'tag') {
    ////////console.log('[TagSearch] 태그 칩 클릭:', tag);
    sourceNotices.forEach((p, idx) => {
      const catMatch = Array.isArray(p.categories) && selectedCategory.value !== null && p.categories.includes(selectedCategory.value);
      const tagMatch = Array.isArray(p.tags) && p.tags.includes(tag);
      ////////console.log(`[Notice ${idx}] id:`, p.id, 'categories:', p.categories, 'tags:', p.tags, '카테고리일치:', catMatch, '태그일치:', tagMatch);
    });
  }
  const Notices = sourceNotices.filter(p => {
    if (type === 'category') {
      return Array.isArray(p.categories) && p.categories.includes(tag as Category);
    }
    // 태그 칩 클릭 시: 선택된 카테고리와 태그 모두 포함하는 문구만 표시
    return Array.isArray(p.categories) && Array.isArray(p.tags)
      && selectedCategory.value !== null
      && p.categories.includes(selectedCategory.value)
      && p.tags.includes(tag);
  });
  ////////console.log('[TagSearch] 필터링 결과:', Notices);
  modalContent.value = { tag, type, Notices };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const isSelected = (noticeId: string) => {
  return props.selectedNotices.some(n => n.id === noticeId)
}

const toggleSelection = (notice: Notice) => {
  emit('toggle-selection', notice)
}

onMounted(() => {
  loadTagData();
});

defineExpose({
  openModalForTag
});
</script>

<style scoped>
/* General Section Styling */
.tag-search-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
}

.flat-section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1a202c;
}

/* Autocomplete */
.autocomplete-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.tag-search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.tag-search-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
}

.autocomplete-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.autocomplete-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.autocomplete-item:hover {
  background-color: #f7fafc;
}

.autocomplete-item.no-results {
  color: #718096;
  cursor: default;
}

.autocomplete-item:not(:last-child) {
  border-bottom: 1px solid #edf2f7;
}

.parent-category {
  font-size: 0.8rem;
  color: #718096;
  margin-left: 0.5rem;
}

/* Two-column Layout */
.tag-search-container {
  display: grid;
  grid-template-columns: 520px 1fr;
  gap: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

/* Category List (Left Column) */
.category-list {
  background-color: #f7fafc;
  padding: 24px 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  border-right: 1px solid #e2e8f0;
}

.main-tag-button {
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border: none;
  background-color: transparent;
  border-radius: 8px;
  text-align: left;
  font-size: 1rem;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.main-tag-button:hover {
  background-color: #edf2f7;
}

.main-tag-button.active {
  background-color: #4a90e2;
  color: #ffffff;
  font-weight: 600;
}

/* Tag Panel (Right Column) */
.tag-panel {
  padding: 16px;
}

.tag-panel h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.subtag-chip {
  display: inline-block;
  padding: 6px 12px;
  background-color: #edf2f7;
  border-radius: 16px;
  font-size: 0.875rem;
  color: #4a5568;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, transform 0.1s;
}

.subtag-chip:hover {
  background-color: #e2e8f0;
  transform: translateY(-1px);
}

.subtag-chip.highlighted {
  background-color: #4a90e2;
  color: white;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.4);
  transition: background-color 0.3s, box-shadow 0.3s;
}

/* Skeleton Loaders */
@keyframes shimmer-animation {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.shimmer {
  background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%);
  background-size: 2000px 100%;
  animation: shimmer-animation 2s infinite linear;
}

.main-tag-skeleton {
  width: 100%;
  height: 40px; /* Matches main-tag-button height */
  border-radius: 6px;
}

.subtag-chip-skeleton {
  width: 80px;
  height: 30px; /* Matches subtag-chip height */
  border-radius: 16px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-close-btn {
  border: none;
  background: none;
  font-size: 1.75rem;
  font-weight: 300;
  color: #718096;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.related-list .no-related-item {
  text-align: center;
  color: #718096;
  padding: 2rem 0;
}

.related-item {
  padding: 16px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.related-item:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.related-item.selected {
  border-color: #4a90e2;
  background-color: #eff6ff;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.related-item p {
  margin: 0 0 12px 0;
  color: #2d3748;
  line-height: 1.6;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 12px;
  cursor: pointer;
}

.tag-badge.category {
  background-color: #e9d8fd;
  color: #6b46c1;
}

.tag-badge.sub-tag {
  background-color: #d1eaf9;
  color: #2b6cb0;
}

.tag-badge.small {
  font-size: 0.7rem;
  padding: 2px 6px;
}
</style>