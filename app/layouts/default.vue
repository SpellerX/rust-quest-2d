<template>
  <div class="layout">
    <header class="topbar">
      <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
      <NuxtLink to="/" class="brand" aria-label="Rust Quest 2D, início">
        <span aria-hidden="true">🦀</span> Rust Quest <span>2D</span>
      </NuxtLink>
      <div class="spacer" />
      <nav class="nav" aria-label="Navegação principal">
        <template v-if="loggedIn">
          <NuxtLink to="/mapa" class="nav-link"><span aria-hidden="true">🗺️</span> Mapa</NuxtLink>
          <NuxtLink to="/trocar-senha" class="nav-link">Trocar senha</NuxtLink>
          <span v-if="username" class="nav-user" :title="`Jogador: ${username}`">⚡ {{ username }}</span>
          <button class="btn btn-sm" type="button" @click="auth.logout()" aria-label="Sair da conta">
            Sair
          </button>
        </template>
        <NuxtLink v-else to="/login" class="btn btn-sm">Entrar</NuxtLink>
      </nav>
      <slot name="hud" />
    </header>
    <main id="main-content" class="content" tabindex="-1">
      <slot />
    </main>

    <footer class="footer">
      <nav class="footer-nav" aria-label="Links do rodapé">
        <NuxtLink to="/">Início</NuxtLink>
        <NuxtLink to="/mapa">Mapa dos 30 níveis</NuxtLink>
        <NuxtLink to="/nivel/w1-l1">1º nível grátis</NuxtLink>
        <NuxtLink to="/nivel/w1-l2">2º nível grátis</NuxtLink>
        <NuxtLink to="/nivel/w1-l3">3º nível grátis</NuxtLink>
        <NuxtLink to="/registro">Criar conta</NuxtLink>
        <NuxtLink to="/login">Entrar</NuxtLink>
        <a href="https://github.com/SpellerX/rust-quest-2d" rel="noopener">Código no GitHub</a>
      </nav>
      <p class="footer-note">Rust Quest 2D — jogo gratuito para aprender Rust do zero, no navegador.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()

const loggedIn = ref(false)
const username = ref('')

onMounted(() => {
  auth.hydrate()
  loggedIn.value = auth.isAuthenticated
  username.value = auth.user?.username ?? ''
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.65rem 1.4rem;
  background: rgb(21 32 30 / 94%);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 0 rgb(255 255 255 / 3%);
}

.brand {
  color: var(--text);
  font-family: var(--font-pixel);
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  text-shadow: 0 0 16px rgb(239 128 80 / 22%);
}

.brand span {
  color: var(--accent);
}

.brand:hover {
  text-decoration: none;
}

.spacer {
  flex: 1;
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.nav-link {
  color: var(--text-dim);
  font-size: 0.92rem;
}

.nav-link:hover {
  color: var(--text);
  text-decoration: none;
}

.nav-link.router-link-active {
  color: var(--accent-2);
}

.nav-user {
  color: var(--gold);
  font-size: 0.88rem;
  font-weight: 700;
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.25rem 0.7rem;
}

.btn-sm {
  padding: 0.35rem 0.85rem;
  font-size: 0.88rem;
}

.content {
  flex: 1;
  width: 100%;
  padding: 1rem clamp(1rem, 3vw, 2rem);
}

.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 100;
  padding: 0.65rem 0.9rem;
  transform: translateY(-160%);
  border-radius: var(--radius);
  background: var(--gold);
  color: #17201a;
  font-weight: 700;
}

.skip-link:focus {
  transform: translateY(0);
}

.footer {
  border-top: 1px solid var(--border);
  margin-top: 2rem;
  padding: 1.4rem 1.4rem 1.8rem;
  background: rgb(21 32 30 / 60%);
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.1rem;
  margin-bottom: 0.6rem;
}

.footer-nav a {
  color: var(--text-dim);
  font-size: 0.85rem;
  text-decoration: none;
}

.footer-nav a:hover {
  color: var(--accent-2);
}

.footer-note {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.78rem;
}

@media (max-width: 600px) {
  .topbar { gap: 0.6rem; padding: 0.6rem 0.8rem; }
  .brand { font-size: 0.58rem; }
  .nav { gap: 0.45rem; }
  .nav-user { max-width: 6.5rem; font-size: 0.78rem; }
  .btn-sm { min-height: 40px; padding: 0.35rem 0.65rem; }
  .content { padding: 0.85rem 0.75rem; }
}
</style>
