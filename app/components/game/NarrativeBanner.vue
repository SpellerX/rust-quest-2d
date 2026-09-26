<template>
  <div v-if="visible" class="overlay">
    <div
      ref="dialog"
      class="banner panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="narrative-title"
      tabindex="-1"
    >
      <template v-if="isIntro">
        <div class="eyebrow">🚩 {{ level.title }}</div>
        <h2 id="narrative-title">{{ level.concept.title }}</h2>
        <p class="body">{{ level.concept.body }}</p>
        <ul class="bullets">
          <li v-for="(bullet, index) in level.concept.bullets" :key="index">{{ bullet }}</li>
        </ul>
        <p class="narrative">“{{ level.narrative }}”</p>
        <button class="btn btn-primary" type="button" @click="dismiss">
          Começar <span aria-hidden="true">▶</span>
        </button>
      </template>

      <template v-else-if="phase === 'won'">
        <h2 id="narrative-title">🎉 Nível completo!</h2>
          <div class="stars-earned" role="img" :aria-label="`${stars} de 3 estrelas conquistadas`">
          <span v-for="number in 3" :key="number" :class="{ on: number <= stars }" aria-hidden="true">⭐</span>
        </div>
        <div class="learn">
          <h3>🧠 Você aprendeu: {{ level.learnAfter.title }}</h3>
          <p class="body">{{ level.learnAfter.body }}</p>
          <ul class="bullets">
            <li v-for="(bullet, index) in level.learnAfter.bullets" :key="index">{{ bullet }}</li>
          </ul>
        </div>
        <p v-if="hintsUsed > 0" class="hint-cost">
          Você usou {{ hintsUsed }} dica(s) — tente sem elas na próxima!
        </p>

        <InlineAlert v-if="syncState === 'saving'" class="sync-alert" tone="info">
          Sincronizando sua vitória e seu progresso…
        </InlineAlert>
        <InlineAlert v-else-if="syncState === 'saved'" class="sync-alert" tone="success">
          Progresso salvo.
        </InlineAlert>
        <InlineAlert v-else-if="syncState === 'local'" class="sync-alert" tone="warning">
          Vitória disponível nesta sessão. Entre novamente para salvar o progresso.
        </InlineAlert>
        <InlineAlert v-else-if="syncState === 'error'" class="sync-alert" tone="warning">
          <span>A vitória aparece nesta sessão, mas o progresso pode não ter sido salvo no servidor.</span>
          <button class="btn btn-sm sync-retry" type="button" @click="$emit('retry-sync')">
            Tentar sincronizar novamente
          </button>
        </InlineAlert>

        <div class="banner-actions">
          <button class="btn" type="button" @click="$emit('retry')">↺ Repetir</button>
          <button class="btn" type="button" @click="$emit('map')">Mapa</button>
          <button
            v-if="nextLevelId"
            class="btn btn-primary"
            type="button"
            :disabled="syncState !== 'saved'"
            @click="$emit('next')"
          >
            Próximo nível <span aria-hidden="true">▶</span>
          </button>
        </div>
      </template>

      <template v-else-if="phase === 'lost'">
        <template v-if="isDeath && cause === 'spike'">
          <h2 id="narrative-title">OUCH! Espinho!</h2>
          <p class="body">O boneco encostou no espinho. Tente pular por cima — comece o salto na casa anterior.</p>
        </template>
        <template v-else-if="isDeath">
          <h2 id="narrative-title">😰 Você caiu!</h2>
          <p class="body">O boneco caiu no buraco. A força do pulo precisa cobrir a largura dele — e comece o salto na borda.</p>
        </template>
        <template v-else>
          <h2 id="narrative-title">⏸ Programa terminou</h2>
          <p class="body">Seu código acabou antes de chegar à porta. Ajuste os passos (ou os saltos) e execute de novo.</p>
        </template>
        <div class="banner-actions">
          <button class="btn btn-primary" type="button" @click="$emit('retry')">↺ Tentar de novo</button>
          <button class="btn" type="button" @click="$emit('map')">Mapa</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Level } from '#shared/levels/types'
import type { Outcome } from '#shared/types'
import type { GamePhase, ProgressSyncState } from '../../stores/game'

const props = defineProps<{
  level: Level
  phase: GamePhase
  outcome: Outcome | null
  stars: number
  hintsUsed: number
  nextLevelId: string | null
  syncState: ProgressSyncState
}>()

defineEmits<{
  retry: []
  'retry-sync': []
  next: []
  map: []
}>()

const dismissed = ref(false)
const dialog = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null

const isIntro = computed(() => !dismissed.value && props.phase === 'idle')
const visible = computed(() => isIntro.value || props.phase === 'won' || props.phase === 'lost')
const isDeath = computed(() => props.outcome?.result === 'death')
const cause = computed(() => props.outcome?.cause ?? 'pit')

watch(visible, async (open) => {
  if (!import.meta.client) return
  if (open) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    dialog.value?.focus()
  }
  else {
    previousFocus?.focus()
    previousFocus = null
  }
}, { immediate: true, flush: 'post' })

watch(() => props.phase, async () => {
  if (!visible.value) return
  await nextTick()
  dialog.value?.focus()
})

watch(() => props.level.id, async () => {
  dismissed.value = false
  await nextTick()
  dialog.value?.focus()
})

function dismiss() {
  dismissed.value = true
}

function onDialogKeydown(event: KeyboardEvent) {
  if (!visible.value || !dialog.value) return
  if (event.key === 'Escape' && isIntro.value) {
    event.preventDefault()
    dismiss()
    return
  }
  if (event.key !== 'Tab') return

  const focusable = [...dialog.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
  )].filter(element => element.getClientRects().length > 0)
  if (focusable.length === 0) {
    event.preventDefault()
    dialog.value.focus()
    return
  }

  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onDialogKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onDialogKeydown))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
  background: rgb(5 10 8 / 82%);
}

.banner {
  width: min(100%, 620px);
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
  padding: 1.5rem;
  text-align: center;
  outline: none;
}

.eyebrow {
  color: var(--accent-2);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.3rem;
}

.banner h2 { margin-top: 0; }
.body { color: var(--text-dim); line-height: 1.55; }

.bullets {
  max-width: 440px;
  margin: 0.8rem auto;
  padding: 0.7rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  list-style: none;
  text-align: left;
}

.bullets li {
  padding: 0.2rem 0;
  font-family: var(--font-mono);
  font-size: 0.86rem;
  line-height: 1.5;
}

.bullets li::before { content: '▸ '; color: var(--accent); }
.narrative { margin: 0.9rem 0 1.1rem; color: var(--accent-2); font-style: italic; line-height: 1.5; }
.stars-earned { font-size: 2rem; }
.stars-earned span { filter: grayscale(1); opacity: 0.35; }
.stars-earned span.on { filter: none; opacity: 1; }

.learn {
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--border);
}

.learn h3 { margin: 0 0 0.4rem; color: var(--green); font-size: 1rem; }
.hint-cost { color: var(--gold); font-size: 0.9rem; }
.sync-alert { margin-top: 0.9rem; text-align: left; }
.sync-retry { margin-top: 0.55rem; }

.banner-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1rem;
}

@media (max-width: 520px) {
  .overlay { align-items: flex-start; padding: 0.6rem; }
  .banner { max-height: calc(100dvh - 1.2rem); padding: 1.15rem 0.9rem; }
  .banner-actions { display: grid; grid-template-columns: 1fr; }
  .banner-actions .btn { width: 100%; }
  .bullets { padding: 0.65rem 0.75rem; }
}
</style>