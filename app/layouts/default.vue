<template>
  <div class="min-h-screen bg-bark-950 flex">
    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="px-6 py-5 bg-gradient-to-br from-forest-800 to-forest-950 border-b border-bark-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-forest-600 flex items-center justify-center shadow-lg shadow-forest-900/30">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold text-white">Cart Assistant</h1>
            <p class="text-xs text-forest-300">Smart Grocery Lists</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
            isActive(item.to)
              ? 'bg-forest-600/20 text-white border-l-2 border-forest-500'
              : 'text-bark-400 hover:text-white hover:bg-bark-800/50'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.title }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen ml-64">
      <!-- Top Bar -->
      <header class="sticky top-0 z-30 bg-bark-950/80 backdrop-blur-md border-b border-bark-800">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-semibold text-white">{{ pageTitle }}</h1>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>

    <!-- Toast Notifications -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div
          v-if="toast.show"
          :class="[
            'fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-xl border z-50 flex items-center gap-3',
            toast.type === 'success' ? 'bg-forest-600 border-forest-500 text-white' :
            toast.type === 'error' ? 'bg-red-600 border-red-500 text-white' :
            'bg-bark-700 border-bark-600 text-white'
          ]"
        >
          <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { HomeIcon, ListBulletIcon, ShoppingCartIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const toast = useToast()

const navItems = [
  { icon: HomeIcon, title: 'Dashboard', to: '/' },
  { icon: ListBulletIcon, title: 'Lists', to: '/lists' },
  { icon: ShoppingCartIcon, title: 'Grocery Lists', to: '/grocery' },
  { icon: Cog6ToothIcon, title: 'Settings', to: '/settings' },
]

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/lists': 'Lists',
    '/grocery': 'Grocery Lists',
    '/settings': 'Settings'
  }
  return titles[route.path] || 'Cart Assistant'
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
