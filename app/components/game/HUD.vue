<template>
  <div class="hud">
    <NuxtLink to="/mapa" class="btn back">← Mapa</NuxtLink>
    <div class="level-name">
      <span class="world-tag">Mundo {{ level.world }}</span>
      {{ level.title }}
    </div>
    <div class="spacer" />
    <div class="stat" title="Estrelas nesta tentativa">⭐ {{ stars }}/3</div>
    <div class="stat" title="XP total">⚡ {{ xp }} XP</div>
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
  align-items: center;
  gap: 1rem;
}

.back {
  padding: 0.35rem 0.8rem;
  font-size: 0.85rem;
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
}
</style>
