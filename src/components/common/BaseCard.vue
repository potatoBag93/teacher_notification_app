<template>
  <div 
    class="base-card"
    :class="[cardClass, { 'card-hover': hover }]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  hover: true,
  padding: 'md',
  shadow: 'md'
})

const cardClass = computed(() => {
  const classes = []
  
  if (props.padding) {
    classes.push(`card-padding-${props.padding}`)
  }
  
  if (props.shadow) {
    classes.push(`card-shadow-${props.shadow}`)
  }
  
  return classes
})


</script>

<style scoped>
.base-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}



.card-padding-none {
  padding: 0;
}

.card-padding-sm {
  padding: 0.75rem;
}

.card-padding-md {
  padding: 1.5rem;
}

.card-padding-lg {
  padding: 2rem;
}

.card-shadow-none {
  box-shadow: none;
}

.card-shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.card-shadow-md {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.card-shadow-lg {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
</style>
