import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((app) => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)

  const style = document.createElement('style')
  style.textContent = `
    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    body {
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6 {
      font-weight: 700 !important;
      letter-spacing: -0.02em;
    }
    .v-card-title {
      font-weight: 600 !important;
    }
    .v-btn {
      text-transform: none !important;
      letter-spacing: 0.02em;
    }
    .v-list-item-title {
      font-weight: 500 !important;
    }
    .v-list-item-subtitle {
      font-weight: 400 !important;
    }
  `
  document.head.appendChild(style)

  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'greenTheme',
      themes: {
        greenTheme: {
          dark: false,
          colors: {
            primary: '#2E7D32',
            'primary-darken-1': '#1B5E20',
            secondary: '#43A047',
            'secondary-darken-1': '#2E7D32',
            accent: '#81C784',
            error: '#D32F2F',
            'error-darken-1': '#B71C1C',
            warning: '#F57C00',
            'warning-darken-1': '#E65100',
            info: '#0288D1',
            'info-darken-1': '#01579B',
            success: '#388E3C',
            'success-darken-1': '#1B5E20',
            background: '#F5F9F5',
            surface: '#FFFFFF',
            'surface-variant': '#E8F5E9',
            'on-surface': '#1A1A1A',
            'on-surface-variant': '#424242',
          },
        },
        dark: {
          colors: {
            primary: '#4CAF50',
            'primary-darken-1': '#388E3C',
            secondary: '#66BB6A',
            'secondary-darken-1': '#4CAF50',
            accent: '#A5D6A7',
            error: '#EF5350',
            'error-darken-1': '#C62828',
            warning: '#FFB74D',
            'warning-darken-1': '#FF9800',
            info: '#4FC3F7',
            'info-darken-1': '#29B6F6',
            success: '#66BB6A',
            'success-darken-1': '#4CAF50',
            background: '#1A2A1A',
            surface: '#243024',
            'surface-variant': '#2D3F2D',
          },
        },
      },
    },
    defaults: {
      VBtn: {
        rounded: 'lg',
        fontWeight: 600,
      },
      VCard: {
        rounded: 'lg',
        elevation: 3,
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
      },
      VCheckbox: {
        color: 'primary',
      },
      VChip: {
        rounded: 'lg',
        fontWeight: 500,
      },
      VList: {
        rounded: 'lg',
      },
      VAppBar: {
        elevation: 0,
      },
      VNavigationDrawer: {
        elevation: 2,
      },
    },
  })
  app.vueApp.use(vuetify)
})
