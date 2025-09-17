<template>
  <div class="search-input-container">
    <div class="search-input-wrapper">
      <input
        v-model="inputValue"
        type="text"
        class="search-input"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.enter="handleEnter"
        @keydown.escape="handleEscape"
      />
      <button 
        class="search-button"
        @click="handleSearch"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </button>
    </div>
    
    <!-- 자동완성 드롭다운 -->
    <div 
      v-if="showSuggestions && filteredSuggestions.length > 0"
      class="suggestions-dropdown"
    >
      <div
        v-for="(suggestion, index) in filteredSuggestions"
        :key="suggestion"
        class="suggestion-item"
        :class="{ active: index === activeSuggestionIndex }"
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  suggestions?: string[]
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '키워드로 문구 검색...',
  suggestions: () => [],
  debounceMs: 300
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [query: string]
  focus: []
  blur: []
}>()

const inputValue = ref(props.modelValue)
const showSuggestions = ref(false)
const activeSuggestionIndex = ref(-1)
let debounceTimer: number | null = null

// 필터된 제안사항
const filteredSuggestions = computed(() => {
  if (!inputValue.value || inputValue.value.length < 2) {
    return []
  }
  
  return props.suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(inputValue.value.toLowerCase())
  ).slice(0, 8) // 최대 8개까지만 표시
})

// 입력값 변경 시 modelValue 업데이트
watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// props.modelValue 변경 시 inputValue 업데이트
watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue || ''
})

const handleInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = window.setTimeout(() => {
    activeSuggestionIndex.value = -1
    showSuggestions.value = true
  }, props.debounceMs)
}

const handleFocus = () => {
  showSuggestions.value = filteredSuggestions.value.length > 0
  emit('focus')
}

const handleBlur = () => {
  // 약간의 지연을 두어 클릭 이벤트가 먼저 처리되도록 함
  setTimeout(() => {
    showSuggestions.value = false
    activeSuggestionIndex.value = -1
  }, 150)
  emit('blur')
}

const handleEnter = () => {
  if (activeSuggestionIndex.value >= 0) {
    selectSuggestion(filteredSuggestions.value[activeSuggestionIndex.value])
  } else {
    handleSearch()
  }
}

const handleEscape = () => {
  showSuggestions.value = false
  activeSuggestionIndex.value = -1
}

const handleSearch = () => {
  emit('search', inputValue.value)
  showSuggestions.value = false
}

const selectSuggestion = (suggestion: string) => {
  inputValue.value = suggestion
  showSuggestions.value = false
  activeSuggestionIndex.value = -1
  emit('search', suggestion)
}
</script>

<style scoped>
.search-input-container {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: #ffffff;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.search-button {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.search-button:hover {
  color: #3b82f6;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  margin-top: 0.25rem;
  overflow: hidden;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestion-item:hover,
.suggestion-item.active {
  background: #f9fafb;
}

.suggestion-item:last-child {
  border-bottom: none;
}
</style>
