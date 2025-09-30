<template>
  <div :class="$style.adminPage">
    <!-- Header -->
    <header :class="$style.header">
      <div :class="$style.headerContent">
        <!-- Logo -->
        <div :class="$style.logoSection">
          <div :class="$style.logo">📝</div>
          <div>
            <h1 :class="$style.serviceTitle">알뭐</h1>
            <span :class="$style.adminBadge">ADMIN</span>
          </div>
        </div>
        
        <!-- Navigation -->
        <nav :class="$style.navMenu">
          <a href="#" :class="[$style.navItem, { [$style.active]: activeTab === 'dashboard' }]" @click="activeTab = 'dashboard'">
            대시보드
          </a>
          <a href="#" :class="[$style.navItem, { [$style.active]: activeTab === 'users' }]" @click="activeTab = 'users'">
            사용자 관리
          </a>
          <a href="#" :class="[$style.navItem, { [$style.active]: activeTab === 'content' }]" @click="activeTab = 'content'">
            콘텐츠 관리
          </a>
          <a href="#" :class="[$style.navItem, { [$style.active]: activeTab === 'settings' }]" @click="activeTab = 'settings'">
            시스템 설정
          </a>
          <router-link to="/" :class="$style.navItem">사용자 뷰</router-link>
        </nav>
        
        <!-- Search & User Menu -->
        <div :class="$style.headerRight">
          <div :class="$style.searchBox">
            <input 
              v-model="searchQuery"
              type="text" 
              :class="$style.searchInput" 
              placeholder="관리자 기능 검색..."
              @input="handleSearch"
            />
          </div>
          <button :class="$style.notificationBtn" title="알림">
            🔔
          </button>
          <div :class="$style.userAvatar">관</div>
        </div>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <main :class="$style.mainContent">
      <!-- 페이지 헤더 -->
      <div :class="$style.pageHeader">
        <div>
          <h1 :class="$style.pageTitle">🛡️ 관리자 대시보드</h1>
          <p :class="$style.pageSubtitle">시스템 현황과 사용자 활동을 모니터링하세요</p>
        </div>
        <div :class="$style.pageActions">
          <BaseButton variant="outline" @click="generateReport">📊 리포트 생성</BaseButton>
          <BaseButton variant="primary" @click="openSystemSettings">⚙️ 시스템 설정</BaseButton>
        </div>
      </div>

      <!-- 대시보드 탭 -->
      <div v-if="activeTab === 'dashboard'">
        <!-- 통계 카드 -->
        <div :class="$style.statsGrid">
          <BaseCard :class="$style.statCard">
            <div :class="$style.statHeader">
              <div :class="$style.statTitle">전체 사용자</div>
              <div :class="[$style.statIcon, $style.primaryIcon]">👥</div>
            </div>
            <div :class="$style.statValue">{{ stats.totalUsers.toLocaleString() }}</div>
            <div :class="[$style.statChange, $style.positive]">
              {{ formatGrowth(stats.userGrowth) }} 지난 달 대비
            </div>
          </BaseCard>
          
          <BaseCard :class="$style.statCard">
            <div :class="$style.statHeader">
              <div :class="$style.statTitle">활성 사용자</div>
              <div :class="[$style.statIcon, $style.successIcon]">✅</div>
            </div>
            <div :class="$style.statValue">{{ stats.activeUsers.toLocaleString() }}</div>
            <div :class="[$style.statChange, $style.positive]">
              {{ formatGrowth(stats.activeUserGrowth) }} 지난 주 대비
            </div>
          </BaseCard>
          
          <BaseCard :class="$style.statCard">
            <div :class="$style.statHeader">
              <div :class="$style.statTitle">생성된 문구</div>
              <div :class="[$style.statIcon, $style.warningIcon]">📝</div>
            </div>
            <div :class="$style.statValue">{{ stats.totalNotices.toLocaleString() }}</div>
            <div :class="[$style.statChange, $style.positive]">
              {{ formatGrowth(stats.noticeGrowth) }} 지난 달 대비
            </div>
          </BaseCard>
          
          <BaseCard :class="$style.statCard">
            <div :class="$style.statHeader">
              <div :class="$style.statTitle">서버 가동률</div>
              <div :class="[$style.statIcon, $style.infoIcon]">🖥️</div>
            </div>
            <div :class="$style.statValue">{{ formatUptime(stats.serverUptime) }}</div>
            <div :class="[$style.statChange, $style.positive]">정상 운영</div>
          </BaseCard>
        </div>

        <!-- 관리 섹션 -->
        <div :class="$style.managementGrid">
          <!-- 사용자 관리 -->
          <BaseCard :class="$style.sectionCard">
            <h2 :class="$style.sectionTitle">
              👥 최근 가입 사용자
            </h2>
            
            <div :class="$style.tableContainer">
              <table :class="$style.userTable">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>학교</th>
                    <th>상태</th>
                    <th>가입일</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in recentUsers" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td>{{ user.school }}</td>
                    <td>
                      <span :class="[$style.userStatus, $style[`status${user.status.charAt(0).toUpperCase() + user.status.slice(1)}`]]">
                        {{ getStatusText(user.status) }}
                      </span>
                    </td>
                    <td>{{ formatDate(user.registeredAt) }}</td>
                    <td>
                      <BaseButton 
                        v-if="user.status === 'pending'" 
                        variant="primary" 
                        size="sm"
                        @click="approveUser(user)"
                      >
                        승인
                      </BaseButton>
                      <BaseButton 
                        variant="outline" 
                        size="sm"
                        @click="viewUserDetails(user)"
                      >
                        상세
                      </BaseButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div :class="$style.sectionFooter">
              <BaseButton variant="outline" @click="activeTab = 'users'">모든 사용자 보기</BaseButton>
            </div>
          </BaseCard>

          <!-- 시스템 모니터링 -->
          <BaseCard :class="$style.sectionCard">
            <h2 :class="$style.sectionTitle">
              📊 시스템 모니터링
            </h2>
            
            <div :class="$style.monitoringGrid">
              <div :class="$style.monitorItem">
                <span :class="$style.monitorLabel">CPU 사용률</span>
                <div :class="$style.monitorRight">
                  <span :class="$style.monitorValue">{{ monitor.cpuUsage }}%</span>
                  <div :class="[$style.statusIndicator, $style[getStatusColor(monitor.cpuUsage, 80)]]"></div>
                </div>
              </div>
              
              <div :class="$style.monitorItem">
                <span :class="$style.monitorLabel">메모리 사용량</span>
                <div :class="$style.monitorRight">
                  <span :class="$style.monitorValue">{{ monitor.memoryUsage }}%</span>
                  <div :class="[$style.statusIndicator, $style[getStatusColor(monitor.memoryUsage, 85)]]"></div>
                </div>
              </div>
              
              <div :class="$style.monitorItem">
                <span :class="$style.monitorLabel">디스크 사용량</span>
                <div :class="$style.monitorRight">
                  <span :class="$style.monitorValue">{{ monitor.diskUsage }}%</span>
                  <div :class="[$style.statusIndicator, $style[getStatusColor(monitor.diskUsage, 70)]]"></div>
                </div>
              </div>
              
              <div :class="$style.monitorItem">
                <span :class="$style.monitorLabel">네트워크 지연</span>
                <div :class="$style.monitorRight">
                  <span :class="$style.monitorValue">{{ monitor.networkLatency }}ms</span>
                  <div :class="[$style.statusIndicator, $style[getLatencyColor(monitor.networkLatency)]]"></div>
                </div>
              </div>
              
              <div :class="$style.monitorItem">
                <span :class="$style.monitorLabel">활성 연결</span>
                <div :class="$style.monitorRight">
                  <span :class="$style.monitorValue">{{ monitor.activeConnections }}</span>
                  <div :class="[$style.statusIndicator, $style.statusGood]"></div>
                </div>
              </div>
              
              <div :class="$style.monitorItem">
                <span :class="$style.monitorLabel">오류율</span>
                <div :class="$style.monitorRight">
                  <span :class="$style.monitorValue">{{ monitor.errorRate }}%</span>
                  <div :class="[$style.statusIndicator, $style[getErrorColor(monitor.errorRate)]]"></div>
                </div>
              </div>
            </div>
            
            <div :class="$style.activitySection">
              <h3 :class="$style.subsectionTitle">실시간 활동</h3>
              <div :class="$style.activityList">
                <div 
                  v-for="log in activityLogs.slice(0, 5)" 
                  :key="log.id"
                  :class="$style.activityItem"
                >
                  <div :class="$style.activityTime">
                    {{ formatTime(log.timestamp) }}
                  </div>
                  <div :class="$style.activityContent">
                    <span :class="$style.activityUser">{{ log.user }}</span>님이 
                    {{ log.action }}{{ log.details ? ` (${log.details})` : '' }}
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- 사용량 차트 -->
        <BaseCard :class="$style.sectionCard">
          <h2 :class="$style.sectionTitle">
            📈 사용량 통계
          </h2>
          
          <div :class="$style.chartPlaceholder">
            📊 사용량 차트 (Chart.js 또는 다른 차트 라이브러리로 구현)
          </div>
          
          <div :class="$style.chartStats">
            <div :class="[$style.chartStatItem, $style.primaryBg]">
              <div :class="$style.chartStatValue">156</div>
              <div :class="$style.chartStatLabel">오늘 신규 가입</div>
            </div>
            <div :class="[$style.chartStatItem, $style.successBg]">
              <div :class="$style.chartStatValue">2,341</div>
              <div :class="$style.chartStatLabel">일일 활성 사용자</div>
            </div>
            <div :class="[$style.chartStatItem, $style.warningBg]">
              <div :class="$style.chartStatValue">489</div>
              <div :class="$style.chartStatLabel">생성된 문구</div>
            </div>
            <div :class="[$style.chartStatItem, $style.infoBg]">
              <div :class="$style.chartStatValue">98.7%</div>
              <div :class="$style.chartStatLabel">서비스 안정성</div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- 사용자 관리 탭 -->
      <div v-else-if="activeTab === 'users'" :class="$style.usersTab">
        <div :class="$style.tabHeader">
          <h2 :class="$style.tabTitle">사용자 관리</h2>
          <div :class="$style.tabActions">
            <SearchInput
              v-model="userSearchQuery"
              placeholder="사용자 검색..."
              :class="$style.userSearch"
              @search="handleUserSearch"
            />
            <select v-model="userStatusFilter" :class="$style.statusFilter">
              <option value="">모든 상태</option>
              <option value="active">활성</option>
              <option value="pending">대기</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
        </div>

        <BaseCard :class="$style.usersCard">
          <div :class="$style.tableContainer">
            <table :class="$style.userTable">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>학교</th>
                  <th>학년/과목</th>
                  <th>상태</th>
                  <th>가입일</th>
                  <th>문구 수</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.school }}</td>
                  <td>{{ user.grade }} / {{ user.subject }}</td>
                  <td>
                    <span :class="[$style.userStatus, $style[`status${user.status.charAt(0).toUpperCase() + user.status.slice(1)}`]]">
                      {{ getStatusText(user.status) }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.registeredAt) }}</td>
                  <td>{{ user.noticeCount }}</td>
                  <td>
                    <div :class="$style.actionButtons">
                      <BaseButton 
                        v-if="user.status === 'pending'" 
                        variant="primary" 
                        size="sm"
                        @click="approveUser(user)"
                      >
                        승인
                      </BaseButton>
                      <BaseButton 
                        v-if="user.status === 'active'" 
                        variant="danger" 
                        size="sm"
                        @click="suspendUser(user)"
                      >
                        정지
                      </BaseButton>
                      <BaseButton 
                        variant="outline" 
                        size="sm"
                        @click="viewUserDetails(user)"
                      >
                        상세
                      </BaseButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </div>

      <!-- 기타 탭들은 플레이스홀더 -->
      <div v-else :class="$style.placeholderTab">
        <h2>{{ getTabTitle(activeTab) }}</h2>
        <p>이 기능은 개발 중입니다.</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import SearchInput from '@/components/common/SearchInput.vue'
