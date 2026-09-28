<template>
  <div class="biblioteca">
    <header class="bib-header">
      <p class="eyebrow">Referência da aventura</p>
      <h1><span aria-hidden="true">📖</span> Biblioteca do Aventureiro</h1>
      <p class="subtitle">
        Cada capítulo explica em profundidade o conceito que você praticou num nível —
        com o mesmo rigor do livro oficial do Rust.
      </p>
    </header>

    <section class="intro panel" aria-labelledby="intro-title">
      <div>
        <h2 id="intro-title">Como usar</h2>
        <p>
          Termos técnicos aparecem em inglês, como são usados no dia a dia de quem programa:
          <em>ownership</em>, <em>borrowing</em>, <em>slice</em>. Termos são seguidos de
          explicação quando ajudam, e nunca escondem o sentido.
        </p>
        <p>
          Os livros estão organizados por mundo, do primeiro ao último. Abaixo da prateleira,
          a ordem dos passos que um novato percorre — do básico até os conceitos próprios
          de Rust.
        </p>
      </div>
      <div class="intro-stats" role="group" aria-label="Seu progresso na biblioteca">
        <div class="stat"><span aria-hidden="true">📚</span><strong>{{ totalCapitulos }}</strong><span>capítulos</span></div>
        <div class="stat"><span aria-hidden="true">✓</span><strong>{{ praticados }}</strong><span>praticados</span></div>
      </div>
    </section>

    <section
      v-for="estante in estantes"
      :key="estante.mundo"
      class="prateleira"
      :aria-labelledby="`mundo-${estante.mundo}`"
    >
      <header class="prateleira-header">
        <div>
          <p class="mundo-num">Mundo {{ estante.mundo }}</p>
          <h2 :id="`mundo-${estante.mundo}`">{{ estante.nome }}</h2>
        </div>
        <p class="prateleira-contagem">
          {{ estantePraticados(estante) }} de {{ estante.capitulos.length }} capítulos praticados
        </p>
      </header>

      <div class="corpo-prateleira">
        <div class="livros">
          <LibraryBook
            v-for="capitulo in estante.capitulos"
            :key="capitulo.slug"
            :capitulo="capitulo"
            :praticado="isPraticado(capitulo)"
          />
        </div>
        <div class="regua" aria-hidden="true" />
      </div>
    </section>

    <section class="trilha panel" aria-labelledby="trilha-title">
      <h2 id="trilha-title">A trilha de um novato</h2>
      <p class="trilha-nota">
        Esta é a ordem em que um iniciante aprende. Os passos marcados como
        <strong>em breve</strong> ainda não têm nível no jogo — os capítulos acima cobrem
        o que já dá para praticar hoje.
      </p>
      <ol class="passos">
        <li
          v-for="passo in passos"
          :key="passo.numero"
          :class="{ 'passo--ativo': passo.ativo, 'passo--futuro': !passo.ativo }"
        >
          <span class="passo-num">{{ passo.numero }}</span>
          <span class="passo-nome">{{ passo.nome }}</span>
          <span class="passo-estado">
            {{ passo.ativo ? `${passo.capitulos} cap.` : 'em breve' }}
          </span>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
import { CAPITULOS, NOMES_PASSOS, prateleiras, type Capitulo } from '#shared/biblioteca'

const progress = useProgressStore()
const auth = useAuthStore()

const estantes = prateleiras()
const totalCapitulos = CAPITULOS.length

const praticados = computed(() => CAPITULOS.filter(c => isPraticado(c)).length)

/** A ordem canônica de 13 passos — só os que têm conteúdo no jogo aparecem ativos. */
const ORDEM_PASSOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const

const passos = computed(() =>
  ORDEM_PASSOS.map((numero) => {
    const capitulos = CAPITULOS.filter(c => c.passo === numero)
    return {
      numero,
      nome: NOMES_PASSOS[numero] ?? `Passo ${numero}`,
      ativo: capitulos.length > 0,
      capitulos: capitulos.length,
    }
  }),
)

function isPraticado(capitulo: Capitulo) {
  return capitulo.niveis.some(nivel => progress.isCompleted(nivel))
}

function estantePraticados(estante: { capitulos: Capitulo[] }) {
  return estante.capitulos.filter(c => isPraticado(c)).length
}

onMounted(() => {
  if (auth.isAuthenticated) void progress.fetch().catch(() => {})
})

const SITE_URL = 'https://rust-quest-2d-one.vercel.app'
const DESCRIPTION
  = 'Biblioteca do Rust Quest 2D: capítulos em português sobre let, if, loops, fn, String, ownership e borrowing — com referência ao livro oficial de Rust.'

const bibliotecaJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Biblioteca do Aventureiro — Rust Quest 2D',
  description: DESCRIPTION,
  inLanguage: 'pt-BR',
  url: `${SITE_URL}/biblioteca`,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/biblioteca` },
  image: `${SITE_URL}/og.png`,
  about: { '@type': 'Thing', name: 'Rust', sameAs: 'https://www.rust-lang.org/' },
  isPartOf: { '@type': 'WebSite', name: 'Rust Quest 2D', url: SITE_URL },
  numberOfItems: CAPITULOS.length,
}

const migalhasJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Biblioteca', item: `${SITE_URL}/biblioteca` },
  ],
}

useSeoMeta({
  title: 'Biblioteca do Aventureiro — teoria de cada conceito | Rust Quest 2D',
  description: DESCRIPTION,
  ogTitle: 'Biblioteca do Aventureiro — Rust Quest 2D',
  ogDescription: DESCRIPTION,
  ogUrl: `${SITE_URL}/biblioteca`,
  ogImage: `${SITE_URL}/og.png`,
  ogType: 'website',
  ogLocale: 'pt_BR',
  ogSiteName: 'Rust Quest 2D',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: `${SITE_URL}/biblioteca` }],
  script: [
    { type: 'application/ld+json' as const, innerHTML: JSON.stringify(bibliotecaJsonLd) },
    { type: 'application/ld+json' as const, innerHTML: JSON.stringify(migalhasJsonLd) },
  ],
})
</script>

<style scoped>
.biblioteca {
  max-width: 1120px;
  margin: 0 auto;
}

.bib-header { margin-bottom: 1.25rem; }

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--accent-2);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.bib-header h1 { margin: 0 0 0.35rem; font-size: 1.85rem; }
.subtitle { color: var(--text-dim); margin: 0; }

.intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.15rem 1.3rem;
  margin-bottom: 1.75rem;
}

.intro h2 { margin: 0 0 0.5rem; font-size: 1.05rem; }
.intro p { margin: 0 0 0.6rem; color: var(--text-dim); font-size: 0.9rem; line-height: 1.55; }
.intro p:last-child { margin-bottom: 0; }
.intro em { color: var(--accent-2); font-style: normal; font-family: var(--font-mono); }

.intro-stats { display: flex; gap: 0.6rem; flex: 0 0 auto; }

.stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text-dim);
  font-size: 0.82rem;
  white-space: nowrap;
}

.stat strong { color: var(--text); font-size: 0.95rem; }

.prateleira { margin-bottom: 2.25rem; }

.prateleira-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.7rem;
}

.mundo-num {
  margin: 0 0 0.2rem;
  color: var(--accent-2);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.prateleira-header h2 { margin: 0; font-size: 1.15rem; }

.prateleira-contagem {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Os livros encostam na régua: flex-end + régua logo abaixo, sem margem. */
.corpo-prateleira { position: relative; }

.livros {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.regua {
  height: 11px;
  border-radius: 3px;
  background:
    linear-gradient(180deg, var(--border-bright) 0 3px, var(--bg-elevated) 3px 100%);
  border: 1px solid var(--border);
  border-top: none;
  box-shadow: 0 6px 14px rgb(0 0 0 / 30%);
}

.trilha { padding: 1.15rem 1.3rem; }
.trilha h2 { margin: 0 0 0.4rem; font-size: 1.05rem; }

.trilha-nota {
  margin: 0 0 0.9rem;
  color: var(--text-dim);
  font-size: 0.88rem;
  line-height: 1.55;
}

.passos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 0.5rem;
}

.passos li {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  font-size: 0.82rem;
}

.passo--futuro { opacity: 0.6; border-style: dashed; }

.passo-num {
  display: grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  border: 1px solid var(--border-bright);
  border-radius: 6px;
  background: var(--bg-elevated);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;
}

.passo--ativo .passo-num { border-color: var(--accent); color: var(--accent); }

.passo-nome { flex: 1; color: var(--text); font-weight: 600; }

.passo-estado { color: var(--text-dim); font-size: 0.74rem; white-space: nowrap; }
.passo--ativo .passo-estado { color: var(--green); }

@media (max-width: 720px) {
  .intro { flex-direction: column; gap: 0.9rem; }
  .intro-stats { width: 100%; }
  .stat { flex: 1; }
}

@media (max-width: 640px) {
  .bib-header h1 { font-size: 1.5rem; }
  .prateleira-header { flex-direction: column; align-items: flex-start; gap: 0.2rem; }

  /* Capas deitadas em grade — a lombada vertical não cabe em telas estreitas. */
  .livros {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.55rem;
  }

  .regua { display: none; }
  .passos { grid-template-columns: 1fr; }
}

@media (max-width: 360px) {
  .livros { grid-template-columns: 1fr; }
}
</style>
