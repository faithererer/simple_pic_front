<template>
  <div v-if="isOpen" 
       class="fixed inset-0 z-50 flex items-center justify-center"
       :class="isDark ? 'bg-black/95' : 'bg-white/95'"
       @click="close">
    <!-- 关闭按钮 -->
    <button @click="close"
            class="absolute top-4 right-4 p-3 rounded-full transition-all duration-300 hover:scale-110"
            :class="isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'">
      <svg class="w-6 h-6" :class="isDark ? 'text-white' : 'text-gray-800'" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>

    <div class="relative max-w-6xl w-full mx-4 flex flex-col" @click.stop>
      <!-- 顶部工具栏 -->
      <div class="mb-4 flex justify-between items-center" :class="isDark ? 'text-white' : 'text-gray-800'">
        <h3 class="text-lg font-medium truncate max-w-2xl">
          {{ item.name }}
        </h3>
        <div class="flex items-center gap-4">
          <!-- 文件信息 -->
          <div class="text-sm opacity-75">
            <span>{{ formatFileSize(item.size) }}</span>
            <span class="mx-2">•</span>
            <span>{{ formatDate(item.uploadedAt) }}</span>
          </div>
          <!-- 操作按钮组 -->
          <div class="flex items-center gap-2">
            <button @click="copyUrl" 
                    class="btn-icon"
                    :class="buttonClass">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              <span class="text-sm">复制链接</span>
            </button>
            <a v-if="item.url"
               :href="item.url"
               target="_blank"
               :download="item.name"
               class="btn-icon"
               :class="buttonClass">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              <span class="text-sm">下载</span>
            </a>
          </div>
        </div>
      </div>

      <!-- 媒体内容 -->
      <div class="relative rounded-2xl overflow-hidden shadow-2xl"
           :class="isDark ? 'bg-gray-900' : 'bg-white'">
        <div class="relative">
          <!-- 图片预览 -->
          <div v-if="item.type?.startsWith('image')" 
               class="relative group">
            <img :src="item.url"
                 :alt="item.name"
                 class="w-full h-auto max-h-[70vh] object-contain"
                 :class="isDark ? 'bg-black' : 'bg-gray-100'"
                 @load="handleImageLoad">
            
            <!-- 图片尺寸信息 -->
            <div v-if="item.metadata?.width" 
                 class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {{ item.metadata.width }} × {{ item.metadata.height }}
            </div>
          </div>
          
          <!-- 视频预览 -->
          <div v-else-if="item.type?.startsWith('video')" class="relative">
            <video :src="item.url"
                   controls
                   class="w-full max-h-[70vh] object-contain"
                   :class="isDark ? 'bg-black' : 'bg-gray-100'"
                   controlsList="nodownload">
              您的浏览器不支持视频播放
            </video>
            <!-- 视频时长 -->
            <div v-if="item.metadata?.duration" 
                 class="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm">
              {{ formatDuration(item.metadata.duration) }}
            </div>
          </div>
          
          <!-- 音频预览 -->
          <div v-else-if="item.type?.startsWith('audio')" 
               class="p-8"
               :class="isDark ? 'bg-gradient-to-br from-primary-500/5 to-purple-500/5' : 'bg-gradient-to-br from-primary-50 to-purple-50'">
            <div class="max-w-xl mx-auto">
              <div class="text-6xl text-center mb-6">🎵</div>
              <audio :src="item.url"
                     controls
                     class="w-full custom-audio"
                     :class="isDark ? 'dark' : ''"
                     controlsList="nodownload">
                您的浏览器不支持音频播放
              </audio>
            </div>
          </div>
          
          <!-- 其他文件类型 -->
          <div v-else class="p-12 text-center">
            <div class="text-8xl mb-6">📄</div>
            <p class="text-lg mb-6" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
              此文件类型暂不支持预览
            </p>
            <a v-if="item.url"
               :href="item.url"
               target="_blank"
               :download="item.name"
               class="btn-primary">
              下载文件
            </a>
          </div>
        </div>

        <!-- 底部信息栏 -->
        <div class="p-4 border-t" 
             :class="isDark ? 'border-white/10 bg-black/30' : 'border-gray-100 bg-gray-50'">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                类型：{{ formatFileType(item.type) }}
              </p>
              <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                上传时间：{{ formatDate(item.uploadedAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '../stores/theme'

const props = defineProps({
  isOpen: Boolean,
  item: Object
})

const emit = defineEmits(['close'])
const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)
const buttonClass = computed(() => ({
  'bg-white/10 hover:bg-white/20 text-white': isDark.value,
  'bg-black/5 hover:bg-black/10 text-gray-700': !isDark.value
}))

const close = () => {
  emit('close')
}

const formatFileSize = (bytes) => {
  if (!bytes) return '未知大小'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (seconds) => {
  if (!seconds) return ''
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatFileType = (type) => {
  if (!type) return '未知类型'
  const typeMap = {
    'image/': '图片',
    'video/': '视频',
    'audio/': '音频',
    'application/pdf': 'PDF文档',
    'text/': '文本文件'
  }
  
  for (const [key, value] of Object.entries(typeMap)) {
    if (type.startsWith(key)) return value
  }
  return type
}

const copyUrl = async () => {
  if (props.item.url) {
    try {
      await navigator.clipboard.writeText(props.item.url)
      ElMessage.success({
        message: '链接已复制到剪贴板',
        type: 'success',
        duration: 2000
      })
    } catch (err) {
      ElMessage.error({
        message: '复制失败',
        type: 'error',
        duration: 3000
      })
    }
  }
}
</script>

<style scoped>
.btn-icon {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300;
}

.btn-primary {
  @apply inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors;
}

/* 自定义音频播放器样式 */
.custom-audio {
  @apply h-12 rounded-lg;
}

.custom-audio.dark {
  filter: sepia(20%) saturate(70%) grayscale(1) contrast(99%) invert(12%);
}

.custom-audio::-webkit-media-controls-panel {
  @apply bg-gradient-to-b from-gray-100 to-white;
}

.custom-audio.dark::-webkit-media-controls-panel {
  @apply bg-gradient-to-b from-gray-800 to-gray-900;
}

/* 自定义视频播放器控件颜色 */
video::-webkit-media-controls-panel {
  @apply bg-gradient-to-t from-black/50 to-transparent;
}

.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}
</style> 