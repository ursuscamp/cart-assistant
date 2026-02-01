<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list-item class="pa-4">
        <v-list-item-title class="text-h6 font-weight-bold">
          Cart Assistant
        </v-list-item-title>
        <v-list-item-subtitle>Smart Grocery Lists</v-list-item-subtitle>
      </v-list-item>

      <v-divider></v-divider>

      <v-list nav density="compact">
        <v-list-item
          prepend-icon="mdi-home"
          title="Dashboard"
          to="/"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-format-list-bulleted"
          title="Lists"
          to="/lists"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cart"
          title="Grocery Lists"
          to="/grocery"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          to="/settings"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Cart Assistant</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4">
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
