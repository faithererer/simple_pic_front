<template>
  <div class="min-h-screen py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-6">文件上传</h2>
        
        <!-- 拖拽上传区域 -->
        <div
          class="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300"
          :class="[
            isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-gray-600',
            uploadStore.isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-400'
          ]"
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @dragover.prevent
          @drop.prevent="handleDrop"
          @paste.prevent="handlePaste"
          @click="triggerFileInput"
        >
          <div class="space-y-4">
            <div class="text-6xl animate-bounce">
              {{ isDragging ? '📥' : '📁' }}
            </div>
            <p class="text-lg">
              {{ isDragging ? '松开以上传文件' : '拖拽文件到这里，或点击上传' }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              支持图片、视频、音频等格式
            </p>
          </div>
          <input
            ref="fileInput"
            type="file"
            multiple
            class="hidden"
            @change="handleFileSelect"
            :disabled="uploadStore.isUploading"
          >
        </div>

        <!-- 上传列表 -->
        <div v-if="uploadStore.files.length" class="mt-8 space-y-4">
          <div v-for="(file, index) in uploadStore.files" :key="index"
               class="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div class="p-4 flex items-center gap-4">
              <!-- 文件类型图标 -->
              <div class="text-2xl">
                {{ getFileIcon(file.type) }}
              </div>
              
              <!-- 文件信息 -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ file.name }}</p>
                <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ formatFileSize(file.size) }}</span>
                  <span v-if="file.uploadProgress !== undefined">•</span>
                  <span v-if="file.uploadProgress !== undefined" 
                        :class="{
                          'text-primary-500': file.status === 'success',
                          'text-red-500': file.status === 'error'
                        }">
                    {{ getStatusText(file) }}
                  </span>
                  <span v-if="file.error" class="text-red-500">
                    {{ file.error }}
                  </span>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="flex items-center gap-2">
                <button v-if="file.url" 
                        @click="copyLink(file)" 
                        class="p-2 text-primary-500 hover:text-primary-600 transition-colors">
                  <span class="text-lg">🔗</span>
                </button>
                <button v-if="file.url"
                        @click="openPreview(file)" 
                        class="p-2 text-blue-500 hover:text-blue-600 transition-colors">
                  <span class="text-lg">👁️</span>
                </button>
                <button @click="uploadStore.removeFile(index)" 
                        class="p-2 text-red-500 hover:text-red-600 transition-colors">
                  <span class="text-lg">🗑️</span>
                </button>
              </div>
            </div>
            
            <!-- 进度条 -->
            <div v-if="file.uploadProgress !== undefined" 
                 class="h-1 bg-gray-200 dark:bg-gray-600">
              <div class="h-full transition-all duration-300"
                   :class="{
                     'bg-primary-500': file.status !== 'error',
                     'bg-red-500': file.status === 'error',
                     'animate-pulse': file.status === 'uploading'
                   }"
                   :style="{width: `${file.uploadProgress}%`}">
              </div>
            </div>
          </div>
        </div>

        <!-- 文件预览模态框 -->
        <MediaPreview
          v-if="currentFile"
          :is-open="isPreviewVisible"
          :item="currentFile"
          @close="closePreview"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUploadStore } from '../stores/upload'
import { ElMessage } from 'element-plus'
import MediaPreview from '../components/MediaPreview.vue'

const uploadStore = useUploadStore()
const isDragging = ref(false)
const fileInput = ref(null)
const isPreviewVisible = ref(false)
const currentFile = ref(null)

// 获取文件类型图标
const getFileIcon = (type) => {
  if (type?.startsWith('image/')) return '🖼️'
  if (type?.startsWith('video/')) return '🎥'
  if (type?.startsWith('audio/')) return '🎵'
  return '📄'
}

// 处理文件选择
const handleFileSelect = async (event) => {
  if (event.target.files && event.target.files.length > 0) {
    await uploadStore.addFiles(event.target.files)
    event.target.value = ''
  }
}

const handleDrop = async (event) => {
  isDragging.value = false
  const newFiles = Array.from(event.dataTransfer.files)
  await uploadStore.addFiles(newFiles)
}

const handlePaste = async (event) => {
  const items = Array.from(event.clipboardData.items)
  const newFiles = []
  
  items.forEach(item => {
    if (item.kind === 'file') {
      const file = item.getAsFile()
      newFiles.push(file)
    }
  })
  
  if (newFiles.length > 0) {
    await uploadStore.addFiles(newFiles)
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const copyLink = async (file) => {
  try {
    // 使用文件的url属性，这个url应该是从后端返回的完整访问链接
    if (file.url) {
      await navigator.clipboard.writeText(file.url)
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

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 打开预览
const openPreview = (file) => {
  currentFile.value = file
  isPreviewVisible.value = true
}

// 关闭预览
const closePreview = () => {
  isPreviewVisible.value = false
  currentFile.value = null
}

// 获取状态文本
const getStatusText = (file) => {
  switch (file.status) {
    case 'success':
      return '上传完成'
    case 'error':
      return '上传失败'
    default:
      return `${Math.min(Math.round(file.uploadProgress), 99)}%`
  }
}
</script>

<style scoped>
.upload-enter-active,
.upload-leave-active {
  transition: all 0.3s ease;
}

.upload-enter-from,
.upload-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes progress-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style> 