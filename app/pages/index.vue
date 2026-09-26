<template>
  <div class="home">
    <section class="hero">
      <div class="hero-copy">
        <span class="badge pixel">🦀 RPG pixel de código · grátis</span>
        <h1>Aprenda <em>Rust</em> jogando</h1>
        <p class="lead">
          Você escreve código Rust de verdade num console — e o boneco executa.
          Do primeiro <code>let</code> até ownership, em 30 níveis com dicas,
          erros em português e estrelas pra conquistar.
        </p>

        <div class="cta-row">
          <NuxtLink class="btn btn-primary btn-lg" :to="ctaTarget">
            {{ ctaLabel }}
          </NuxtLink>
          <NuxtLink v-if="!loggedIn" class="btn btn-lg" to="/login">
            Já tenho conta
          </NuxtLink>
        </div>

        <p v-if="!loggedIn" class="free-link-row">
          <NuxtLink class="free-link" to="/nivel/w1-l1">
            ▶ Jogar o 1º nível sem cadastro →
          </NuxtLink>
        </p>

        <p class="fineprint">
          Sem instalar nada · roda no navegador · progresso salvo
          <template v-if="studentCount !== null">
            · <strong class="students-count">{{ studentCount.toLocaleString('pt-BR') }}</strong> alunos já criaram conta
          </template>
        </p>
      </div>

      <div class="hero-code panel" aria-hidden="true">
        <div class="code-head">
          <span class="dot" /><span class="dot" /><span class="dot" />
          <span class="code-title">nivel_14.rs</span>
        </div>
        <pre class="code-body"><code><span class="c">// Três vãos, um só laço:</span>
<span class="k">fn</span> <span class="f">atravessar</span>(n: <span class="t">i32</span>) {
    <span class="k">for</span> i <span class="k">in</span> <span class="n">0</span>..n {
        <span class="f">pular</span>(<span class="n">2</span>);
        <span class="f">mover_direita</span>(<span class="n">4</span>);
    }
}

<span class="f">atravessar</span>(<span class="n">3</span>);</code></pre>
        <div class="code-foot">▶ Executar <span class="ok">→ boneco cruzou os 3 vãos ✓</span></div>
      </div>
    </section>

    <section class="strip" aria-label="Destaques da aventura">
      <div class="strip-item">
        <strong>30 níveis · 6 mundos</strong>
        <span>Vila das Variáveis até as Ruínas da Posse</span>
      </div>
      <div class="strip-item">
        <strong>Código de verdade</strong>
        <span>if, laços, fn e ownership — o Rust do livro oficial</span>
      </div>
      <div class="strip-item">
        <strong>Erros que ensinam</strong>
        <span>E0382 e companhia em português, com dica na hora</span>
      </div>
    </section>

    <section class="faq" aria-labelledby="faq-title">
      <h2 id="faq-title">Perguntas frequentes sobre aprender Rust</h2>
      <details v-for="item in faq" :key="item.q" class="faq-item">
        <summary>{{ item.q }}</summary>
        <p>{{ item.a }}</p>
      </details>
    </section>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()

const loggedIn = ref(false)
const studentCount = ref<number | null>(null)

onMounted(async () => {
  auth.hydrate()
  loggedIn.value = auth.isAuthenticated
  try {
    const res = await $fetch<{ users: number | null }>('/api/stats/users')
    studentCount.value = res.users
  }
  catch {
    // sem rede/sem banco: contador simplesmente não aparece
  }
})

const ctaTarget = computed(() => (loggedIn.value ? '/mapa' : '/registro'))
const ctaLabel = computed(() => (loggedIn.value ? '▶ Continuar aventura' : '▶ Jogar agora'))

const SITE_URL = 'https://rust-quest-2d-one.vercel.app'
const DESCRIPTION
  = 'Jogo grátis para aprender Rust no navegador: 30 níveis do let ao ownership, com dicas, erros em português e estrelas. Os 3 primeiros níveis são sem cadastro.'

