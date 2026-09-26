<template>
  <div class="auth-page">
    <form class="auth-card panel" @submit.prevent="onSubmit">
      <h1>🦀 Entrar</h1>
      <p class="auth-sub">Continue sua aventura em Rust.</p>

      <label>
        E-mail
        <input v-model="email" type="email" required autocomplete="email">
      </label>
      <label>
        Senha
        <input v-model="password" type="password" required autocomplete="current-password">
      </label>

      <InlineAlert v-if="errorMsg" tone="danger">{{ errorMsg }}</InlineAlert>

      <button class="btn btn-primary auth-submit" type="submit" :disabled="busy" :aria-busy="busy">
        {{ busy ? 'Entrando…' : 'Entrar' }}
      </button>

      <NuxtLink to="/recuperar-senha" class="forgot">
        Esqueci a senha
      </NuxtLink>

      <p class="auth-switch">
        Não tem conta? <NuxtLink to="/registro">Criar agora</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()

const email = ref('')
const password = ref('')
const busy = ref(false)
const errorMsg = ref('')

// Já autenticado → mapa.
onMounted(() => {
  auth.hydrate()
  if (auth.isAuthenticated) navigateTo('/mapa')
})

async function onSubmit() {
  busy.value = true
  errorMsg.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = String(route.query.redirect ?? '/mapa')
    await navigateTo(redirect)
  }
  catch (e: unknown) {
    errorMsg.value = extractApiError(e, 'Não foi possível entrar. Verifique seus dados.')
  }
  finally {
    busy.value = false
  }
}

useSeoMeta({
  title: 'Entrar — Rust Quest 2D',
  description: 'Entre na sua conta gratuita do Rust Quest 2D e continue aprendendo Rust: 30 níveis, estrelas e progresso salvos.',
  ogTitle: 'Entrar — Rust Quest 2D',
  ogUrl: 'https://rust-quest-2d-one.vercel.app/login',
  ogImage: 'https://rust-quest-2d-one.vercel.app/og.png',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://rust-quest-2d-one.vercel.app/login' }],
})
</script>

<style scoped>
.auth-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgb(0 0 0 / 40%), 0 0 36px rgb(239 128 80 / 8%);
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--gold));
}

.auth-card h1 {
  margin: 0;
  font-size: 1.55rem;
}

.auth-sub {
  color: var(--text-dim);
  margin: 0;
}

.auth-submit { width: 100%; }

.auth-switch {
  text-align: center;
  color: var(--text-dim);
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 520px) {
  .auth-page { min-height: 0; padding: 1.5rem 0; }
  .auth-card { padding: 1.4rem 1.2rem; }
}
</style>
