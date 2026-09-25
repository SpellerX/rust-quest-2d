<template>
  <div class="auth-page">
    <form class="auth-card panel" @submit.prevent="onSubmit">
      <h1>🦀 Criar conta</h1>
      <p class="auth-sub">Comece a jornada em Rust em poucos segundos.</p>

      <label>
        Nome de jogador
        <input v-model="username" type="text" required minlength="3" maxlength="20" autocomplete="username">
      </label>
      <label>
        E-mail
        <input v-model="email" type="email" required autocomplete="email">
      </label>
      <label>
        Senha
        <input v-model="password" type="password" required minlength="6" autocomplete="new-password">
      </label>

      <p v-if="errorMsg" class="auth-error">{{ errorMsg }}</p>

      <button class="btn btn-primary" type="submit" :disabled="busy">
        {{ busy ? 'Criando…' : 'Criar conta' }}
      </button>

      <p class="auth-switch">
        Já tem conta? <NuxtLink to="/login">Entrar</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const busy = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  busy.value = true
  errorMsg.value = ''
  try {
    await auth.register(email.value, username.value, password.value)
    await navigateTo('/mapa')
  }
  catch (e: unknown) {
    errorMsg.value = extractApiError(e, 'Não foi possível criar a conta.')
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
