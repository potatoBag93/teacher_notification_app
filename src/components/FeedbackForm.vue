<template>
  <div :class="$style.feedbackForm">
    <h3 :class="$style.formTitle">{{ isEditing ? '피드백 수정' : '새 피드백 작성' }}</h3>
    
    <form @submit.prevent="handleSubmit">
      <!-- 피드백 타입 선택 -->
      <div :class="$style.formGroup">
        <label :class="$style.label">피드백 유형 *</label>
        <div :class="$style.typeSelector">
          <button
            v-for="type in feedbackTypes"
            :key="type.key"
            type="button"
            :class="[$style.typeBtn, { [$style.selected]: form.type === type.key }]"
            @click="form.type = type.key"
          >
            <span :class="$style.typeIcon" :style="{ color: type.color }">
              {{ type.icon }}
            </span>
            <span :class="$style.typeLabel">{{ type.label }}</span>
          </button>
        </div>
      </div>

      <!-- 제목 -->
      <div :class="$style.formGroup">
        <label :class="$style.label" for="title">제목 *</label>
        <input
          id="title"
          v-model="form.title"
          :class="$style.input"
          type="text"
          placeholder="간단하고 명확한 제목을 입력해주세요"
          required
          maxlength="100"
        />
        <div :class="$style.inputMeta">
          <span :class="$style.charCount">{{ form.title.length }}/100</span>
        </div>
      </div>

      <!-- 상세 설명 -->
      <div :class="$style.formGroup">
        <label :class="$style.label" for="description">상세 설명 *</label>
        <textarea
          id="description"
          v-model="form.description"
          :class="$style.textarea"
          placeholder="문제 상황이나 제안사항을 자세히 설명해주세요"
          required
          rows="6"
          maxlength="1000"
        ></textarea>
        <div :class="$style.inputMeta">
          <span :class="$style.charCount">{{ form.description.length }}/1000</span>
        </div>
      </div>

      <!-- 연락처 (선택사항) -->
      <div :class="$style.formGroup">
        <label :class="$style.label" for="email">이메일 (선택)</label>
        <input
          id="email"
          v-model="form.userEmail"
          :class="$style.input"
          type="email"
          placeholder="답변을 받을 이메일 주소 (선택사항)"
        />
        <div :class="$style.inputHint">
          이메일을 입력하시면 답변을 받을 수 있습니다
        </div>
      </div>

      <!-- 태그 -->
      <div :class="$style.formGroup">
        <label :class="$style.label">태그 (선택)</label>
        <div :class="$style.tagInput">
          <input
            v-model="tagInput"
            :class="$style.input"
            type="text"
            placeholder="태그를 입력하고 Enter를 누르세요"
            @keydown.enter.prevent="addTag"
            @keydown.comma.prevent="addTag"
          />
          <button
            type="button"
            :class="$style.addTagBtn"
            @click="addTag"
            :disabled="!tagInput.trim()"
          >
            추가
          </button>
        </div>
        <div v-if="form.tags.length > 0" :class="$style.tagList">
          <span
            v-for="(tag, index) in form.tags"
            :key="index"
            :class="$style.tag"
          >
            #{{ tag }}
            <button
              type="button"
              :class="$style.removeTag"
              @click="removeTag(index)"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <!-- 우선순위 (관리자용) -->
      <div v-if="showPriority" :class="$style.formGroup">
        <label :class="$style.label">우선순위</label>
        <select v-model="form.priority" :class="$style.select">
          <option value="low">낮음</option>
          <option value="medium">보통</option>
          <option value="high">높음</option>
          <option value="urgent">긴급</option>
        </select>
      </div>

      <!-- 개인정보 동의 -->
      <div :class="$style.agreement">
        <label :class="$style.checkboxLabel">
          <input
            v-model="agreedToPrivacy"
            type="checkbox"
            :class="$style.checkbox"
            required
          />
          <span :class="$style.checkmark"></span>
          개인정보 수집 및 이용에 동의합니다 *
        </label>
        <p :class="$style.privacyText">
          입력하신 정보는 피드백 처리 목적으로만 사용되며, 처리 완료 후 안전하게 삭제됩니다.
        </p>
      </div>

      <!-- 제출 버튼 -->
      <div :class="$style.formActions">
        <BaseButton
          type="button"
          variant="ghost"
          @click="$emit('cancel')"
        >
          취소
        </BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? '전송 중...' : (isEditing ? '수정하기' : '피드백 보내기') }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseButton from './common/BaseButton.vue'
import { feedbackTypes, type FeedbackType, type FeedbackPriority } from '@/data/feedback'

interface Props {
  initialData?: {
    type: FeedbackType
    title: string
    description: string
    userEmail?: string
    priority?: FeedbackPriority
    tags?: string[]
  }
  isEditing?: boolean
  showPriority?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  showPriority: false
})

const emit = defineEmits<{
  submit: [data: {
    type: FeedbackType
    title: string
    description: string
    userEmail?: string
    priority: FeedbackPriority
    tags: string[]
  }]
  cancel: []
}>()

// 폼 상태
const form = ref({
  type: 'feature' as FeedbackType,
  title: '',
  description: '',
  userEmail: '',
  priority: 'medium' as FeedbackPriority,
  tags: [] as string[]
})

const tagInput = ref('')
const agreedToPrivacy = ref(false)
const isSubmitting = ref(false)

// 초기 데이터 설정
watch(() => props.initialData, (data) => {
  if (data) {
    form.value = {
      type: data.type,
      title: data.title,
      description: data.description,
      userEmail: data.userEmail || '',
      priority: data.priority || 'medium',
      tags: [...(data.tags || [])]
    }
  }
}, { immediate: true })

// 폼 유효성 검사
const isFormValid = computed(() => {
  return form.value.title.trim().length > 0 &&
         form.value.description.trim().length > 0 &&
         agreedToPrivacy.value
})

// 태그 관리
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 5) {
    form.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

// 폼 제출
const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // 실제 구현에서는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('submit', {
      type: form.value.type,
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      userEmail: form.value.userEmail.trim() || undefined,
      priority: form.value.priority,
      tags: form.value.tags
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style module>
.feedbackForm {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.formTitle {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.formGroup {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.typeSelector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.typeBtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.typeBtn:hover {
  border-color: #d1d5db;
}

.typeBtn.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.typeIcon {
  font-size: 20px;
}

.typeLabel {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  text-align: center;
}

.input,
.textarea,
.select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.input:focus,
.textarea:focus,
.select:focus {
  outline: none;
  border-color: #3b82f6;
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

.inputMeta {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.charCount {
  font-size: 12px;
  color: #9ca3af;
}

.inputHint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.tagInput {
  display: flex;
  gap: 8px;
}

.addTagBtn {
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.addTagBtn:hover:not(:disabled) {
  background: #2563eb;
}

.addTagBtn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.tagList {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #e0e7ff;
  color: #4338ca;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.removeTag {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.removeTag:hover {
  background: #d1d5db;
  color: #374151;
}

.agreement {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.checkboxLabel {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 1px;
}

.checkbox:checked + .checkmark {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.privacyText {
  font-size: 12px;
  color: #6b7280;
  margin: 8px 0 0 26px;
  line-height: 1.4;
}

.formActions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .feedbackForm {
    padding: 20px;
  }
  
  .typeSelector {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tagInput {
    flex-direction: column;
  }
  
  .formActions {
    flex-direction: column;
  }
}
</style>
