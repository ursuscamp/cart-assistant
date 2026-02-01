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

      <!-- Footer -->
      <div class="p-4 border-t border-bark-800">
        <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-bark-900/50">
          <div class="w-8 h-8 rounded-full bg-forest-600 flex items-center justify-center">
            <span class="text-xs font-bold text-white">CA</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">Cart Assistant</p>
            <p class="text-xs text-bark-500 truncate">Home Server</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen ml-64">
      <!-- Top Bar -->
      <header class="sticky top-0 z-30 bg-bark-950/80 backdrop-blur-md border-b border-bark-800">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center gap-4">
            <button
              @click="drawerOpen = !drawerOpen"
              class="lg:hidden p-2 rounded-lg text-bark-400 hover:text-white hover:bg-bark-800"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 class="text-xl font-semibold text-white">{{ pageTitle }}</h1>
          </div>
          <div class="flex items-center gap-3">
            <button class="p-2 rounded-lg text-bark-400 hover:text-white hover:bg-bark-800 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
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

const drawerOpen = ref(true)

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
