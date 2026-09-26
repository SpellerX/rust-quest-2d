<template>
  <div class="auth-page">
    <form v-if="!recoveryCode" class="auth-card panel" @submit.prevent="onSubmit">
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

      <InlineAlert v-if="errorMsg" tone="danger">{{ errorMsg }}</InlineAlert>

      <button class="btn btn-primary auth-submit" type="submit" :disabled="busy" :aria-busy="busy">
        {{ busy ? 'Criando…' : 'Criar conta' }}
      </button>

      <p class="auth-switch">
        Já tem conta? <NuxtLink to="/login">Entrar</NuxtLink>
      </p>
    </form>

    <section v-else class="auth-card panel" aria-labelledby="recovery-title">
      <h1 id="recovery-title">Conta criada!</h1>
      <p class="auth-sub">
        Este é o seu <strong>código de recuperação</strong> — guarde em um lugar
        seguro. É com ele que você redefine a senha se esquecer.
      </p>

      <div class="code-box">
        <code class="code recovery-code">{{ recoveryCode }}</code>
        <button class="btn" type="button" @click="copyCode">
          {{ copied ? 'Copiado ✓' : 'Copiar' }}
        </button>
      </div>

      <InlineAlert v-if="copied" tone="success">Código copiado para a área de transferência.</InlineAlert>
      <InlineAlert v-else tone="warning">
        Mostramos o código só agora e não será possível vê-lo de novo. Anote antes de continuar.
      </InlineAlert>

      <button class="btn btn-primary auth-submit" type="button" @click="navigateTo('/mapa')">
        ▶ Começar a jogar
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const busy = ref(false)
const errorMsg = ref('')
const recoveryCode = ref('')
const copied = ref(false)

async function onSubmit() {
  busy.value = true
  errorMsg.value = ''
  try {
    recoveryCode.value = await auth.register(email.value, username.value, password.value)
  }
  catch (e: unknown) {
    errorMsg.value = extractApiError(e, 'Não foi possível criar a conta.')
  }
  finally {
    busy.value = false
  }
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(recoveryCode.value)
    copied.value = true
  }
  catch {
    copied.value = false
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

.code-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg);
  border: 1px dashed var(--border-bright);
  border-radius: var(--radius);
}

.recovery-code {
  flex: 1;
  font-family: var(--font-mono);
  font-size: clamp(1rem, 4vw, 1.3rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--gold);
  text-align: center;
  word-break: break-all;
}

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
