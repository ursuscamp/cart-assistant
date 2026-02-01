<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

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
</style>
