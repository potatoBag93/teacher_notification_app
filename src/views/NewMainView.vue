<template>
  <AppLayout>
    <div class="new-main-view flat-design">

      <!-- 실시간 사용문구 티커 -->
      <div class="recent-ticker-section flat-section">
        <h2 class="flat-section-content">실시간 사용 문구</h2>
        <template v-if="isLoading && recentPhrases.length === 0">
          <div class="ticker-skeleton">
            <span class="skeleton-icon">🕒</span>
            <span class="skeleton-text shimmer">문구를 불러오는 중...</span>
          </div>
        </template>
        <template v-else>
          <RecentNoticesTicker :notices="recentPhrases" :selected-items="selectedNotices.map(n => n.content)" @toggle-selection="toggleSelectionByContent" />
        </template>
      </div>

      <!-- 추천문구 섹션 -->
      <div class="recommend-section flat-section">
        <h2 class="flat-section-content">추천문구</h2>
        <template v-if="isLoading && weatherRecommendations.length + tagDiscoveryRecommendations.length + popularRecommendations.length === 0">
          <div class="recommend-lane">
            <h3 class="lane-content">
              <span class="lane-icon">💬</span>
              <span>추천 문구를 불러오는 중...</span>
            </h3>
            <div class="lane-container">
              <div class="lane-carousel">
                <div class="lane-items">
                  <div v-for="n in 5" :key="n" class="recommend-card skeleton-card shimmer">
                    <div class="skeleton-icon">💬</div>
                    <div class="recommend-content skeleton-line long"></div>
                    <div class="recommend-tags">
                      <span class="recommend-tag category skeleton-line short"></span>
                      <span class="recommend-tag sub-tag skeleton-line short"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div v-if="authStore.user">
            <!-- Lane 1: Weather Recommendations -->
            <div class="recommend-lane">
              <h3 class="lane-content">
                <span class="lane-icon">🌦️</span>
                <span>오늘 날씨에 딱 맞는 문구</span>
              </h3>
              <div class="lane-container">
                <div class="lane-carousel" ref="weatherCarousel">
                  <div class="lane-items">
                    <div
                      v-for="notice in weatherRecommendations"
                      :key="notice.id"
                      class="recommend-card"
                      :class="{ selected: isSelected(notice.id) }"
                      @click="toggleSelection(notice)"
                    >
                      <p class="recommend-content">{{ notice.content }}</p>
                      <div class="recommend-tags">
                        <span @click.stop="openModalForTag(notice.categories[0], 'category')" class="recommend-tag category">{{ notice.categories[0] }}</span>
                        <span v-for="tag in notice.tags" :key="tag" @click.stop="openModalForTag(tag, 'tag')" class="recommend-tag sub-tag">{{ tag }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button class="carousel-btn prev" @click="scrollLane('weather', -1)">&#8249;</button>
                <button class="carousel-btn next" @click="scrollLane('weather', 1)">&#8250;</button>
              </div>
            </div>

            <!-- Lane 2: Tag Discovery Recommendations -->
            <div class="recommend-lane">
              <h3 class="lane-content">
                <span class="lane-icon">✨</span>
                <span>새로운 태그를 발견해보세요</span>
              </h3>
              <div class="lane-container">
                <div class="lane-carousel" ref="tagCarousel">
                  <div class="lane-items">
                    <div
                      v-for="notice in tagDiscoveryRecommendations"
                      :key="notice.id"
                      class="recommend-card"
                      :class="{ selected: isSelected(notice.id) }"
                      @click="toggleSelection(notice)"
                    >
                      <p class="recommend-content">{{ notice.content }}</p>
                      <div class="recommend-tags">
                        <span @click.stop="openModalForTag(notice.categories[0], 'category')" class="recommend-tag category">{{ notice.categories[0] }}</span>
                        <span v-for="tag in notice.tags" :key="tag" @click.stop="openModalForTag(tag, 'tag')" class="recommend-tag sub-tag">{{ tag }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button class="carousel-btn prev" @click="scrollLane('tag', -1)">&#8249;</button>
                <button class="carousel-btn next" @click="scrollLane('tag', 1)">&#8250;</button>
              </div>
            </div>

            <!-- Lane 3: Popular/Usage Recommendations -->
            <div class="recommend-lane">
              <h3 class="lane-content">
                <span class="lane-icon">🔥</span>
                <span>지금 가장 인기있는 문구</span>
              </h3>
              <div class="lane-container">
                <div class="lane-carousel" ref="popularCarousel">
                  <div class="lane-items">
                    <div
                      v-for="notice in popularRecommendations"
                      :key="notice.id"
                      class="recommend-card"
                      :class="{ selected: isSelected(notice.id) }"
                      @click="toggleSelection(notice)"
                    >
                      <p class="recommend-content">{{ notice.content }}</p>
                      <div class="recommend-tags">
                        <span @click.stop="openModalForTag(notice.categories[0], 'category')" class="recommend-tag category">{{ notice.categories[0] }}</span>
                        <span v-for="tag in notice.tags" :key="tag" @click.stop="openModalForTag(tag, 'tag')" class="recommend-tag sub-tag">{{ tag }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button class="carousel-btn prev" @click="scrollLane('popular', -1)">&#8249;</button>
                <button class="carousel-btn next" @click="scrollLane('popular', 1)">&#8250;</button>
              </div>
            </div>
          </div>
          <div v-else class="login-prompt-section">
            <div class="prompt-icon">✨</div>
            <h3>맞춤 문구 추천을 받아보세요</h3>
            <p>로그인하고 날씨, 최신 트렌드, 나의 사용 패턴에 맞는 문구를 추천받아보세요!</p>
            <button @click="redirectToLogin" class="login-button">로그인하고 맞춤 추천받기</button>
          </div>
        </template>
      </div>

      <!-- 태그로 문구찾기 섹션 (분리된 컴포넌트) -->
      <TagSearch
        ref="tagSearch"
        :selected-notices="selectedNotices"
        @toggle-selection="toggleSelection"
      />
    </div>

    <div v-if="selectedNotices.length > 0" class="selected-notices-panel">
      <div class="selected-notices-header">선택된 문구 ({{ selectedNotices.length }}개)</div>
      <ul class="selected-notices-list">
        <li v-for="notice in selectedNotices" :key="notice.id" class="selected-notice-item">
          <span>{{ notice.content }}</span>
          <button @click="toggleSelection(notice)" class="remove-btn" content="제거">×</button>
        </li>
      </ul>
      <div class="panel-actions">
          <button @click="clearSelection" class="action-btn">모두 해제</button>
          <button @click="copySelected" class="action-btn">선택 복사</button>
          <button @click="openPreview" class="action-btn primary">알림장 띄우기</button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import RecentNoticesTicker from '../components/RecentNoticesTicker.vue'
import TagSearch from '../components/TagSearch.vue'
import type { Notice, Category } from '../data/notices'
import { useAuthStore } from '../stores/auth'
import { UserUsageService, type UserNoticeUsage } from '../services/userUsageService'

// --- Component State ---
const authStore = useAuthStore()
const router = useRouter()

// Recommendations
const weatherRecommendations = ref<Notice[]>([])
const tagDiscoveryRecommendations = ref<Notice[]>([])
const popularRecommendations = ref<Notice[]>([])
const isLoading = ref(true)

// Tag Search Component Ref
const tagSearch = ref<InstanceType<typeof TagSearch> | null>(null)
const allNotices = ref<Notice[]>([])

// Recent Usages for Ticker
const recentUsages = ref<UserNoticeUsage[]>([])

// Selection
const selectedNotices = ref<Notice[]>([])

// Carousel
const weatherCarousel = ref<HTMLElement | null>(null);
const tagCarousel = ref<HTMLElement | null>(null);
const popularCarousel = ref<HTMLElement | null>(null);

const laneRefs = {
  weather: weatherCarousel,
  tag: tagCarousel,
  popular: popularCarousel,
};

// --- Computed Properties ---

const recentPhrases = computed(() => {
  const uniquePhrases: any[] = [];
  const seencontents = new Set();

  for (const usage of recentUsages.value) {
    const notice = usage.notices as any;
    if (notice && notice.content && !seencontents.has(notice.content)) {
      seencontents.add(notice.content);
      uniquePhrases.push({
        content: notice.content,
        user: notice.author,
        timestamp: usage.used_at,
        category: notice.tags[0],
        subTags: notice.sub_tags || notice.sub_items || []
      });
    }
  }
  
  return uniquePhrases.slice(0, 30);
});

// --- Data Loading Functions ---

const loadRecentUsages = async () => {
  try {
    // Fetch global usages and increase limit to get enough unique phrases
    const usages = await UserUsageService.getGlobalUsageHistory(100); 
    recentUsages.value = usages;
  } catch (e) {
    console.error('Error loading recent usages:', e);
    recentUsages.value = []; // Reset on error
  }
}

const loadAllData = async () => {
  isLoading.value = true
  try {
    const { NoticeService } = await import('../services/noticeService')
    const notices = await NoticeService.getNotices({ limit: 100 });
    allNotices.value = notices;

    const dataPromises = [
      loadRecentUsages(),
      loadWeatherRecommendations(),
      loadPopularRecommendations()
    ];

    if (authStore.user) {
      dataPromises.push(loadCategoryRecommendations());
    } else {
      tagDiscoveryRecommendations.value = [];
    }

    await Promise.allSettled(dataPromises);

  } catch (e) {
    console.error('Error loading initial data:', e)
  } finally {
    isLoading.value = false
  }
}

const loadWeatherRecommendations = async () => {
  try {
    const { WeatherNoticeService } = await import('../services/weatherNoticeService')
    const user = authStore.user as any
    let notices: Notice[] = []
    if (user?.school_lat && user?.school_lng) {
      notices = await WeatherNoticeService.generateWeatherNotices(user.school_lat, user.school_lng)
    } else {
      // Fallback for users without location
      notices = await WeatherNoticeService.generateWeatherNotices(37.5665, 126.9780) // Seoul
    }
    weatherRecommendations.value = notices.slice(0, 5)
  } catch (e) {
    console.error('Failed to load weather recommendations:', e)
  }
}

const loadCategoryRecommendations = async () => {
  try {
    // 동적 임포트로 CategoryRecommendationService 로드
    const { CategoryRecommendationService } = await import('../services/categoryRecommendationService')
    
    const recommendations = await CategoryRecommendationService.getRecommendations(5)
    
    if (recommendations.length > 0) {
      tagDiscoveryRecommendations.value = recommendations
    }    
  } catch (error) {
    console.error('🎯 카테고리 기반 태그 발견 문구 로딩 실패:', error)
  }
}

const loadPopularRecommendations = async () => {
  try {
    const { NoticeService } = await import('../services/noticeService')
    const notices = await NoticeService.getNotices({ limit: 5, orderBy: 'like_count', order: 'desc' })
    popularRecommendations.value = notices
  } catch (e) {
    console.error('Failed to load popular recommendations:', e)
  }
}

// --- Lifecycle Hooks ---

onMounted(() => {
  loadAllData();
});

// --- Methods ---

const redirectToLogin = () => {
  router.push('/login');
}

const scrollLane = (laneName: 'weather' | 'tag' | 'popular', direction: number) => {
  const carouselEl = laneRefs[laneName].value;
  if (!carouselEl) return;
  const scrollAmount = carouselEl.clientWidth * 0.8 * direction;
  carouselEl.scrollBy({ left: scrollAmount, behavior: 'smooth' });
};

const openModalForTag = (tag: string, type: 'category' | 'tag') => {
  if (tagSearch.value) {
    const allAvailableNotices = [
      ...allNotices.value,
      ...weatherRecommendations.value,
      ...tagDiscoveryRecommendations.value,
      ...popularRecommendations.value
    ];
    // Remove duplicates
    const uniqueNotices = allAvailableNotices.filter((notice, index, self) =>
      index === self.findIndex((t) => (
        t.id === notice.id
      ))
    );
    tagSearch.value.openModalForTag(tag, type, uniqueNotices);
  }
};

const toggleSelection = (notice: Notice) => {
  const index = selectedNotices.value.findIndex(n => n.id === notice.id);
  if (index > -1) {
    selectedNotices.value.splice(index, 1)
  } else {
    selectedNotices.value.push(notice)
  }
}

// Ticker sends back content string, so we need to find the notice object
const toggleSelectionByContent = (content: string) => {
    // First, search within the recently used notices, which are the source for the ticker
    const usage = recentUsages.value.find(u => u.notices?.content === content);
    if (usage && usage.notices) {
        toggleSelection(usage.notices as Notice);
        return;
    }

    // As a fallback, search in the other notice lists on the page
    const notice = allNotices.value.find(n => n.content === content) ||
                   weatherRecommendations.value.find(n => n.content === content) ||
                   tagDiscoveryRecommendations.value.find(n => n.content === content) ||
                   popularRecommendations.value.find(n => n.content === content);
    if (notice) {
        toggleSelection(notice);
    }
}

const isSelected = (noticeId: string) => {
  return selectedNotices.value.some(n => n.id === noticeId)
}

const clearSelection = () => {
  selectedNotices.value = [];
}

const copySelected = () => {
  if (selectedNotices.value.length === 0) return;
  const textToCopy = selectedNotices.value.map(n => n.content).join('\n');
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('선택한 문구가 클립보드에 복사되었습니다.');
  }).catch(err => {
    console.error('복사 실패:', err);
    alert('복사에 실패했습니다.');
  });
}

const saveUsageRecords = async () => {
  if (!authStore.user) return;
  try {
    const noticeIds = selectedNotices.value.map(n => n.id);
    if (noticeIds.length > 0) {
      await UserUsageService.saveMultipleNoticeUsage(noticeIds);
    }
  } catch (error) {
    console.error('사용 기록 저장 실패:', error);
  }
}

const openPreview = async () => {
  if (selectedNotices.value.length === 0) {
    alert('미리 볼 문구를 먼저 선택해주세요.');
    return;
  }
  await saveUsageRecords();
  const content = selectedNotices.value.map(n => `<p>${n.content}</p>`).join('');
  sessionStorage.setItem('chalkboard-preview-content', content);
  const previewUrl = '/chalkboard-preview';
  window.open(previewUrl, 'ChalkboardPreview', 'width=1024,height=768,scrollbars=no,resizable=yes');
}
</script>

<style src="./NewMainView.css"></style>
