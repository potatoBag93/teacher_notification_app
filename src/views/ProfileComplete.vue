<template>
  <div :class="$style.container">
    <div :class="$style.completeBox">
      <div :class="$style.header">
        <h1 :class="$style.title">🏫 프로필 완성하기</h1>
        <p :class="$style.subtitle">
          안녕하세요, {{ authStore.user?.full_name }}님!<br>
          교사 인증을 위해 추가 정보를 입력해주세요.
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
        
        <div :class="$style.formGroup">
          <label for="position" :class="$style.label">직책 (선택사항)</label>
          <select
            id="position"
            v-model="form.position"
            :class="$style.input"
          >
            <option value="">선택하세요</option>
            <option value="담임교사">담임교사</option>
            <option value="교과전담">교과전담</option>
            <option value="부장교사">부장교사</option>
            <option value="교감">교감</option>
            <option value="교장">교장</option>
            <option value="기타">기타</option>
          </select>
        </div>
        
        <div :class="$style.formGroup">
          <label for="phone" :class="$style.label">연락처 (선택사항)</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            :class="$style.input"
            placeholder="010-1234-5678"
          />
        </div>
        
        <button 
          type="submit" 
          :class="$style.submitBtn"
          :disabled="isLoading || !selectedSchool"
        >
          {{ isLoading ? '저장 중...' : '프로필 완성하기' }}
        </button>
      </form>
      
      <div :class="$style.infoBox">
        <div :class="$style.infoIcon">ℹ️</div>
        <div>
          <strong>승인 프로세스</strong><br>
          관리자가 학교 정보를 확인한 후 24시간 내에 승인 여부를 알려드립니다.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')

// 기존 폼 데이터
const form = ref({
  schoolName: '',
  position: '',
  phone: ''
})

// 학교 검색 관련 상태
const schoolSearchQuery = ref('')
const searchedSchools = ref<any[]>([])
const isSearchingSchools = ref(false)
const showSchoolDropdown = ref(false)
const selectedSchool = ref<any>(null)
let searchTimeout: NodeJS.Timeout | null = null

// 학교 정보 인터페이스
interface SchoolInfo {
  ATPT_OFCDC_SC_CODE: string    // 교육청코드
  SD_SCHUL_CODE: string         // 학교코드
  SCHUL_NM: string              // 학교명
  ENG_SCHUL_NM?: string         // 영문학교명
  SCHUL_KND_SC_NM: string       // 학교급명
  LCTN_SC_NM: string            // 시도명
  JU_ORG_NM?: string            // 관할기관명
  ORG_RDNMA?: string            // 도로명주소
  ORG_RDNZC?: string            // 우편번호
  ORG_TELNO?: string            // 전화번호
  HMPG_ADRES?: string           // 홈페이지주소
  COEDU_SC_NM?: string          // 남녀공학구분명
  ORG_FAXNO?: string            // 팩스번호
  HS_SC_NM?: string             // 고등학교구분명
}

onMounted(() => {
  // 이미 학교명이 있거나 로그인하지 않은 경우 리디렉션
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  if (authStore.user?.school_name?.trim()) {
    router.push('/main')
    return
  }

  // 드롭다운 닫기를 위한 클릭 이벤트 리스너
  document.addEventListener('click', handleOutsideClick)
})

// 학교 검색 함수
const handleSchoolSearch = () => {
  // 디바운싱: 입력 후 300ms 후에 검색 실행
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

// 학교 검색 API 호출
const searchSchools = async (schoolName: string) => {
  if (isSearchingSchools.value) return
  
  isSearchingSchools.value = true
  
  try {
    const response = await fetch('/api/search-schools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schoolName: schoolName,
        limit: 10
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
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

// 학교 선택
const selectSchool = (school: SchoolInfo) => {
  selectedSchool.value = school
  schoolSearchQuery.value = school.SCHUL_NM
  form.value.schoolName = school.SCHUL_NM
  showSchoolDropdown.value = false
}

// 드롭다운 외부 클릭 시 닫기
const handleOutsideClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.schoolSearchContainer')) {
    showSchoolDropdown.value = false
  }
}

// 위도/경도 가져오기 함수 (Geocoding API 사용)
const getSchoolCoordinates = async (schoolAddress: string): Promise<{lat: number, lng: number} | null> => {
  try {
    // 여기서는 간단히 더미 좌표를 반환 (실제로는 Geocoding API 사용)
    // 예: Google Maps Geocoding API, Naver Maps API 등
    
    // 서울 지역 기본 좌표 (실제로는 주소 기반으로 변환)
    const dummyCoordinates = {
      lat: 37.5665 + (Math.random() - 0.5) * 0.1, // 서울 중심 ± 변화
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
  if (!form.value.schoolName.trim()) {
    error.value = '학교명을 입력해주세요.'
    return
  }

  if (!selectedSchool.value) {
    error.value = '검색된 학교 목록에서 정확한 학교를 선택해주세요. 학교명을 입력하면 검색 결과가 나타납니다.'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // 학교 위치 정보 가져오기
    let schoolLat = null
    let schoolLng = null
    
    if (selectedSchool.value.ORG_RDNMA) {
      const coordinates = await getSchoolCoordinates(selectedSchool.value.ORG_RDNMA)
      if (coordinates) {
        schoolLat = coordinates.lat
        schoolLng = coordinates.lng
      }
    }
    
    // 프로필 업데이트 (위치 정보 포함)
    const result = await authStore.updateProfile({
      school_name: selectedSchool.value.SCHUL_NM,
      school_lat: schoolLat as any,
      school_lng: schoolLng as any,
      position: form.value.position || null,
      phone: form.value.phone || null
    } as any)

    if (result.success) {
      // 프로필 업데이트 성공
      console.log('✅ 프로필 업데이트 성공 (위치 정보 포함)')
      router.push('/pending-approval')
    } else {
      error.value = result.error || '프로필 업데이트에 실패했습니다.'
    }
  } catch (err: any) {
    error.value = err.message || '프로필 업데이트 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
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

/* 학교 검색 관련 스타일 */
.schoolSearchContainer {
  position: relative;
}

.schoolSearchInput {
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

.searchingMessage {
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

.noResults {
  padding: 12px 16px;
  color: #9ca3af;
  text-align: center;
  font-style: italic;
}

/* 선택된 학교 정보 스타일 */
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
</style>
