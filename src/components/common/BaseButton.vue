<template>
  <button 
    class="base-button"
    :class="[
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-loading': loading, 'btn-disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot v-if="!loading" />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (!props.disabled && !props.loading) {
    emit('click')
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 0.5rem;
  border: 1px solid;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  font-family: inherit;
}

.base-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

/* Variants */
.btn-primary {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.btn-primary:hover:not(.btn-disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-secondary {
  background: #ffffff;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover:not(.btn-disabled) {
  background: #f9fafb;
}

.btn-outline {
  background: transparent;
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-outline:hover:not(.btn-disabled) {
  background: #eff6ff;
}

.btn-ghost {
  background: transparent;
  color: #374151;
  border-color: transparent;
}

.btn-ghost:hover:not(.btn-disabled) {
  background: #f3f4f6;
}

.btn-danger {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

.btn-danger:hover:not(.btn-disabled) {
  background: #dc2626;
  border-color: #dc2626;
}

.btn-ai {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-color: #667eea;
  position: relative;
  overflow: hidden;
}

.btn-ai:hover:not(.btn-disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-ai:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-ai:hover:before {
  left: 100%;
}

/* Sizes */
.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.btn-md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* States */
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading {
  cursor: default;
}

.btn-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
