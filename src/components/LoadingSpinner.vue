<template>
  <div class="loading-container" :class="{ 
    overlay: isOverlay,
    inline: inline
  }">
    <div class="loading-content" :class="{ 'inline-content': inline }">
      <!-- 主动画 -->
      <div class="spinner" :class="{ 'spinner-sm': inline }">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
      <!-- 加载文本 -->
      <div v-if="text && !inline" class="loading-text">
        {{ text }}
        <span class="dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '加载中'
  },
  isOverlay: {
    type: Boolean,
    default: false
  },
  inline: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.loading-container {
  @apply flex items-center justify-center;
}

.loading-container.overlay {
  @apply fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50;
}

.loading-container.inline {
  @apply inline-flex;
}

.loading-content {
  @apply flex flex-col items-center gap-4;
}

.loading-content.inline-content {
  @apply flex-row gap-2;
}

.loading-text {
  @apply text-sm text-gray-600 dark:text-gray-300 font-medium;
}

.spinner {
  @apply relative w-12 h-12;
}

.spinner-sm {
  @apply w-4 h-4;
}

.double-bounce1, .double-bounce2 {
  @apply absolute inset-0 rounded-full bg-primary-500/50;
  animation: bounce 2s infinite ease-in-out;
}

.double-bounce2 {
  animation-delay: -1.0s;
}

/* 动画点 */
.dots {
  display: inline-flex;
}

.dots span {
  opacity: 0;
  animation: dots 1.4s infinite;
  animation-fill-mode: both;
}

.dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
}

@keyframes dots {
  0%, 80%, 100% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
}
</style> 