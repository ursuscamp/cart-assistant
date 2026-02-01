<template>
  <v-app theme="dark">
    <v-navigation-drawer v-model="drawer" app color="surface" class="border-e">
      <div class="pa-4" style="background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);">
        <div class="d-flex align-center">
          <v-icon size="28" color="white" class="mr-3">mdi-cart-outline</v-icon>
          <div>
            <v-list-item-title class="text-h6 font-weight-bold text-white">
              Cart Assistant
            </v-list-item-title>
            <v-list-item-subtitle class="text-white text-caption" style="opacity: 0.85;">
              Smart Grocery Lists
            </v-list-item-subtitle>
          </div>
        </div>
      </div>

      <v-list nav density="comfortable" class="mt-3 px-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          rounded="lg"
          class="mb-1"
          color="primary"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon" size="22"></v-icon>
          </template>
          <v-list-item-title class="text-body-1 font-weight-medium">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="surface" elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer" color="primary"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-h6 font-weight-bold text-primary">
        Cart Assistant
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
const drawer = ref(true)

const navItems = [
  { icon: 'mdi-home', title: 'Dashboard', to: '/' },
  { icon: 'mdi-format-list-bulleted', title: 'Lists', to: '/lists' },
  { icon: 'mdi-cart', title: 'Grocery Lists', to: '/grocery' },
  { icon: 'mdi-cog', title: 'Settings', to: '/settings' },
]

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

provide('snackbar', snackbar)
</script>

<style>
.v-navigation-drawer {
  transition: all 0.3s ease;
}

.v-list-item--active {
  background: rgba(46, 125, 50, 0.15);
}

.v-list-item--active .v-list-item-title {
  color: #4CAF50;
  font-weight: 600 !important;
}
</style>
