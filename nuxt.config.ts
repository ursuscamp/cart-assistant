import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: false },

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins!.push(vuetify({ autoImport: true }))
      })
    },
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  css: ['@mdi/font/css/materialdesignicons.min.css'],

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
