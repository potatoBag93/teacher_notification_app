<template>
  <div class="chalkboard-modern-preview">
    <div class="editor-toolbar">
  <!-- 말머리 버튼들 -->
  <button class="editor-btn" @mousedown.prevent @click="addPrefix('number')" title="숫자 붙이기">1.</button>
  <button class="editor-btn" @mousedown.prevent @click="addPrefix('bullet')" title="블릿 붙이기">•</button>
  <button class="editor-btn" @mousedown.prevent @click="addPrefix('dash')" title="대시 붙이기">-</button>
      <button class="editor-btn" @mousedown.prevent @click="format('bold')" title="굵게 (Ctrl+B)"><strong>B</strong></button>
      <button class="editor-btn" @mousedown.prevent @click="format('italic')" title="기울임 (Ctrl+I)"><em>I</em></button>
      <button class="editor-btn" @mousedown.prevent @click="format('underline')" title="밑줄 (Ctrl+U)"><u>U</u></button>
      <button class="editor-btn" @mousedown.prevent @click="format('hiliteColor', '#f1c40f')" title="하이라이트"><mark>H</mark></button>
      <span style="width:1px;height:30px;background:rgba(236,240,241,0.3);margin:0 0.5rem;display:inline-block;"></span>
      <div class="font-size-dropdown">
        <label for="font-size-select" style="color:#ecf0f1;font-size:0.875rem;margin-right:0.5rem;">크기:</label>
        <select id="font-size-select" v-model="selectedFontSize" @change="applyFontSize" class="font-size-select">
          <option v-for="size in fontSizeOptions" :key="size.value" :value="size.value">{{ size.label }}</option>
        </select>
      </div>
      <span style="width:1px;height:30px;background:rgba(236,240,241,0.3);margin:0 0.5rem;display:inline-block;"></span>
      <div class="color-picker">
        <span style="color:#ecf0f1;font-size:0.875rem;margin-right:0.5rem;">색상:</span>
        <div v-for="color in colors" :key="color.value" :class="['color-btn', color.class, {active: color.value===activeColor}]" :style="{background:color.value}" @mousedown.prevent @click="setTextColor(color.value)" :title="color.label"></div>
      </div>
    </div>
    <div class="chalkboard-toolbar">
      <button @click="reset" class="chalk-btn">지우기</button>
      <button @click="save" class="chalk-btn">저장</button>
      <span class="chalk-charcount">{{ charCount }}자</span>
    </div>
    <div class="chalkboard-body">
      <input
        v-model="title"
        class="chalkboard-title-input"
        maxlength="50"
        placeholder="제목을 입력하세요"
      />
      <div
        ref="contentEditor"
        class="chalkboard-content-editor"
        contenteditable="true"
        tabindex="0"
        :data-placeholder="'내용을 자유롭게 작성하세요...\n텍스트를 선택하고 툴바 버튼을 눌러 서식을 적용해보세요!'"
        @input="onInput"
        @keydown="onKeydown"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 말머리 붙이기 기능
function addPrefix(type: 'number' | 'bullet' | 'dash') {
  if (!contentEditor.value) return;
  // 줄별로 처리: innerText로 줄 split, prefix 추가, innerHTML로 복원
  let lines = (contentEditor.value.innerText || '').split(/\r?\n/);
  // 기존 말머리(숫자, 블릿, 대시) 모두 제거
  const prefixRegex = /^(\d+\.|•|-)\s+/;
  lines = lines.map(line => line.replace(prefixRegex, '').trimEnd());
  let newLines: string[] = [];
  if (type === 'number') {
    let num = 1;
    for (const line of lines) {
      if (line.trim() !== '') {
        newLines.push(`${num++}. ${line}`);
      }
    }
  } else if (type === 'bullet') {
    for (const line of lines) {
      if (line.trim() !== '') {
        newLines.push(`• ${line}`);
      }
    }
  } else if (type === 'dash') {
    for (const line of lines) {
      if (line.trim() !== '') {
        newLines.push(`- ${line}`);
      }
    }
  }
  // 빈 줄은 무시, <br>로 변환
  contentEditor.value.innerHTML = newLines.map(l => l).join('<br>');
  content.value = contentEditor.value.innerText;
}
import { ref, computed, onMounted, nextTick } from 'vue'

const getTodaysDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const day = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];
  return `${year}년 ${month}월 ${date}일 (${day}) 알림장`;
}

const title = ref(getTodaysDate())
const contentEditor = ref<HTMLElement|null>(null)
const content = ref('')
const charCount = computed(() => (title.value.length + content.value.length))

const colors = [
  { value: '#ecf0f1', class: 'color-white', label: '흰색' },
  { value: '#f1c40f', class: 'color-yellow', label: '노란색' },
  { value: '#e67e22', class: 'color-orange', label: '주황색' },
  { value: '#e74c3c', class: 'color-red', label: '빨간색' },
  { value: '#ff69b4', class: 'color-pink', label: '분홍색' },
  { value: '#9b59b6', class: 'color-purple', label: '보라색' },
  { value: '#3498db', class: 'color-blue', label: '파란색' },
  { value: '#2ecc71', class: 'color-green', label: '초록색' },
]
const activeColor = ref(colors[0].value)

function reset() {
  title.value = getTodaysDate()
  content.value = ''
  if (contentEditor.value) contentEditor.value.innerHTML = ''
}
function save() {
  alert('저장되었습니다!\n(실제 저장 로직은 연동 필요)')
}
function onInput() {
  content.value = contentEditor.value?.innerText || ''
}
function onKeydown(e: KeyboardEvent) {
  // Enter: 줄바꿈(Shift+Enter: 단일 줄)
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    document.execCommand('insertHTML', false, '<br><br>')
  }
  // 단축키: Ctrl+B/I/U
  if (e.ctrlKey && e.key === 'b') {
    e.preventDefault(); format('bold')
  }
  if (e.ctrlKey && e.key === 'i') {
    e.preventDefault(); format('italic')
  }
  if (e.ctrlKey && e.key === 'u') {
    e.preventDefault(); format('underline')
  }
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault(); save()
  }
}
function format(cmd: string, value?: string) {
  if (!contentEditor.value) return
  contentEditor.value.focus()
  document.execCommand(cmd, false, value)
  nextTick(onInput)
}
function setTextColor(color: string) {
  activeColor.value = color
  if (!contentEditor.value) return
  // selection이 contentEditor 내부인지 확인
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed) {
    console.log('[색상] 선택 영역 없음, 적용 안함')
    return
  }
  const anchorNode = sel.anchorNode, focusNode = sel.focusNode
  const isInEditor = (node: Node|null) => {
    return !!node && contentEditor.value && contentEditor.value.contains(node)
  }
  if (!isInEditor(anchorNode) || !isInEditor(focusNode)) {
    console.log('[색상] 선택이 contentEditor 내부가 아님')
    return
  }
  console.log('[색상] styleWithCSS true')
  document.execCommand('styleWithCSS', false, 'true')
  console.log('[색상] foreColor', color)
  document.execCommand('foreColor', false, color)
  contentEditor.value.focus()
  setTimeout(() => {
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      const node = range.startContainer.parentElement
      console.log('[색상] 적용된 span:', node?.outerHTML)
    }
  }, 0)
  nextTick(onInput)
}
// 폰트크기 옵션
const fontSizeOptions = [
  { label: '보통', value: '48px' },
  { label: '크게', value: '64px' },
  { label: '아주 크게', value: '72px' },
]
const selectedFontSize = ref('48px')

function applyFontSize() {
  if (!contentEditor.value) return
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed) {
    console.log('[폰트크기] 선택 영역 없음, 적용 안함')
    return
  }
  const anchorNode = sel.anchorNode, focusNode = sel.focusNode
  const isInEditor = (node: Node|null) => {
    return !!node && contentEditor.value && contentEditor.value.contains(node)
  }
  if (!isInEditor(anchorNode) || !isInEditor(focusNode)) {
    console.log('[폰트크기] 선택이 contentEditor 내부가 아님')
    return
  }
  const range = sel.getRangeAt(0)
  const selectedText = range.toString()
  if (!selectedText) return
  // span 생성 및 스타일 적용
  const span = document.createElement('span')
  span.style.fontSize = selectedFontSize.value
  span.textContent = selectedText
  range.deleteContents()
  range.insertNode(span)
  // selection을 새로 삽입된 span 전체로 복원
  sel.removeAllRanges()
  const newRange = document.createRange()
  newRange.selectNode(span)
  sel.addRange(newRange)
  console.log('[폰트크기] 적용된 span:', span.outerHTML)
  nextTick(onInput)
}
/* ...existing code... */

