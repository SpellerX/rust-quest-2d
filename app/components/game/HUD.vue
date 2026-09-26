<template>
  <div class="hud">
    <div class="level-name">
      <span class="world-tag">Mundo {{ level.world }}</span>
      {{ level.title }}
    </div>
    <div class="spacer" />
    <div class="stat" role="group" :aria-label="`${stars} de 3 estrelas nesta tentativa`" title="Estrelas nesta tentativa">
      <span aria-hidden="true">⭐</span> {{ stars }}/3
    </div>
    <div class="stat" role="group" :aria-label="`${xp} pontos de experiência no total`" title="XP total">
      <span aria-hidden="true">⚡</span> {{ xp }} XP
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Level } from '#shared/levels/types'

defineProps<{
  level: Level
  stars: number
  xp: number
}>()
</script>

<style scoped>
.hud {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.level-name {
  font-weight: 600;
}

.world-tag {
  background: var(--accent);
  color: #fff;
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  margin-right: 0.4rem;
  vertical-align: middle;
}

.spacer {
  flex: 1;
}

.stat {
  color: var(--text-dim);
  font-size: 0.9rem;
  white-space: nowrap;
}

@media (max-width: 520px) {
  .hud { gap: 0.45rem 0.7rem; }
  .level-name { flex: 1 1 100%; }
  .spacer { display: none; }
  .world-tag { font-size: 0.68rem; }
}
</style>
