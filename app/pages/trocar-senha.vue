<template>
  <div class="auth-page">
    <form class="auth-card panel" @submit.prevent="onSubmit">
      <h1>🔑 Trocar senha</h1>
      <p class="auth-sub">Escolha uma nova senha para a sua conta.</p>

      <label>
        Senha atual
        <input v-model="currentPassword" type="password" required autocomplete="current-password">
      </label>
      <label>
        Nova senha
        <input v-model="newPassword" type="password" required minlength="6" autocomplete="new-password">
      </label>
      <label>
        Repetir nova senha
        <input v-model="confirmPassword" type="password" required minlength="6" autocomplete="new-password">
      </label>

      <InlineAlert v-if="errorMsg" tone="danger">{{ errorMsg }}</InlineAlert>
      <InlineAlert v-if="okMsg" tone="success">{{ okMsg }}</InlineAlert>

      <button class="btn btn-primary auth-submit" type="submit" :disabled="busy" :aria-busy="busy">
        {{ busy ? 'Salvando…' : 'Salvar nova senha' }}
      </button>

      <p class="auth-switch">
        <NuxtLink to="/mapa">Voltar ao mapa</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const busy = ref(false)
const errorMsg = ref('')
const okMsg = ref('')

definePageMeta({ middleware: 'auth' })

async function onSubmit() {
  busy.value = true
  errorMsg.value = ''
  okMsg.value = ''

  if (newPassword.value.length < 6) {
    errorMsg.value = 'A nova senha precisa de pelo menos 6 caracteres.'
    busy.value = false
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'As senhas novas não coincidem.'
    busy.value = false
    return
  }

  try {
    auth.hydrate()
    await auth.changePassword(currentPassword.value, newPassword.value)
    okMsg.value = 'Senha alterada! Use a nova senha no próximo login.'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  }
  catch (e: unknown) {
    errorMsg.value = extractApiError(e, 'Não foi possível alterar a senha.')
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