import {
  mockAdminUsers,
  mockSystemStats,
  mockSystemMonitor,
  mockActivityLogs,
  getRecentUsers,
  searchUsers,
  formatGrowth,
  formatUptime,
  type AdminUser
} from '@/data/admin'

// 반응형 상태
const activeTab = ref('dashboard')
const searchQuery = ref('')
const userSearchQuery = ref('')
const userStatusFilter = ref('')

// 데이터
const users = ref([...mockAdminUsers])
const stats = ref(mockSystemStats)
const monitor = ref(mockSystemMonitor)
const activityLogs = ref([...mockActivityLogs])

// 계산된 속성
const recentUsers = computed(() => getRecentUsers(5))

const filteredUsers = computed(() => {
  let filtered = users.value

  // 검색 필터
  if (userSearchQuery.value) {
    filtered = searchUsers(userSearchQuery.value)
  }

  // 상태 필터
  if (userStatusFilter.value) {
    filtered = filtered.filter(user => user.status === userStatusFilter.value)
  }

  return filtered
})

// 메서드
const handleSearch = () => {
  // console.log('관리자 기능 검색:', searchQuery.value)
}

const handleUserSearch = () => {
  // console.log('사용자 검색:', userSearchQuery.value)
}

const generateReport = () => {
  alert('리포트 생성 기능을 실행합니다.')
}

