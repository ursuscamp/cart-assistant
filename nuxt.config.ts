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

  app: {
    head: {
      title: 'Cart Assistant',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', href: '/favicon-16x16.png', sizes: '16x16' },
        { rel: 'icon', type: 'image/png', href: '/favicon-48x48.png', sizes: '48x48' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' }
      ],
      meta: [
        { name: 'theme-color', content: '#22c55e' }
      ]
    }
  },

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
