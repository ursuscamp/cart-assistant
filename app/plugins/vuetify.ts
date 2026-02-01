import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#2E7D32',
            secondary: '#558B2F',
            accent: '#8BC34A',
            error: '#D32F2F',
            warning: '#FFA000',
            info: '#1976D2',
            success: '#388E3C',
            background: '#FAFAFA',
          },
        },
        dark: {
          colors: {
            primary: '#4CAF50',
            secondary: '#8BC34A',
            accent: '#CDDC39',
            error: '#EF5350',
            warning: '#FFB300',
            info: '#42A5F5',
            success: '#66BB6A',
            background: '#121212',
          },
        },
      },
    },
    defaults: {
      VBtn: {
        rounded: 'lg',
      },
      VCard: {
        rounded: 'lg',
        elevation: 2,
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
      },
    },
  })
  app.vueApp.use(vuetify)
})
