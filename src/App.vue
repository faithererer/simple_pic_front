<script setup>
import { useThemeStore } from './stores/theme'
import { onMounted } from 'vue'

const themeStore = useThemeStore()

const navItems = [
  { name: '首页', path: '/' },
  { name: '上传', path: '/upload' },
  { name: '图库', path: '/gallery' }
]

onMounted(() => {
  themeStore.initTheme()
})
</script>

<template>
  <div class="min-h-screen">
    <!-- 导航栏 -->
    <nav class="bg-white dark:bg-gray-800 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- 左侧 Logo 和导航链接 -->
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-primary-500">
                Simple Picture Hub
              </router-link>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[
                  $route.path === item.path
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
                ]"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>

          <!-- 右侧工具栏 -->
          <div class="flex items-center">
            <button
              @click="themeStore.toggleTheme"
              class="p-2 rounded-lg text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
            >
              <span v-if="themeStore.isDark">🌞</span>
              <span v-else>🌙</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区 -->
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
