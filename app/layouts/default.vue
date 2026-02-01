<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app color="surface" class="border-e">
      <div class="pa-4 bg-primary">
        <v-list-item-title class="text-h6 font-weight-bold text-white">
          <v-icon class="mr-2">mdi-cart-outline</v-icon>
          Cart Assistant
        </v-list-item-title>
        <v-list-item-subtitle class="text-white opacity-80">
          Smart Grocery Lists
        </v-list-item-subtitle>
      </div>

      <v-list nav density="comfortable" class="mt-2">
        <v-list-item
          prepend-icon="mdi-home"
          title="Dashboard"
          to="/"
          rounded="lg"
          class="mx-2 mb-1"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-format-list-bulleted"
          title="Lists"
          to="/lists"
          rounded="lg"
          class="mx-2 mb-1"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cart"
          title="Grocery Lists"
          to="/grocery"
          rounded="lg"
          class="mx-2 mb-1"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          to="/settings"
          rounded="lg"
          class="mx-2 mb-1"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer" class="text-white"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-white font-weight-medium">
        Cart Assistant
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon variant="text" class="text-white">
        <v-icon>mdi-account-circle-outline</v-icon>
      </v-btn>
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
</style>
