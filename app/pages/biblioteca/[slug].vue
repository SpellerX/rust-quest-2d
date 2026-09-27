<template>
  <div v-if="capitulo" class="pagina">
    <nav class="voltar" aria-label="Navegação da biblioteca">
      <NuxtLink to="/biblioteca" class="btn btn-sm">◀ Voltar à prateleira</NuxtLink>
    </nav>

    <article class="livro-aberto" :data-passo="capitulo.passo">
      <header class="capa">
        <p class="capa-meta">
          <span>Mundo {{ capitulo.mundo }} · {{ nomeMundo }}</span>
          <span class="sep" aria-hidden="true">·</span>
          <span>Passo {{ capitulo.passo }} · {{ nomePasso }}</span>
        </p>
        <h1>{{ capitulo.titulo }}</h1>
        <p class="resumo">{{ capitulo.resumo }}</p>
      </header>

      <section class="feito" aria-labelledby="feito-title">
        <h2 id="feito-title">O que você fez</h2>
        <p>{{ capitulo.oQueVoceFez }}</p>
      </section>

      <section v-for="(secao, i) in capitulo.secoes" :key="secao.titulo" class="secao">
        <h2>{{ secao.titulo }}</h2>
        <p v-for="(paragrafo, j) in secao.paragrafos" :key="j">{{ paragrafo }}</p>

        <figure v-for="codigo in secao.codigos" :key="codigo.titulo" class="codigo-bloco">
          <figcaption>{{ codigo.titulo }}</figcaption>
          <pre><code>{{ codigo.snippet }}</code></pre>
        </figure>
      </section>

      <section v-if="capitulo.pegadinhas?.length" class="pegadinhas" aria-labelledby="pegadinhas-title">
        <h2 id="pegadinhas-title">Pegadinhas</h2>
        <ul>
          <li v-for="(item, i) in capitulo.pegadinhas" :key="i">{{ item }}</li>
        </ul>
      </section>

      <footer class="rodape">
        <section class="pratique" aria-labelledby="pratique-title">
          <h2 id="pratique-title">Pratique neste nível</h2>
          <ul>
            <li v-for="nivel in niveis" :key="nivel.id">
              <NuxtLink :to="`/nivel/${nivel.id}`">
                <span aria-hidden="true">🎮</span> {{ nivel.title }}
                <span class="nivel-id">({{ nivel.id }})</span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <section class="fonte" aria-labelledby="fonte-title">
          <h2 id="fonte-title">No livro oficial</h2>
          <p>
            Este capítulo foi escrito a partir de
            <strong>The Rust Programming Language</strong> — {{ capitulo.livro.capitulo }}.
          </p>
          <a class="btn btn-gold" :href="capitulo.livro.url" rel="noopener noreferrer" target="_blank">
            Abrir no livro <span aria-hidden="true">↗</span>
          </a>
        </section>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { getCapitulo, NOMES_MUNDOS, NOMES_PASSOS } from '#shared/biblioteca'
import { LEVELS } from '#shared/levels'

const route = useRoute()

const capitulo = getCapitulo(String(route.params.slug ?? ''))

if (!capitulo) {
  await navigateTo('/biblioteca', { redirectCode: 301, replace: true })
}

const nomeMundo = capitulo ? NOMES_MUNDOS[capitulo.mundo] ?? '' : ''
const nomePasso = capitulo ? NOMES_PASSOS[capitulo.passo] ?? '' : ''
const niveis = capitulo ? LEVELS.filter(l => capitulo.niveis.includes(l.id)) : []

const SITE_URL = 'https://rust-quest-2d-one.vercel.app'

useSeoMeta({
  title: capitulo
    ? `${capitulo.titulo} — Biblioteca do Aventureiro | Rust Quest 2D`
    : 'Biblioteca do Aventureiro — Rust Quest 2D',
  description: capitulo
    ? `${capitulo.resumo} ${capitulo.oQueVoceFez}`
    : 'Capítulos teóricos do Rust Quest 2D.',
  ogTitle: capitulo ? `${capitulo.titulo} — Biblioteca do Aventureiro` : undefined,
  ogDescription: capitulo ? capitulo.resumo : undefined,
  ogUrl: capitulo ? `${SITE_URL}/biblioteca/${capitulo.slug}` : undefined,
  ogImage: `${SITE_URL}/og.png`,
  ogType: 'article',
  ogLocale: 'pt_BR',
  ogSiteName: 'Rust Quest 2D',
  twitterCard: 'summary_large_image',
})

