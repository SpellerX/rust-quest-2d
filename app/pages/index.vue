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

        <p class="fineprint">Sem instalar nada · roda no navegador · progresso salvo</p>
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
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()

const loggedIn = ref(false)

onMounted(() => {
  auth.hydrate()
  loggedIn.value = auth.isAuthenticated
})

const ctaTarget = computed(() => (loggedIn.value ? '/mapa' : '/registro'))
const ctaLabel = computed(() => (loggedIn.value ? '▶ Continuar aventura' : '▶ Jogar agora'))

useHead({ title: 'Rust Quest 2D — Aprenda Rust jogando' })
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
