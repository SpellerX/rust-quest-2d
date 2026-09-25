<template>
  <div />
</template>

<script setup lang="ts">
// Redireciona: logado → mapa; senão → login.
const auth = useAuthStore()
auth.hydrate()
navigateTo(auth.isAuthenticated ? '/mapa' : '/login', { replace: true })
</script>