const faq = [
  {
    q: 'O que é o Rust Quest 2D?',
    a: 'É um jogo educativo em que você escreve código Rust de verdade num console e o personagem pixel executa seus comandos em uma plataforma 2D vertical. Serve de tutorial e de prática para quem está aprendendo Rust do zero.',
  },
  {
    q: 'Preciso instalar o Rust ou alguma ferramenta?',
    a: 'Não. Tudo roda direto no navegador: o interpretador do jogo é nosso e entende um subconjunto do Rust, do let até ownership. Basta abrir a página e começar a jogar.',
  },
  {
    q: 'O Rust Quest 2D é grátis?',
    a: 'Sim. Os 3 primeiros níveis são jogáveis sem cadastro. Criar conta é gratuito e serve para salvar progresso, estrelas e XP entre dispositivos.',
  },
  {
    q: 'Preciso saber programar para jogar?',
    a: 'Não. O jogo ensina os conceitos na ordem — cada nível tem um card "O que você vai aprender", dicas progressivas e mensagens de erro em português. Quem nunca programou consegue acompanhar desde o nível 1.',
  },
  {
    q: 'Que tópicos de Rust o jogo ensina?',
    a: 'A progressão segue o livro oficial The Rust Programming Language: variáveis com let e mut, operadores, laços (for, while, loop), funções, String, e ownership com move e empréstimo (&), incluindo o erro clássico E0382.',
  },
  {
    q: 'Funciona no celular?',
    a: 'Os mapas e níveis têm layout adaptado para telas menores, com alternância entre o console de código e a cena do jogo. Para digitar código, um teclado físico ajuda, mas é jogável no navegador do celular.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Rust Quest 2D',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  inLanguage: 'pt-BR',
  url: SITE_URL,
  description: DESCRIPTION,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
  genre: 'Educativo',
  keywords: 'aprender rust, rust para iniciantes, tutorial rust, jogo educativo rust, programação rust',
}

useSeoMeta({
  title: 'Rust Quest 2D — Aprenda Rust jogando grátis no navegador',
  description: DESCRIPTION,
  ogTitle: 'Rust Quest 2D — Aprenda Rust jogando',
  ogDescription: DESCRIPTION,
  ogUrl: `${SITE_URL}/`,
  ogImage: `${SITE_URL}/og.png`,
  ogType: 'website',
  ogLocale: 'pt_BR',
  ogSiteName: 'Rust Quest 2D',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Rust Quest 2D — Aprenda Rust jogando',
  twitterDescription: DESCRIPTION,
  twitterImage: `${SITE_URL}/og.png`,
})

useHead({
  link: [{ rel: 'canonical', href: `${SITE_URL}/` }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(softwareJsonLd) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(faqJsonLd) },
  ],
})
</script>

<style scoped>
.home {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
  padding-bottom: 1.5rem;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 2.4rem;
  align-items: center;
  padding: 1.6rem 0 0.6rem;
}

.badge {
  display: inline-block;
  color: var(--accent-2);
  border: 1px solid var(--border-bright);
  background: var(--bg-panel);
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  margin-bottom: 1.1rem;
  box-shadow: 0 0 18px rgb(239 128 80 / 14%);
}

h1 {
  font-size: 3.1rem;
  line-height: 1.08;
  margin: 0 0 1rem;
  letter-spacing: 0;
  font-weight: 800;
}

h1 em {
  font-style: normal;
  color: var(--accent-2);
  text-shadow: 0 0 28px rgb(239 128 80 / 20%);
}

.lead {
  color: var(--text-dim);
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0 0 1.4rem;
  max-width: 34rem;
}

.lead code {
  font-family: var(--font-mono);
  color: var(--gold);
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.05rem 0.35rem;
  font-size: 0.95em;
}

