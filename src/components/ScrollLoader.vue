<template>
  <div class="scroll-loader" :class="{ 'scroll-loader-sm': small }">
    <div class="loader-dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    <div v-if="text" class="loader-text">{{ text }}</div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  small: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.scroll-loader {
  @apply flex flex-col items-center justify-center py-8;
}

.scroll-loader-sm {
  @apply py-4;
}

.loader-dots {
  @apply flex items-center gap-2;
}

.dot {
  @apply w-3 h-3 rounded-full bg-primary-500;
  animation: bounce 0.5s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.1s;
}

.dot:nth-child(3) {
  animation-delay: 0.2s;
}

.loader-text {
  @apply mt-4 text-sm text-gray-500 dark:text-gray-400;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style> 