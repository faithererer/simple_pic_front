<template>
  <div class="min-h-screen py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 顶部控制栏 -->
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold">媒体库</h2>
        <div class="flex gap-4">
          <select v-model="filter" class="input max-w-xs">
            <option value="all">全部文件</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
            <option value="audio">音频</option>
          </select>
          <div class="relative">
            <button 
              @click="showSortMenu = !showSortMenu"
              class="btn btn-secondary flex items-center gap-2"
            >
              {{ sortOptions[currentSort] }}
              <span class="text-xs">▼</span>
            </button>
            <!-- 排序下拉菜单 -->
            <div v-if="showSortMenu"
                 class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10">
              <button v-for="(label, value) in sortOptions" 
                      :key="value"
                      @click="handleSort(value)"
                      class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                      :class="{ 'text-primary-500': currentSort === value }"
              >
                {{ label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading && !mediaItems.length" 
           class="min-h-[400px] flex items-center justify-center">
        <ScrollLoader text="正在加载媒体库" />
      </div>

      <!-- 媒体网格 -->
      <div v-if="groupedMediaItems.length" class="space-y-8">
        <div v-for="group in groupedMediaItems" 
             :key="group.date" 
             class="space-y-4">
          <!-- 日期标题 -->
          <h3 class="text-lg font-medium sticky top-0 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
            {{ formatGroupDate(group.date) }}
          </h3>

          <!-- 分组网格 -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <TransitionGroup 
              name="media-grid"
              appear
              tag="div"
              class="contents"
            >
              <div v-for="item in group.items" 
                   :key="item.id" 
                   class="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <!-- 预览图 -->
                <template v-if="item.type.startsWith('image')">
                  <div v-if="!item.loaded" 
                       class="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700">
                    <!-- 骨架屏动画 -->
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shine"></div>
                  </div>
                  <img :src="item.thumbnailUrl ? `${API_BASE_URL}${item.thumbnailUrl}` : item.url"
                       :alt="item.name"
                       class="w-full h-full object-cover transition-opacity duration-300"
                       :class="{ 'opacity-0': !item.loaded }"
                       @load="handleImageLoad(item)"
                       @error="handleImageError(item)">
                  </template>
                <div v-else class="w-full h-full flex items-center justify-center text-4xl">
                  {{ getFileIcon(item.type) }}
                </div>
                
                <!-- 悬浮操作栏 -->
                <div class="media-overlay">
                  <!-- 渐变背景 -->
                  <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
                  
                  <!-- 文件信息和操作按钮 -->
                  <div class="relative p-4 text-white">
                    <p class="text-sm font-medium mb-3 truncate">{{ item.name }}</p>
                    <div class="flex items-center justify-center gap-3">
                      <button @click.stop="openPreview(item)" 
                              class="action-btn">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        <span class="text-xs">查看</span>
                      </button>

                      <button @click.stop="copyLink(item)" 
                              class="action-btn">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                        </svg>
                        <span class="text-xs">复制链接</span>
                      </button>

                      <button @click.stop="handleDelete(item)" 
                              class="action-btn text-red-400 hover:text-red-300">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        <span class="text-xs">删除</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="min-h-[400px] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <div class="text-6xl mb-4">📁</div>
        <p class="text-lg">暂无媒体文件</p>
      </div>

      <!-- 加载更多触发器 - 移到网格外部 -->
      <div v-if="hasMore && !initialLoading" 
           ref="loadMoreTrigger"
           class="scroll-trigger">
        <ScrollLoader v-if="loading" small />
        <!-- 添加一个占位元素确保触发器始终可见 -->
        <div v-else class="h-4"></div>
      </div>
    </div>

    <!-- 媒体预览模态框 -->
    <MediaPreview
      v-if="selectedItem"
      :is-open="isPreviewOpen"
      :item="selectedItem"
      @close="closePreview"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick, onUpdated } from 'vue'
import MediaPreview from '../components/MediaPreview.vue'
import ScrollLoader from '../components/ScrollLoader.vue'
import { getMediaList, deleteFile } from '../api/upload'
import { ElMessage } from 'element-plus'
import { API_BASE_URL } from '../api/config'

const filter = ref('all')
const isPreviewOpen = ref(false)
const selectedItem = ref(null)
const loading = ref(false)
const showSortMenu = ref(false)
const currentSort = ref('uploadedAt')
const page = ref(1)
const hasMore = ref(true)
const mediaItems = ref([])
const initialLoading = ref(true)
const ITEMS_PER_PAGE = 20

// 排序选项
const sortOptions = {
  uploadedAt: '最近上传',
  name: '文件名',
  size: '文件大小'
}

// 加载媒体列表
const loadMediaList = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  try {
    const result = await getMediaList({
      page: isLoadMore ? page.value : 1,
      limit: ITEMS_PER_PAGE,
      type: filter.value,
      sortBy: currentSort.value,
      order: 'desc'
    })
    
    if (result.success) {
      const processedItems = result.data.items.map(item => ({
        ...item,
        url: item.url.startsWith('http') ? item.url : `${API_BASE_URL}${item.url}`,
        thumbnailUrl: item.thumbnailUrl,
        loaded: false, // 添加加载状态标记
        error: false // 添加错误状态标记
      }))

      if (isLoadMore) {
        mediaItems.value = [...mediaItems.value, ...processedItems]
      } else {
        mediaItems.value = processedItems
      }
      
      hasMore.value = processedItems.length === ITEMS_PER_PAGE
      page.value = isLoadMore ? page.value : 1
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.error({
      message: `加载失败: ${error.message || '未知错误'}`,
      type: 'error',
      duration: 5000
    })
  } finally {
    loading.value = false
    if (!isLoadMore) {
      initialLoading.value = false
    }
  }
}

// 加载更多触发器
const loadMoreTrigger = ref(null)
let observer = null

// 设置 Intersection Observer
const setupIntersectionObserver = () => {
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(async (entries) => {
    const trigger = entries[0]
    if (trigger.isIntersecting && hasMore.value && !loading.value) {
      console.log('触发加载更多')
      try {
        page.value++
        await loadMediaList(true)
      } catch (error) {
        console.error('加载更多失败:', error)
      }
    }
  }, {
    rootMargin: '100px',
    threshold: 0.1
  })

  // 确保在下一个事件循环中设置观察者
  nextTick(() => {
    if (loadMoreTrigger.value) {
      observer.observe(loadMoreTrigger.value)
      console.log('设置观察者成功')
    }
  })
}

// 监听 hasMore 和 loading 状态变化
watch([hasMore, loading], ([newHasMore, newLoading]) => {
  if (newHasMore && !newLoading) {
    setupIntersectionObserver()
  }
})

// 组件挂载时初始化
onMounted(async () => {
  await loadMediaList()
  setupIntersectionObserver()
})

// 组件更新时重新设置观察者
onUpdated(() => {
  if (hasMore.value && !loading.value && loadMoreTrigger.value) {
    setupIntersectionObserver()
  }
})

// 组件卸载时清理
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// 预览控制
const openPreview = (item) => {
  selectedItem.value = item
  isPreviewOpen.value = true
}

const closePreview = () => {
  isPreviewOpen.value = false
  selectedItem.value = null
}

// 复制链接
const copyLink = async (item) => {
  try {
    if (item.url) {
      await navigator.clipboard.writeText(item.url)
      ElMessage.success({
        message: '链接已复制到剪贴板',
        type: 'success',
        duration: 2000
      })
    } else {
      throw new Error('文件链接不可用')
    }
  } catch (error) {
    ElMessage.error({
      message: `复制失败: ${error.message}`,
      type: 'error',
      duration: 3000
    })
  }
}

// 删除文件
const handleDelete = async (item) => {
  try {
    const result = await deleteFile(item.id)
    if (result.success) {
      mediaItems.value = mediaItems.value.filter(i => i.id !== item.id)
      ElMessage.success({
        message: '文件删除成功',
        type: 'success',
        duration: 3000
      })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error({
      message: `删除失败: ${error.message || '未知错误'}`,
      type: 'error',
      duration: 5000
    })
  }
}

// 处理排序
const handleSort = (value) => {
  currentSort.value = value
  showSortMenu.value = false
  page.value = 1
  initialLoading.value = true
  loadMediaList()
}

// 监听筛选变化
watch(filter, () => {
  page.value = 1
  initialLoading.value = true
  loadMediaList()
})

// 点击外部关闭排序菜单
const handleClickOutside = (event) => {
  if (showSortMenu.value) {
    showSortMenu.value = false
  }
}

// 添加全局点击事件监听
window.addEventListener('click', handleClickOutside)

// 处理图片加载完成
const handleImageLoad = (item) => {
  const index = mediaItems.value.findIndex(i => i.id === item.id)
  if (index !== -1) {
    mediaItems.value[index] = {
      ...mediaItems.value[index],
      loaded: true
    }
  }
}

// 处理图片加载失败
const handleImageError = (item) => {
  const index = mediaItems.value.findIndex(i => i.id === item.id)
  if (index !== -1) {
    mediaItems.value[index] = {
      ...mediaItems.value[index],
      error: true,
      loaded: true
    }
  }
}

// 获取文件类型图标
const getFileIcon = (type) => {
  if (!type) return '📄' // 默认文件图标
  
  // 根据MIME类型返回对应图标
  const iconMap = {
    'image/': '🖼️',
    'video/': '🎥',
    'audio/': '🎵',
    'text/': '📝',
    'application/pdf': '📑',
    'application/msword': '📄',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📄', // .docx
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊', // .xlsx
    'application/vnd.ms-powerpoint': '📽️',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️', // .pptx
    'application/zip': '📦',
    'application/x-rar-compressed': '📦',
    'application/x-7z-compressed': '📦',
  }

  // 遍历图标映射表，查找匹配的类型
  for (const [mimeType, icon] of Object.entries(iconMap)) {
    if (type.startsWith(mimeType)) {
      return icon
    }
  }

  // 如果没有匹配的类型，返回默认文件图标
  return '📄'
}

// 按日期分组的媒体项
const groupedMediaItems = computed(() => {
  const groups = mediaItems.value.reduce((acc, item) => {
    // 获取日期（不包含时间）
    const date = item.uploadedAt.split('T')[0]
    
    // 查找或创建分组
    let group = acc.find(g => g.date === date)
    if (!group) {
      group = {
        date,
        items: []
      }
      acc.push(group)
    }
    
    group.items.push(item)
    return acc
  }, [])

  // 按日期降序排序
  return groups.sort((a, b) => b.date.localeCompare(a.date))
})

// 格式化分组日期
const formatGroupDate = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // 判断是否是今天或昨天
  if (dateString === today.toISOString().split('T')[0]) {
    return '今天'
  } else if (dateString === yesterday.toISOString().split('T')[0]) {
    return '昨天'
  }

  // 判断是否是今年
  const isThisYear = date.getFullYear() === today.getFullYear()
  
  // 根据是否是今年返回不同的格式
  return date.toLocaleDateString('zh-CN', {
    year: isThisYear ? undefined : 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* 网格动画 */
.media-grid-move,
.media-grid-enter-active,
.media-grid-leave-active {
  transition: all 0.5s ease;
}

.media-grid-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(30px);
}

.media-grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.media-grid-leave-active {
  position: absolute;
}

.loading {
  @apply inline-block w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin;
}

.btn-danger {
  @apply bg-red-500 text-white hover:bg-red-600 active:bg-red-700;
}

/* 更新加载触发器样式 */
.scroll-trigger {
  @apply py-8 flex items-center justify-center;
  min-height: 100px;
  margin-top: 1rem;
  /* 确保触发器可见 */
  opacity: 1;
  pointer-events: none;
}

/* 添加淡入淡出效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 骨架屏动画 */
@keyframes skeleton-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton-shine {
  animation: skeleton-shine 1.5s infinite;
}

/* 图片淡入效果 */
img {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}

img.opacity-0 {
  opacity: 0;
}

/* 图片容器基础样式 */
.group {
  @apply relative transition-all duration-300;
}

/* 悬浮效果 */
.group:hover {
  @apply scale-[1.02] shadow-lg;
}

.group:hover img {
  @apply brightness-75;
}

/* 悬浮操作区样式 */
.media-overlay {
  @apply absolute inset-0 flex flex-col justify-end opacity-0 transition-all duration-300;
  pointer-events: none;
}

.group:hover .media-overlay {
  @apply opacity-100;
  pointer-events: auto;
}

/* 操作按钮样式 */
.action-btn {
  @apply flex flex-col items-center gap-1 px-3 py-2 rounded-lg
         backdrop-blur-sm bg-white/10
         transition-all duration-300
         hover:bg-white/20 active:bg-white/30
         hover:scale-105 active:scale-95
         text-white;
  pointer-events: auto;
}

/* 移除其他冲突的样式 */
.hover-controls,
.hover-action-btn {
  display: none;
}

/* 日期标题样式 */
h3 {
  @apply transition-colors duration-300;
  letter-spacing: -0.01em;
}

/* 分组容器样式 */
.space-y-8 > div {
  @apply transition-all duration-500;
}

/* 优化网格动画 */
.media-grid-move {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.media-grid-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.media-grid-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: absolute;
}

.media-grid-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.media-grid-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style> 