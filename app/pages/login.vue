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

      <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

      <button class="btn btn-primary" type="submit" :disabled="busy">
        {{ busy ? 'Entrando…' : 'Entrar' }}
      </button>

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
  max-width: 380px;
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.auth-card h1 {
  margin: 0;
}

.auth-sub {
  color: var(--text-dim);
  margin: 0;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: var(--text-dim);
}

input {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  padding: 0.6rem 0.7rem;
  font-size: 1rem;
}

input:focus {
  outline: 2px solid var(--accent);
  border-color: transparent;
}

.auth-error {
  color: var(--red);
  margin: 0;
  font-size: 0.9rem;
}

.auth-switch {
  text-align: center;
  color: var(--text-dim);
  font-size: 0.9rem;
  margin: 0;
}
</style>
