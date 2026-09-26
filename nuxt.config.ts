// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  // <HUD>, <GameCanvas>… sem prefixo vindo da subpasta game/
  components: [{ path: '~/components', pathPrefix: false }],
  typescript: { strict: true },
  vite: {
    // Evita erro de pre-bundle do Phaser no dev server
    optimizeDeps: { include: ['phaser'] },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Rust Quest 2D',
      meta: [
        { name: 'description', content: 'Aprenda Rust jogando: escreva código, mova o boneco, vença as fases.' },
      ],
    },
  },
  runtimeConfig: {
    // NUXT_JWT_SECRET / NUXT_MONGODB_URI via .env
    // (camelCase → SNAKE_CASE: mongodbUri casa com NUXT_MONGODB_URI)
    jwtSecret: '',
    mongodbUri: '',
  },
})