onMounted(() => {
  const initialContent = sessionStorage.getItem('chalkboard-preview-content');
  if (contentEditor.value) {
    if (initialContent) {
      contentEditor.value.innerHTML = initialContent;
      content.value = contentEditor.value.innerText; // Update text content ref
      sessionStorage.removeItem('chalkboard-preview-content');
    } else {
      contentEditor.value.innerHTML = ''
      content.value = ''
    }
  }
  // styleWithCSS: true (최초 1회만)
  try {
    document.execCommand('styleWithCSS', false, 'true')
  } catch {}
})
</script>

<style scoped>
/* 폰트 크기 드롭다운 스타일 */
.font-size-dropdown {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.font-size-select {
  background: #223;
  color: #fff;
  border: 1px solid #bbb;
  border-radius: 0.5rem;
  padding: 0.3rem 0.7rem;
  font-size: 1rem;
  outline: none;
  margin-right: 0.5rem;
}

.chalkboard-modern-preview {
  background: linear-gradient(135deg, #2d3a2e 0%, #3b4d3a 100%);
  border-radius: 0;
  box-shadow: none;
  padding: 1.5rem 2rem;
  width: 100vw;
  height: 100vh;
  min-width: 0;
  max-width: none;
  margin: 0;
  color: #fff;
  font-family: 'Nanum Pen Script', 'Noto Sans KR', cursive, sans-serif;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.chalkboard-header {
  font-size: 2rem;
  font-weight: 700;
  color: #f9fafb;
  margin-bottom: 1.2rem;
  text-align: center;
  letter-spacing: 0.1em;
  text-shadow: 0 2px 8px #0008;
}
.chalkboard-toolbar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
  justify-content: flex-end;
}
.editor-toolbar {
  background: rgba(34, 40, 36, 0.92);
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  z-index: 2;
  margin-bottom: 1.2rem;
  box-shadow: 0 2px 8px #0008;
  border-radius: 1rem;
  border: 1px solid #3b4d3a;
}
.editor-btn {
  background: rgba(236, 240, 241, 0.12);
  border: 1px solid #4b5c4a;
  color: #e0e7ef;
  padding: 0.5rem 0.85rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.18s, color 0.18s, border 0.18s;
  min-width: 40px;
  text-align: center;
  box-shadow: 0 1px 2px #0004;
  letter-spacing: 0.01em;
}
.editor-btn:hover, .editor-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.color-picker {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  margin: 0 0.5rem;
}
.color-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid rgba(236, 240, 241, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}
.color-btn:hover, .color-btn.active {
  border-color: #ecf0f1;
  transform: scale(1.1);
}
.chalkboard-title-input {
  font-size: 3.5rem;
  font-weight: 600;
  color: #bbf7d0;
  background: transparent;
  border: none;
  border-bottom: 2px dashed #bbf7d0;
  outline: none;
  margin-bottom: 0.5rem;
  width: 100%;
  padding: 0.2em 0.1em;
}
.chalkboard-content-editor {
  font-size: 48px;
  color: #f9fafb;
  background: transparent;
  border: none;
  border-bottom: 2px dashed #f9fafb44;
  outline: none;
  width: 100%;
  min-height: 80px;
  padding: 0.3em 0.1em;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.chalkboard-content-editor:empty::before {
  content: attr(data-placeholder);
  color: rgba(236, 240, 241, 0.4);
  font-style: italic;
}
.chalkboard-content-editor:focus::before {
  display: none;
}

</style>
<style>
/* 
  이 페이지를 위한 전역 스타일입니다. 
  body의 기본 마진과 패딩을 제거하여
  미리보기 컴포넌트가 화면을 완전히 채우도록 합니다.
*/
body {
  margin: 0;
  padding: 0;
  overflow: hidden; /* 스크롤바 숨김 */
}
</style>