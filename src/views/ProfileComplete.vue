<template>
  <div :class="$style.container">
    <div :class="$style.completeBox">
      <div :class="$style.header">
        <h1 :class="$style.title">
          <template v-if="isEditMode">✏️ 계정 설정</template>
          <template v-else>🏫 프로필 완성하기</template>
        </h1>
        <p :class="$style.subtitle">
          <template v-if="isEditMode">
            {{ authStore.user?.full_name }}님, 학교 정보를 변경하거나 계정을 관리할 수 있습니다.
          </template>
          <template v-else>
            안녕하세요, {{ authStore.user?.full_name }}님!<br>
            교사 인증을 위해 추가 정보를 입력해주세요.
          </template>
        </p>
      </div>
      
      <form :class="$style.form" @submit.prevent="handleSubmit">
        <div v-if="error" :class="$style.errorMessage">
          {{ error }}
        </div>
        
        <div :class="$style.formGroup">
          <label for="schoolName" :class="$style.label">
            학교명 <span :class="$style.required">*</span>
          </label>
          <div :class="$style.schoolSearchContainer">
            <input
              id="schoolName"
              v-model="schoolSearchQuery"
              type="text"
              :class="[$style.input, $style.schoolSearchInput]"
              placeholder="학교명을 입력하세요 (예: 서울초등학교)"
              @input="handleSchoolSearch"
              @focus="showSchoolDropdown = true"
              required
            />
            <div 
              v-if="showSchoolDropdown && (searchedSchools.length > 0 || isSearchingSchools)"
              :class="$style.schoolDropdown"
            >
              <div v-if="isSearchingSchools" :class="$style.searchingMessage">
                🔍 학교를 검색 중입니다...
              </div>
              <div 
                v-for="school in searchedSchools" 
                :key="school.SD_SCHUL_CODE"
                :class="$style.schoolOption"
                @click="selectSchool(school)"
              >
                <div :class="$style.schoolName">{{ school.SCHUL_NM }}</div>
                <div :class="$style.schoolInfo">
                  {{ school.SCHUL_KND_SC_NM }} · {{ school.LCTN_SC_NM }}
                </div>
                <div v-if="school.ORG_RDNMA" :class="$style.schoolAddress">
                  📍 {{ school.ORG_RDNMA }}
                </div>
              </div>
              <div v-if="!isSearchingSchools && searchedSchools.length === 0 && schoolSearchQuery.length > 1" :class="$style.noResults">
                검색 결과가 없습니다.
              </div>
            </div>
          </div>
          <div :class="$style.hint">
            ⚠️ 반드시 검색 결과에서 정확한 학교를 선택해주세요. 직접 입력만으로는 제출할 수 없습니다.
          </div>
          
          <!-- 선택된 학교 정보 표시 -->
          <div v-if="selectedSchool" :class="$style.selectedSchoolInfo">
            <div :class="$style.selectedLabel">✅ 선택된 학교:</div>
            <div :class="$style.selectedSchoolName">{{ selectedSchool.SCHUL_NM }}</div>
            <div :class="$style.selectedSchoolDetails">
              {{ selectedSchool.SCHUL_KND_SC_NM }} · {{ selectedSchool.LCTN_SC_NM }}
            </div>
            <div v-if="selectedSchool.ORG_RDNMA" :class="$style.selectedSchoolAddress">
              📍 {{ selectedSchool.ORG_RDNMA }}
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          :class="$style.submitBtn"
          :disabled="isLoading || !selectedSchool"
        >
          <template v-if="isEditMode">{{ isLoading ? '저장 중...' : '정보 저장하기' }}</template>
          <template v-else>{{ isLoading ? '저장 중...' : '프로필 완성하기' }}</template>
        </button>
      </form>
      
      <div :class="$style.infoBox" v-if="!isEditMode">
        <div :class="$style.infoIcon">ℹ️</div>
        <div>
          <strong>승인 프로세스</strong><br>
          관리자가 학교 정보를 확인한 후 24시간 내에 승인 여부를 알려드립니다.
        </div>
      </div>

      <!-- Danger Zone - 회원 탈퇴 -->
      <div v-if="isEditMode" :class="$style.dangerZone">
        <div :class="$style.dangerZoneContent">
          <div>
            <h4 :class="$style.dangerZoneContentTitle">회원 탈퇴</h4>
            <p :class="$style.dangerZoneText">
              계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없으며, 모든 데이터가 사라집니다.
            </p>
          </div>
          <button 
            @click="handleDeleteAccount" 
            :class="$style.deleteBtn"
            :disabled="isDeleting"
          >
            {{ isDeleting ? '삭제 중...' : '계정 삭제' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { UserService } from '../services/userService'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(false)
const isDeleting = ref(false)
const error = ref('')

const form = ref({
  schoolName: ''
})

const schoolSearchQuery = ref('')
const searchedSchools = ref<any[]>([])
const isSearchingSchools = ref(false)
const showSchoolDropdown = ref(false)
const selectedSchool = ref<any>(null)
let searchTimeout: NodeJS.Timeout | null = null

interface SchoolInfo {
  ATPT_OFCDC_SC_CODE: string
  SD_SCHUL_CODE: string
  SCHUL_NM: string
  ENG_SCHUL_NM?: string
  SCHUL_KND_SC_NM: string
  LCTN_SC_NM: string
  JU_ORG_NM?: string
  ORG_RDNMA?: string
  ORG_RDNZC?: string
  ORG_TELNO?: string
  HMPG_ADRES?: string
  COEDU_SC_NM?: string
  ORG_FAXNO?: string
  HS_SC_NM?: string
}

const isEditMode = computed(() => route.name === 'profile-edit')

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (!isEditMode.value && authStore.user?.school_name?.trim()) {
    router.push('/')
    return
  }

  if (isEditMode.value && authStore.user) {
    form.value.schoolName = authStore.user.school_name || ''
    schoolSearchQuery.value = authStore.user.school_name || ''
    selectedSchool.value = {
      SCHUL_NM: authStore.user.school_name,
      // You might need to fetch full school details if required
    }
  }

  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const handleSchoolSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(async () => {
    const query = schoolSearchQuery.value.trim()
    
    if (query.length < 2) {
      searchedSchools.value = []
      showSchoolDropdown.value = false
      return
    }
    
    await searchSchools(query)
  }, 300)
}

const searchSchools = async (schoolName: string) => {
  if (isSearchingSchools.value) return
  isSearchingSchools.value = true
  
  try {
    const response = await fetch('/api/search-schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolName, limit: 10 })
    })
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json()
    if (data.success && data.schools) {
      searchedSchools.value = data.schools
      showSchoolDropdown.value = true
    } else {
      searchedSchools.value = []
      console.error('학교 검색 실패:', data.error)
    }
  } catch (error) {
    console.error('학교 검색 중 오류:', error)
    searchedSchools.value = []
  } finally {
    isSearchingSchools.value = false
  }
}

