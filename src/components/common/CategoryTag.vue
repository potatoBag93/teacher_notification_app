<template>
  <span 
    class="category-tag"
    :class="[
      { 'tag-clickable': clickable, 'tag-active': active }
    ]"
    :style="getTagStyle()"
    @click="handleClick"
  >
    {{ label || category }}
  </span>
</template>

<script setup lang="ts">
import { type ExtendedCategory, getCategoryMeta } from '../../constants/categories'

interface Props {
  category: ExtendedCategory
  label?: string
  clickable?: boolean
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: false,
  active: false
})

const emit = defineEmits<{
  click: [category: ExtendedCategory]
}>()

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.category)
  }
}

const getTagStyle = () => {
  if (props.category === '전체') {
    return {
      background: props.active ? '#3b82f6' : '#f3f4f6',
      color: props.active ? 'white' : '#374151',
      borderColor: props.active ? '#3b82f6' : '#d1d5db'
    }
  }
  
  // categories.ts에서 메타데이터 가져오기
  const meta = getCategoryMeta(props.category as any)
  if (meta) {
    return {
      background: meta.bgColor,
      color: meta.color,
      borderColor: meta.borderColor
    }
  }
  
  // 기본 스타일
  return {
    background: '#f3f4f6',
    color: '#4b5563',
    borderColor: '#d1d5db'
  }
}
</script>

<style scoped>
.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: 1px solid;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.tag-clickable {
  cursor: pointer;
}

.tag-clickable:hover {
  opacity: 0.8;
}

.tag-active {
  font-weight: 600;
  transform: scale(1.05);
}
</style>
