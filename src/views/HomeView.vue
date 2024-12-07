<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1 class="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent animate-fade-in">
          Simple Picture Hub
        </h1>
        <p class="mt-4 text-xl text-gray-600 dark:text-gray-300 animate-slide-up">
          简单、快速、优雅的文件分享平台
        </p>
        <div class="mt-8 flex justify-center gap-4">
          <router-link to="/upload" class="btn btn-primary">
            开始上传
          </router-link>
          <router-link to="/gallery" class="btn btn-secondary">
            浏览图库
          </router-link>
        </div>
      </div>

      <!-- 特性展示 -->
      <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="feature in features" :key="feature.title" 
             class="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
          <div class="text-primary-500 text-2xl mb-4">{{ feature.icon }}</div>
          <h3 class="text-xl font-semibold mb-2">{{ feature.title }}</h3>
          <p class="text-gray-600 dark:text-gray-300">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const features = [
  {
    icon: '📤',
    title: '多格式支持',
    description: '支持图片、视频、音频等多种文件格式的上传和预览'
  },
  {
    icon: '📋',
    title: '便捷上传',
    description: '支持拖拽上传和剪贴板直接粘贴，让分享更轻松'
  },
  {
    icon: '🎨',
    title: '优雅体验',
    description: '现代化的界面设计，支持亮暗主题切换，随心掌控'
  }
]
</script>

<style scoped>
.text-transparent {
  -webkit-text-fill-color: transparent;
}

h1 {
  padding: 0.1em 0;  /* 添加一点垂直内边距 */
  line-height: 1.2;  /* 调整行高 */
  background-clip: text;
  -webkit-background-clip: text;
}
</style> 