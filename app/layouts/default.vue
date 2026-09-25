<template>
  <div class="layout">
    <header class="topbar">
      <NuxtLink to="/mapa" class="brand">🦀 Rust Quest <span>2D</span></NuxtLink>
      <div class="spacer" />
      <slot name="hud" />
    </header>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

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
  padding: 0.6rem 1.2rem;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border);
}

.brand {
  color: var(--text);
  font-weight: 700;
  font-size: 1.05rem;
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

.content {
  flex: 1;
  padding: 1.2rem;
}
</style>
