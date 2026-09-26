<template>
  <div
    class="inline-alert"
    :class="`inline-alert--${tone}`"
    :role="tone === 'danger' ? 'alert' : 'status'"
    :aria-live="tone === 'danger' ? 'assertive' : 'polite'"
    aria-atomic="true"
  >
    <span class="inline-alert__icon" aria-hidden="true">{{ icon }}</span>
    <div><slot /></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tone: 'danger' | 'warning' | 'success' | 'info'
}>()

const icon = computed(() => ({
  danger: '!',
  warning: '!',
  success: '✓',
  info: 'i',
}[props.tone]))
</script>