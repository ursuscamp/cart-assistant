import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'darkGreen',
      themes: {
        darkGreen: {
          dark: true,
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
            background: '#121212',
            surface: '#1E1E1E',
            'surface-variant': '#2C2C2C',
          },
        },
        light: {
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
        elevation: 2,
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
        elevation: 1,
      },
      VNavigationDrawer: {
        elevation: 2,
      },
    },
  })
  app.vueApp.use(vuetify)
})
