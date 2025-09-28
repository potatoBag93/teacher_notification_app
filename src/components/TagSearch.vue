<template>
  <!-- 태그로 문구찾기 섹션 (2단 컬럼 스타일) -->
  <div class="tag-search-section flat-section">
    <h2 class="flat-section-title">태그로 문구찾기</h2>

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
          #{{ result.tag }} <span class="parent-category">({{ result.mainCategory }})</span>
        </div>
      </div>
       <div v-if="searchQuery && autocompleteResults.length === 0" class="autocomplete-results">
        <div class="autocomplete-item no-results">검색 결과가 없습니다.</div>
      </div>
    </div>

    <div class="tag-search-container">
      <div class="main-category-list">
        <template v-if="isLoading && mainCategories.length === 0">
          <div class="main-tag-skeleton shimmer" v-for="n in 5" :key="n"></div>
        </template>
        <template v-else>
          <button
            v-for="category in mainCategories"
            :key="category"
            :class="['main-tag-button', { active: selectedMainTag === category }]"
            @click="selectedMainTag = category"
            type="button"
          >
            {{ category }}
          </button>
        </template>
      </div>
      <div class="sub-tag-panel">
        <h3>{{ selectedMainTag }} 서브태그</h3>
        <div class="subtag-list">
          <template v-if="isLoading && (!selectedMainTag || !subTagsByMain[selectedMainTag])">
            <div class="subtag-chip-skeleton shimmer" v-for="n in 8" :key="n"></div>
          </template>
          <template v-else>
            <span
              v-if="selectedMainTag !== null"
              v-for="subTag in subTagsByMain[selectedMainTag]"
              :key="subTag"
              class="subtag-chip"
              :class="{ highlighted: highlightedTag === subTag }"
              @click="openModalForTag(subTag, 'subTag')"
            >
              #{{ subTag }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </div>
  <!-- Tag-based Phrases Modal -->
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
          <div v-if="modalContent.phrases.length === 0" class="no-related-item">
            표시할 관련 문구가 없습니다.
          </div>
          <div
            v-for="(relatedPhrase, rIdx) in modalContent.phrases"
            :key="rIdx"
            class="related-item"
            :class="{ selected: isSelected(relatedPhrase.id) }"
            @click="toggleSelection(relatedPhrase)"
          >
            <p>{{ relatedPhrase.title }}</p>
            <div class="tags-list">
              <span @click.stop="openModalForTag(relatedPhrase.tags[0], 'category')" class="tag-badge category small">{{ relatedPhrase.tags[0] }}</span>
              <span v-for="tag in relatedPhrase.subTags" :key="tag" @click.stop="openModalForTag(tag, 'subTag')" class="tag-badge sub-tag small">{{ tag }}</span>
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

// Props & Emits
const props = defineProps<{
  selectedNotices: Notice[]
}>()

const emit = defineEmits<{
  (e: 'toggle-selection', notice: Notice): void
}>()

// Component State
const isLoading = ref(true)
const allNotices = ref<Notice[]>([])
const mainCategories = ref<Category[]>([])
const selectedMainTag = ref<Category | null>(null)
const subTagsByMain = ref<Record<string, string[]>>({})
const isModalOpen = ref(false)
const modalContent = ref<{ tag: string; type: 'category' | 'subTag'; phrases: Notice[] }>({ tag: '', type: 'subTag', phrases: [] });

// Autocomplete Search State
const searchQuery = ref('')
const allTags = ref<{ tag: string; mainCategory: Category }[]>([])
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
    const notices = await NoticeService.getNotices({ limit: 100 });
    allNotices.value = notices;
    
    const categories = new Set<Category>()
    const subTags: Record<string, Set<string>> = {}
    const tagMap = new Map<string, { tag: string; mainCategory: Category }>();

    // First pass: add all main categories to the map
    notices.forEach(notice => {
      const mainCat = notice.tags[0]
      if (mainCat) {
        categories.add(mainCat);
        if (!tagMap.has(mainCat)) {
          tagMap.set(mainCat, { tag: mainCat, mainCategory: mainCat });
        }
      }
    });

    // Second pass: add sub-tags and build sub-tag structure
    notices.forEach(notice => {
      const mainCat = notice.tags[0]
      if (mainCat) {
        if (!subTags[mainCat]) subTags[mainCat] = new Set()
        notice.subTags?.forEach(sub => {
          subTags[mainCat].add(sub)
          // Add sub-tag to map only if it's not already there (as a main category)
          if (!tagMap.has(sub)) {
            tagMap.set(sub, { tag: sub, mainCategory: mainCat });
          }
        })
      }
    })
    
    allTags.value = Array.from(tagMap.values());
    mainCategories.value = Array.from(categories)
    if (mainCategories.value.length > 0) {
      selectedMainTag.value = mainCategories.value[0]
    }
    Object.keys(subTags).forEach(cat => {
      subTagsByMain.value[cat] = Array.from(subTags[cat])
    })
  } catch (e) {
    console.error('Error loading tag data:', e)
  } finally {
    isLoading.value = false
  }
}

const selectTag = (tagInfo: { tag: string; mainCategory: Category }) => {
  selectedMainTag.value = tagInfo.mainCategory;
  searchQuery.value = '';
  
  // Highlight the tag temporarily
  highlightedTag.value = tagInfo.tag;
  setTimeout(() => {
    highlightedTag.value = null;
  }, 2000); // Highlight for 2 seconds
}

const openModalForTag = (tag: string, type: 'category' | 'subTag', externalPhrases?: Notice[]) => {
  const sourcePhrases = externalPhrases || allNotices.value;
  const phrases = sourcePhrases.filter(p => {
    if (type === 'category') {
      return p.tags.includes(tag as Category);
    }
    return p.subTags?.includes(tag);
  });
  modalContent.value = { tag, type, phrases };
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
 @import '../views/NewMainView.css';

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

.subtag-chip.highlighted {
  background-color: #4a90e2;
  color: white;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.4);
  transition: background-color 0.3s, box-shadow 0.3s;
}
</style>