.cta-row {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 0.75rem 1.6rem;
  font-size: 1.05rem;
  text-decoration: none;
}

a.btn:hover {
  text-decoration: none;
}

.fineprint {
  color: var(--text-dim);
  font-size: 0.82rem;
  margin: 1rem 0 0;
}

.students-count {
  color: var(--accent-2);
}

.free-link-row {
  margin: 0.9rem 0 0;
}

.free-link {
  color: var(--accent-2);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border-bottom: 1px dashed rgb(239 128 80 / 50%);
}

.free-link:hover {
  border-bottom-style: solid;
}

/* FAQ — conteúdo indexável para caudas de busca ("aprender rust", etc.) */
.faq {
  border-top: 1px solid var(--border);
  padding-top: 1.6rem;
}

.faq h2 {
  font-size: 1.5rem;
  margin: 0 0 1rem;
}

.faq-item {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.85rem 1.1rem;
  margin-bottom: 0.6rem;
}

.faq-item summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text);
}

.faq-item p {
  color: var(--text-dim);
  line-height: 1.6;
  margin: 0.7rem 0 0.1rem;
  max-width: 46rem;
}

/* Painel de código: mesma linguagem do editor do jogo */
.hero-code {
  overflow: hidden;
  box-shadow: 0 16px 40px rgb(0 0 0 / 40%), 0 0 0 1px rgb(239 128 80 / 18%);
  border-color: var(--border-bright);
}

.hero-code::before {
  content: '';
  display: block;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--gold), var(--green));
}

.code-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.8rem;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border);
}

.dot:nth-child(1) { background: var(--red); }
.dot:nth-child(2) { background: var(--gold); }
.dot:nth-child(3) { background: var(--green); }

.code-title {
  margin-left: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-dim);
}

.code-body {
  margin: 0;
  padding: 1rem 1.1rem;
  font-family: var(--font-mono);
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--text);
  overflow-x: auto;
}

.code-body .c { color: var(--text-dim); font-style: italic; }
.code-body .k { color: var(--red); }
.code-body .f { color: var(--blue); }
.code-body .t { color: var(--gold); }
.code-body .n { color: var(--accent-2); }

.code-foot {
  padding: 0.55rem 1.1rem;
  border-top: 1px solid var(--border);
  background: var(--bg-panel);
  font-size: 0.85rem;
  color: var(--text-dim);
}

.code-foot .ok {
  color: var(--green);
}

/* Faixa de features: uma superfície agrupada, linhas separadas por borda */
.strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.strip-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1.2rem 1.3rem;
  position: relative;
}

.strip-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 1.2rem;
  width: 8px;
  height: 8px;
  background: var(--accent);
  box-shadow: 0 0 10px rgb(239 128 80 / 48%);
}

.strip-item:nth-child(2)::before { background: var(--gold); box-shadow: 0 0 10px rgb(240 201 109 / 48%); }
.strip-item:nth-child(3)::before { background: var(--green); box-shadow: 0 0 10px rgb(120 214 160 / 48%); }

.strip-item {
  padding-left: 1.5rem;
}

.strip-item + .strip-item {
  border-left: 1px solid var(--border);
}

.strip-item strong {
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
}

.strip-item span {
  color: var(--text-dim);
  font-size: 0.86rem;
  line-height: 1.45;
}

@media (max-width: 820px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 1.6rem;
  }

  h1 { font-size: 2.55rem; }

  .strip {
    grid-template-columns: 1fr;
  }

  .strip-item + .strip-item {
    border-left: none;
    border-top: 1px solid var(--border);
  }
}

@media (max-width: 520px) {
  h1 { font-size: 2.15rem; }
  .hero { padding-top: 0.75rem; }
  .hero-code .code-body { font-size: 0.77rem; }
  .cta-row .btn { width: 100%; }
  .strip-item { padding-top: 1rem; padding-bottom: 1rem; }
}
</style>
