export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  srcDir: 'app',
  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  runtimeConfig: {
    openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openrouterModel: process.env.OPENROUTER_MODEL || 'google/gemini-3-flash-preview',
    public: {
      databasePath: process.env.DATABASE_PATH || './data/grocery.db',
    }
  },

  nitro: {
    routeRules: {
      '/api/**': { cors: true }
    }
  },

  compatibilityDate: '2025-01-01'
})