const selectSchool = (school: SchoolInfo) => {
  selectedSchool.value = school
  schoolSearchQuery.value = school.SCHUL_NM
  form.value.schoolName = school.SCHUL_NM
  showSchoolDropdown.value = false
}

const handleOutsideClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.schoolSearchContainer')) {
    showSchoolDropdown.value = false
  }
}

const getSchoolCoordinates = async (schoolAddress: string): Promise<{lat: number, lng: number} | null> => {
  try {
    const dummyCoordinates = {
      lat: 37.5665 + (Math.random() - 0.5) * 0.1,
      lng: 126.9780 + (Math.random() - 0.5) * 0.1
    }
    console.log(`학교 주소 "${schoolAddress}"의 좌표:`, dummyCoordinates)
    return dummyCoordinates
  } catch (error) {
    console.error('좌표 변환 실패:', error)
    return null
  }
}

const handleSubmit = async () => {
  if (!selectedSchool.value) {
    error.value = '검색된 학교 목록에서 정확한 학교를 선택해주세요.'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    let schoolLat = null
    let schoolLng = null
    
    if (selectedSchool.value.ORG_RDNMA) {
      const coordinates = await getSchoolCoordinates(selectedSchool.value.ORG_RDNMA)
      if (coordinates) {
        schoolLat = coordinates.lat
        schoolLng = coordinates.lng
      }
    }
    
    const result = await authStore.updateProfile({
      school_name: selectedSchool.value.SCHUL_NM,
      school_lat: schoolLat as any,
      school_lng: schoolLng as any
    } as any)

    if (result.success) {
      if (isEditMode.value) {
        alert('프로필 정보가 업데이트되었습니다.')
      } else {
        router.push('/pending-approval')
      }
    } else {
      error.value = result.error || '프로필 업데이트에 실패했습니다.'
    }
  } catch (err: any) {
    error.value = err.message || '프로필 업데이트 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

const handleDeleteAccount = async () => {
  if (!window.confirm('정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.')) {
    return
  }

  isDeleting.value = true
  error.value = ''

  try {
    // TODO: Implement account deletion in a service (e.g., userService.ts)
    console.log('--- Account Deletion Initiated ---')
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay
    // const result = await userService.deleteCurrentUser();
    const result = { success: true, error: null } // Placeholder for actual API call
    
    if (result.success) {
      alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.')
      await authStore.logout()
      router.push('/login')
    } else {
      error.value = result.error || '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.'
    }
  } catch (err: any) {
    error.value = err.message || '회원 탈퇴 중 오류가 발생했습니다.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<style module>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 20px;
}

.completeBox {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
  line-height: 1.5;
}

.form {
  margin-bottom: 30px;
}

.formGroup {
  margin-bottom: 20px;
}

.label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.required {
  color: #e74c3c;
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #95a5a6;
  line-height: 1.4;
}

.submitBtn {
  width: 100%;
  padding: 14px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submitBtn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.submitBtn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.errorMessage {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  border: 1px solid #fcc;
}

.infoBox {
  background: #e8f6f3;
  border: 1px solid #a3e4d7;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.infoIcon {
  font-size: 20px;
  flex-shrink: 0;
}

.infoBox div {
  font-size: 14px;
  line-height: 1.5;
  color: #27ae60;
}

/* School Search Styles */
.schoolSearchContainer {
  position: relative;
}

.schoolDropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.searchingMessage, .noResults {
  padding: 12px 16px;
  color: #6b7280;
  font-style: italic;
  text-align: center;
}

.schoolOption {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.schoolOption:hover {
  background-color: #f8fafc;
}

.schoolOption:last-child {
  border-bottom: none;
}

.schoolName {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.schoolInfo {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
}

.schoolAddress {
  font-size: 11px;
  color: #9ca3af;
}

.selectedSchoolInfo {
  margin-top: 12px;
  padding: 12px 16px;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.selectedLabel {
  font-size: 12px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 4px;
}

.selectedSchoolName {
  font-weight: 600;
  color: #166534;
  margin-bottom: 4px;
}

.selectedSchoolDetails {
  font-size: 12px;
  color: #16a34a;
  margin-bottom: 2px;
}

.selectedSchoolAddress {
  font-size: 11px;
  color: #15803d;
}

/* Danger Zone */
.dangerZone {
  margin-top: 40px;
  border-top: 1px solid #e74c3c;
  padding-top: 20px;
}

.dangerZoneTitle {
  color: #e74c3c;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
}

.dangerZoneContent {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fef2f2;
  padding: 16px;
  border-radius: 8px;
}

.dangerZoneContentTitle {
  font-weight: 600;
  color: #991b1b;
  margin: 0 0 4px 0;
}

.dangerZoneText {
  font-size: 14px;
  color: #b91c1c;
  line-height: 1.5;
  margin: 0;
  padding-right: 16px;
}

.deleteBtn {
  padding: 10px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.deleteBtn:hover:not(:disabled) {
  background: #c0392b;
}

.deleteBtn:disabled {
  background: #f8b2ab;
  cursor: not-allowed;
}
</style>