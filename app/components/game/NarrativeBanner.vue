<template>
  <div v-if="visible" class="overlay" @click.self="isIntro && dismiss()">
    <div class="banner panel">
      <!-- O que você vai aprender (ANTES de começar) -->
      <template v-if="isIntro">
        <div class="eyebrow">🚩 {{ level.title }}</div>
        <h2>{{ level.concept.title }}</h2>
        <p class="body">{{ level.concept.body }}</p>
        <ul class="bullets">
          <li v-for="(b, i) in level.concept.bullets" :key="i">{{ b }}</li>
        </ul>
        <p class="narrative">“{{ level.narrative }}”</p>
        <button class="btn btn-primary" @click="dismiss">
          Começar ▶
        </button>
      </template>

      <!-- Vitória + resumo do que aprendeu -->
      <template v-else-if="phase === 'won'">
        <h2>🎉 Nível completo!</h2>
        <div class="stars-earned">
          <span v-for="n in 3" :key="n" :class="{ on: n <= stars }">⭐</span>
        </div>
        <div class="learn">
          <h3>🧠 Você aprendeu: {{ level.learnAfter.title }}</h3>
          <p class="body">{{ level.learnAfter.body }}</p>
          <ul class="bullets">
            <li v-for="(b, i) in level.learnAfter.bullets" :key="i">{{ b }}</li>
          </ul>
        </div>
        <p v-if="hintsUsed > 0" class="hint-cost">
          Você usou {{ hintsUsed }} dica(s) — tente sem elas na próxima!
        </p>
        <div class="banner-actions">
          <button class="btn" @click="$emit('retry')">↺ Repetir</button>
          <button class="btn" @click="$emit('map')">Mapa</button>
          <button
            v-if="nextLevelId"
            class="btn btn-primary"
            @click="$emit('next')"
          >
            Próximo nível ▶
          </button>
        </div>
      </template>

      <!-- Derrota -->
      <template v-else-if="phase === 'lost'">
        <template v-if="isDeath && cause === 'spike'">
          <h2>OUCH! Espinho!</h2>
          <p class="body">O boneco encostou no espinho. Tente pular por cima — comece o salto na casa anterior.</p>
        </template>
        <template v-else-if="isDeath">
          <h2>😰 Você caiu!</h2>
          <p class="body">O boneco caiu no buraco. A força do pulo precisa cobrir a largura dele — e comece o salto na borda.</p>
        </template>
        <template v-else>
          <h2>⏸ Programa terminou</h2>
          <p class="body">Seu código acabou antes de chegar à porta. Ajuste os passos (ou os saltos) e execute de novo.</p>
        </template>
        <div class="banner-actions">
          <button class="btn btn-primary" @click="$emit('retry')">↺ Tentar de novo</button>
          <button class="btn" @click="$emit('map')">Mapa</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Level } from '#shared/levels/types'
import type { Outcome } from '#shared/types'
import type { GamePhase } from '../../stores/game'

const props = defineProps<{
  level: Level
  phase: GamePhase
  outcome: Outcome | null
  stars: number
  hintsUsed: number
  nextLevelId: string | null
}>()

defineEmits<{
  retry: []
  next: []
  map: []
}>()

const dismissed = ref(false)
const isIntro = computed(() => !dismissed.value && props.phase === 'idle')
const visible = computed(() => isIntro.value || props.phase === 'won' || props.phase === 'lost')
const isDeath = computed(() => props.outcome?.result === 'death')
const cause = computed(() => props.outcome?.cause ?? 'pit')

// Ao trocar de nível, o banner de introdução volta.
watch(() => props.level.id, () => {
  dismissed.value = false
})

function dismiss() {
  dismissed.value = true
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 10, 16, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.banner {
  max-width: 540px;
  padding: 1.6rem 2rem;
  text-align: center;
}

.eyebrow {
  color: var(--accent-2);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.3rem;
}

.banner h2 {
  margin-top: 0;
}

.body {
  color: var(--text-dim);
  line-height: 1.55;
}

.bullets {
  text-align: left;
  margin: 0.8rem auto;
  padding: 0.7rem 1rem;
  max-width: 440px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  list-style: none;
}

.bullets li {
  padding: 0.2rem 0;
  font-family: var(--font-mono);
  font-size: 0.86rem;
}

.bullets li::before {
  content: '▸ ';
  color: var(--accent);
}

.narrative {
  color: var(--accent-2);
  font-style: italic;
  margin: 0.9rem 0 1.1rem;
}

.stars-earned {
  font-size: 2rem;
  letter-spacing: 0.3em;
}

.stars-earned span {
  filter: grayscale(1);
  opacity: 0.35;
}

.stars-earned span.on {
  filter: none;
  opacity: 1;
}

.learn {
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--border);
}

.learn h3 {
  margin: 0 0 0.4rem;
  font-size: 1rem;
  color: var(--green);
}

.hint-cost {
  color: var(--gold);
  font-size: 0.9rem;
}

.banner-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}
</style>