const openSystemSettings = () => {
  alert('시스템 설정 페이지로 이동합니다.')
}

const approveUser = (user: AdminUser) => {
  if (confirm(`${user.name}님의 가입을 승인하시겠습니까?`)) {
    user.status = 'active'
    stats.value.activeUsers++
    stats.value.pendingUsers--
    alert(`${user.name}님이 승인되었습니다.`)
  }
}

const suspendUser = (user: AdminUser) => {
  if (confirm(`${user.name}님을 정지시키겠습니까?`)) {
    user.status = 'inactive'
    stats.value.activeUsers--
    alert(`${user.name}님이 정지되었습니다.`)
  }
}

const viewUserDetails = (user: AdminUser) => {
  alert(`${user.name}님의 상세 정보를 표시합니다.`)
}

const getStatusText = (status: AdminUser['status']): string => {
  const statusMap = {
    active: '활성',
    pending: '대기',
    inactive: '비활성'
  }
  return statusMap[status]
}

const getStatusColor = (value: number, threshold: number): string => {
  if (value >= threshold) return 'statusError'
  if (value >= threshold * 0.8) return 'statusWarning'
  return 'statusGood'
}

const getLatencyColor = (latency: number): string => {
  if (latency > 50) return 'statusError'
  if (latency > 25) return 'statusWarning'
  return 'statusGood'
}

