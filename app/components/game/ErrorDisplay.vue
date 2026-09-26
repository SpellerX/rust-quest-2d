<template>
  <InlineAlert v-if="error" class="error-card" tone="danger">
    <div class="error-head">
      <span class="error-code">{{ error.code }}</span>
      <span class="error-loc">linha {{ error.line }}, coluna {{ error.col }}</span>
    </div>
    <p class="error-friendly">{{ error.friendly }}</p>
    <div v-if="error.hint && !hintVisible" class="error-actions">
      <button class="btn btn-gold" type="button" @click="$emit('use-hint')">
        💡 Ver dica (custa 1 estrela)
      </button>
    </div>
    <p v-if="hintVisible" class="error-hint" aria-live="polite">💡 {{ error.hint }}</p>
  </InlineAlert>
</template>

<script setup lang="ts">
import type { GameError } from '#shared/types'

defineProps<{
  error: GameError | null
  hintVisible?: boolean
}>()

defineEmits<{ 'use-hint': [] }>()
</script>

<style scoped>
.error-card {
  border-left-color: var(--red);
}

.error-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.error-code {
  color: var(--red);
  font-weight: 700;
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.error-loc {
  color: var(--text-dim);
  font-size: 0.8rem;
}

.error-friendly {
  margin: 0;
  line-height: 1.45;
}

.error-hint {
  margin: 0.5rem 0 0;
  color: var(--gold);
  font-size: 0.9rem;
  line-height: 1.4;
}

.error-actions {
  margin-top: 0.6rem;
}
</style>
