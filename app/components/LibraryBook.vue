<template>
  <NuxtLink
    class="livro"
    :to="`/biblioteca/${capitulo.slug}`"
    :data-passo="capitulo.passo"
    :aria-label="ariaLabel"
  >
    <span class="faixa faixa-topo" aria-hidden="true" />
    <span v-if="praticado" class="selo" aria-hidden="true">✓</span>
    <span class="titulo">{{ capitulo.titulo }}</span>
    <span class="estado-mobile">{{ praticado ? '✓ Praticado' : 'Disponível' }}</span>
    <span class="faixa faixa-base" aria-hidden="true" />
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Capitulo } from '#shared/biblioteca/types'

const props = defineProps<{
  capitulo: Capitulo
  praticado: boolean
}>()

const ariaLabel = computed(() =>
  [
    props.capitulo.titulo,
    `Mundo ${props.capitulo.mundo}`,
    `passo ${props.capitulo.passo}`,
    props.praticado ? 'praticado' : 'disponível',
  ].join(', '),
)
</script>

<style scoped>
/* Livrinho de pé na prateleira: lombada escura + faixas na cor do passo.
   Texto sempre sobre fundo escuro (var(--bg-elevated)) para manter contraste. */
.livro {
  --cor-passo: var(--accent-2);

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  width: 3.1rem;
  min-height: 9.5rem;
  padding: var(--space-2) 0.2rem;
  border: 1px solid rgb(0 0 0 / 38%);
  border-radius: 4px 7px 7px 4px;
  background: linear-gradient(90deg, var(--bg-elevated) 0%, var(--bg-panel) 62%, var(--bg-elevated) 100%);
  box-shadow:
    inset 2px 0 0 rgb(255 255 255 / 7%),
    inset -3px 0 0 rgb(0 0 0 / 26%),
    3px 5px 12px rgb(0 0 0 / 32%);
  color: var(--text);
  text-decoration: none;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.livro[data-passo='1'] { --cor-passo: var(--accent-2); }
.livro[data-passo='2'] { --cor-passo: var(--blue); }
.livro[data-passo='3'] { --cor-passo: var(--green); }
.livro[data-passo='4'] { --cor-passo: var(--accent); }
.livro[data-passo='5'] { --cor-passo: var(--gold); }
.livro[data-passo='6'] { --cor-passo: var(--accent-2); }
.livro[data-passo='9'] { --cor-passo: var(--blue); }
.livro[data-passo='10'] { --cor-passo: var(--gold); }

.livro:hover {
  text-decoration: none;
  transform: translateY(-7px);
  border-color: var(--gold);
  box-shadow:
    inset 2px 0 0 rgb(255 255 255 / 7%),
    inset -3px 0 0 rgb(0 0 0 / 26%),
    0 10px 20px rgb(0 0 0 / 40%);
}

.livro:active {
  transform: translateY(-2px);
}

.faixa {
  display: block;
  width: calc(100% - 0.5rem);
  height: 5px;
  border-radius: 2px;
  background: var(--cor-passo);
}

.faixa-base {
  height: 9px;
  background:
    linear-gradient(180deg, var(--cor-passo) 0 3px, rgb(0 0 0 / 30%) 3px 100%);
}

.titulo {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  flex: 1;
  align-self: center;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.01em;
  color: var(--text);
  overflow: hidden;
  max-height: 100%;
}

.selo {
  color: var(--green);
  font-size: 0.8rem;
  font-weight: 800;
  line-height: 1;
}

.estado-mobile {
  display: none;
  color: var(--text-dim);
  font-size: 0.75rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  /* Capa deitada — lombada vertical fica ilegível em telas estreitas. */
  .livro {
    width: 100%;
    min-height: 0;
    flex-direction: row;
    justify-content: flex-start;
    gap: var(--space-3);
    padding: var(--space-3);
    border-radius: var(--radius);
    border-left: 5px solid var(--cor-passo);
    background: var(--bg-panel);
  }

  .livro:hover { transform: translateY(-2px); }

  .faixa-topo,
  .faixa-base { display: none; }

  .titulo {
    writing-mode: horizontal-tb;
    flex: 1;
    max-height: none;
    font-size: 0.92rem;
  }

  .selo { display: none; }

  .estado-mobile { display: block; }
}

@media (prefers-reduced-motion: reduce) {
  .livro { transition: none; }
  .livro:hover { transform: none; }
}
</style>