const getErrorColor = (errorRate: number): string => {
  if (errorRate > 1) return 'statusError'
  if (errorRate > 0.5) return 'statusWarning'
  return 'statusGood'
}

const getTabTitle = (tab: string): string => {
  const titles = {
    content: '콘텐츠 관리',
    settings: '시스템 설정'
  }
  return titles[tab as keyof typeof titles] || tab
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(() => {
  // 30초마다 통계 업데이트
  setInterval(() => {
    // console.log('통계 데이터 업데이트됨')
  }, 30000)
})
</script>

<style module>
.adminPage {
  min-height: 100vh;
  background: #f8fafc;
}

/* Header 스타일 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  height: 64px;
}

.headerContent {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  height: 100%;
  gap: 24px;
}

.logoSection {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.serviceTitle {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.adminBadge {
  background: #fef3c7;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
}

.navMenu {
  display: flex;
  gap: 24px;
  margin-left: 32px;
}

.navItem {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.navItem:hover,
.navItem.active {
  color: #3b82f6;
  background: #eff6ff;
}

.headerRight {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.searchBox {
  position: relative;
  width: 300px;
}

.searchInput {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.notificationBtn {
  padding: 8px;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 16px;
}

.notificationBtn:hover {
  color: #3b82f6;
  background: #f3f4f6;
}

.userAvatar {
  width: 32px;
  height: 32px;
  background: #fef3c7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #92400e;
  font-size: 14px;
  font-weight: 500;
}

/* 메인 콘텐츠 */
.mainContent {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.pageTitle {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.pageSubtitle {
  color: #6b7280;
  margin: 8px 0 0 0;
  font-size: 16px;
}

.pageActions {
  display: flex;
  gap: 12px;
}

/* 통계 카드 */
.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.statCard {
  padding: 24px;
}

.statHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.statTitle {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.statIcon {
  padding: 8px;
  border-radius: 6px;
  font-size: 18px;
}

.primaryIcon {
  background: #dbeafe;
  color: #3b82f6;
}

.successIcon {
  background: #dcfce7;
  color: #16a34a;
}

.warningIcon {
  background: #fef3c7;
  color: #d97706;
}

.infoIcon {
  background: #e0f2fe;
  color: #0284c7;
}

.statValue {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.statChange {
  font-size: 14px;
  font-weight: 500;
}

.positive {
  color: #16a34a;
}

.negative {
  color: #dc2626;
}

/* 관리 섹션 */
.managementGrid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.sectionCard {
  padding: 24px;
}

.sectionTitle {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sectionFooter {
  margin-top: 16px;
  text-align: center;
}

/* 테이블 */
.tableContainer {
  overflow-x: auto;
}

.userTable {
  width: 100%;
  border-collapse: collapse;
}

.userTable th,
.userTable td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.userTable th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.userStatus {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.statusActive {
  background: #dcfce7;
  color: #166534;
}

.statusInactive {
  background: #f3f4f6;
  color: #374151;
}

.statusPending {
  background: #fef3c7;
  color: #92400e;
}

/* 시스템 모니터링 */
.monitoringGrid {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.monitorItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
}

.monitorLabel {
  font-weight: 500;
  color: #374151;
}

.monitorRight {
  display: flex;
  align-items: center;
  gap: 8px;
}

.monitorValue {
  font-weight: 600;
  color: #1f2937;
}

.statusIndicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.statusGood {
  background: #16a34a;
}

.statusWarning {
  background: #d97706;
}

.statusError {
  background: #dc2626;
}

/* 활동 로그 */
.activitySection {
  margin-top: 24px;
}

.subsectionTitle {
  font-size: 18px;
  margin-bottom: 16px;
  color: #374151;
}

.activityList {
  max-height: 400px;
  overflow-y: auto;
}

.activityItem {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.activityItem:last-child {
  border-bottom: none;
}

.activityTime {
  font-size: 12px;
  color: #9ca3af;
  min-width: 60px;
  flex-shrink: 0;
}

.activityContent {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.activityUser {
  font-weight: 500;
  color: #3b82f6;
}

/* 차트 */
.chartPlaceholder {
  height: 300px;
  background: #f8fafc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 18px;
  margin-bottom: 24px;
}

.chartStats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.chartStatItem {
  text-align: center;
  padding: 16px;
  border-radius: 6px;
}

.primaryBg {
  background: #eff6ff;
}

.successBg {
  background: #f0fdf4;
}

.warningBg {
  background: #fffbeb;
}

.infoBg {
  background: #f0f9ff;
}

.chartStatValue {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.chartStatLabel {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* 사용자 관리 탭 */
.usersTab {
  width: 100%;
}

.tabHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 24px;
}

.tabTitle {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.tabActions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.userSearch {
  width: 300px;
}

.statusFilter {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.usersCard {
  padding: 24px;
}

.actionButtons {
  display: flex;
  gap: 8px;
}

/* 플레이스홀더 탭 */
.placeholderTab {
  text-align: center;
  padding: 60px 20px;
}

.placeholderTab h2 {
  font-size: 24px;
  color: #1f2937;
  margin-bottom: 16px;
}

.placeholderTab p {
  color: #6b7280;
  font-size: 16px;
}

/* 반응형 */
@media (max-width: 1024px) {
  .managementGrid {
    grid-template-columns: 1fr;
  }
  
  .statsGrid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .navMenu {
    display: none;
  }
  
  .searchBox {
    width: 100%;
  }
  
  .pageHeader {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .tabHeader {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .tabActions {
    flex-direction: column;
  }
  
  .userSearch {
    width: 100%;
  }
  
  .userTable {
    font-size: 14px;
  }
  
  .userTable th,
  .userTable td {
    padding: 8px;
  }
  
  .actionButtons {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
