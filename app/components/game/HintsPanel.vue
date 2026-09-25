<template>
  <aside class="hints panel">
    <h3 class="hints-title">💡 Dicas do nível</h3>

    <!-- Dica 1 -->
    <div class="hint-block">
      <button
        class="btn hint-btn"
        :disabled="revealedHints >= 1"
        @click="$emit('reveal', 0)"
      >
        <template v-if="revealedHints >= 1">✓ Dica 1 revelada</template>
        <template v-else>1ª dica (custa 1 estrela)</template>
      </button>
      <p v-if="revealedHints >= 1" class="hint-text">{{ level.hints[0] }}</p>
    </div>

    <!-- Dica 2 (só após a 1) -->
    <div class="hint-block">
      <button
        class="btn hint-btn"
        :disabled="revealedHints < 1 || revealedHints >= 2"
        @click="$emit('reveal', 1)"
      >
        <template v-if="revealedHints >= 2">✓ Dica 2 revelada</template>
        <template v-else-if="revealedHints >= 1">2ª dica (custa 1 estrela)</template>
        <template v-else>2ª dica (trave a 1ª primeiro)</template>
      </button>
      <p v-if="revealedHints >= 2" class="hint-text">{{ level.hints[1] }}</p>
    </div>

    <!-- Exemplo (só após as 2 dicas) -->
    <div class="hint-block">
      <button
        class="btn btn-gold hint-btn"
        :disabled="revealedHints < 2 || exampleShown"
        @click="$emit('show-example')"
      >
        <template v-if="exampleShown">✓ Exemplo revelado</template>
        <template v-else-if="revealedHints >= 2">🔍 Mostrar exemplo (custa 1 estrela)</template>
        <template v-else>🔍 Exemplo (trave as 2 dicas primeiro)</template>
      </button>
      <template v-if="exampleShown">
        <div class="example-label">Exemplo de solução:</div>
        <pre class="code example-code">{{ level.solution }}</pre>
      </template>
    </div>

    <details class="reference">
      <summary>📖 Referência (sintaxe)</summary>
      <section v-for="section in level.cheatSheet" :key="section.title" class="cheat-section">
        <h4>{{ section.title }}</h4>
        <ul>
          <li v-for="(line, i) in section.lines" :key="i" class="code">{{ line }}</li>
        </ul>
      </section>
    </details>
  </aside>
</template>

<script setup lang="ts">
import type { Level } from '#shared/levels/types'

defineProps<{
  level: Level
  revealedHints: number
  exampleShown: boolean
}>()

defineEmits<{
  reveal: [index: number]
  'show-example': []
}>()
</script>

<style scoped>
.hints {
  padding: 0.9rem 1rem;
  overflow-y: auto;
  max-height: 100%;
}

.hints-title {
  margin: 0 0 0.7rem;
  font-size: 1rem;
}

.hint-block {
  margin-bottom: 0.8rem;
}

.hint-btn {
  width: 100%;
  text-align: left;
  font-size: 0.88rem;
}

.hint-btn:disabled {
  opacity: 0.55;
}

.hint-text {
  margin: 0.45rem 0 0;
  padding: 0.55rem 0.7rem;
  background: var(--bg);
  border-left: 3px solid var(--gold);
  border-radius: 0 8px 8px 0;
  font-size: 0.88rem;
  line-height: 1.5;
}

.example-label {
  color: var(--gold);
  font-size: 0.85rem;
  margin: 0.5rem 0 0.35rem;
}

.example-code {
  margin: 0;
  padding: 0.6rem;
  background: #0e1017;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.82rem;
  overflow-x: auto;
}

.reference {
  margin-top: 1rem;
  border-top: 1px solid var(--border);
  padding-top: 0.7rem;
}

.reference summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.92rem;
}

.cheat-section {
  margin-top: 0.7rem;
}

.cheat-section h4 {
  margin: 0 0 0.35rem;
  color: var(--accent-2);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cheat-section ul {
  margin: 0;
  padding-left: 0.2rem;
  list-style: none;
}

.cheat-section li {
  font-size: 0.8rem;
  line-height: 1.5;
  white-space: pre-wrap;
}
</style>