useHead({
  link: capitulo
    ? [{ rel: 'canonical', href: `${SITE_URL}/biblioteca/${capitulo.slug}` }]
    : [],
})
</script>

<style scoped>
.pagina {
  max-width: 760px;
  margin: 0 auto;
}

.voltar { margin-bottom: 1rem; }

/* Livro aberto: lombada colorida à esquerda, amarrando com a prateleira. */
.livro-aberto {
  --cor-passo: var(--accent-2);

  position: relative;
  padding: 1.6rem 1.7rem 1.8rem 1.9rem;
  border: 1px solid var(--border);
  border-left: 7px solid var(--cor-passo);
  border-radius: var(--radius);
  background: var(--bg-panel);
  box-shadow: var(--shadow-panel);
}

.livro-aberto[data-passo='1'] { --cor-passo: var(--accent-2); }
.livro-aberto[data-passo='2'] { --cor-passo: var(--blue); }
.livro-aberto[data-passo='3'] { --cor-passo: var(--green); }
.livro-aberto[data-passo='4'] { --cor-passo: var(--accent); }
.livro-aberto[data-passo='5'] { --cor-passo: var(--gold); }
.livro-aberto[data-passo='6'] { --cor-passo: var(--accent-2); }
.livro-aberto[data-passo='9'] { --cor-passo: var(--blue); }
.livro-aberto[data-passo='10'] { --cor-passo: var(--gold); }

.capa {
  padding-bottom: 1rem;
  margin-bottom: 1.2rem;
  border-bottom: 1px solid var(--border);
}

.capa-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0 0 0.5rem;
  color: var(--accent-2);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sep { color: var(--border-bright); }

.capa h1 { margin: 0 0 0.45rem; font-size: 1.7rem; }

.resumo { margin: 0; color: var(--text-dim); font-size: 1rem; line-height: 1.55; }

.secao,
.feito,
.pegadinhas { margin-bottom: 1.5rem; }

.secao h2,
.feito h2,
.pegadinhas h2,
.rodape h2 {
  margin: 0 0 0.55rem;
  font-size: 1.05rem;
  color: var(--green);
}

.feito h2 { color: var(--accent-2); }
.rodape h2 { color: var(--gold); }

.secao p,
.feito p {
  margin: 0 0 0.85rem;
  color: var(--text);
  font-size: 0.97rem;
  line-height: 1.68;
}

.feito p {
  padding: 0.8rem 0.95rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text-dim);
}

.codigo-bloco { margin: 0 0 1rem; }

.codigo-bloco figcaption {
  margin-bottom: 0.35rem;
  color: var(--text-dim);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.codigo-bloco pre {
  margin: 0;
  padding: 0.85rem 1rem;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-elevated);
}

.codigo-bloco code {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text);
  white-space: pre;
}

.pegadinhas ul { list-style: none; margin: 0; padding: 0; }

.pegadinhas li {
  position: relative;
  padding: 0.35rem 0 0.35rem 1.5rem;
  color: var(--text-dim);
  font-size: 0.92rem;
  line-height: 1.55;
  border-bottom: 1px solid var(--border);
}

.pegadinhas li:last-child { border-bottom: none; }

.pegadinhas li::before {
  content: '⚠';
  position: absolute;
  left: 0.15rem;
  color: var(--gold);
}

.rodape {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.4rem;
  padding-top: 1.3rem;
  border-top: 1px solid var(--border);
}

.pratique ul { list-style: none; margin: 0; padding: 0; }

.pratique li { margin-bottom: 0.45rem; }

.pratique a {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  color: var(--blue);
  font-size: 0.92rem;
  font-weight: 600;
}

.nivel-id { color: var(--text-dim); font-family: var(--font-mono); font-size: 0.8rem; }

.fonte p {
  margin: 0 0 0.75rem;
  color: var(--text-dim);
  font-size: 0.88rem;
  line-height: 1.55;
}

.fonte strong { color: var(--text); }

.fonte .btn { width: 100%; }

@media (max-width: 640px) {
  .livro-aberto { padding: 1.15rem 1rem 1.3rem 1.15rem; }
  .capa h1 { font-size: 1.4rem; }
  .rodape { grid-template-columns: 1fr; }
  .codigo-bloco pre { padding: 0.7rem 0.75rem; }
  .codigo-bloco code { font-size: 0.8rem; }
}
</style>
