<template>
  <div class="min-h-screen bg-bark-950 flex">
    <!-- Mobile Header -->
    <header class="fixed top-0 left-0 right-0 z-40 bg-bark-950/95 backdrop-blur-md border-b border-bark-800 lg:hidden">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-lg text-bark-400 hover:text-white hover:bg-bark-800">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-white">{{ pageTitle }}</h1>
        <div class="w-10"></div>
      </div>
    </header>

    <!-- Sidebar Overlay -->
    <Transition name="fade">
      <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/50 z-40 lg:hidden"></div>
    </Transition>

    <!-- Sidebar -->
    <aside :class="[
      'sidebar fixed left-0 top-0 h-full w-64 bg-bark-950 border-r border-bark-800 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
      <!-- Logo -->
      <div class="px-4 py-4 bg-gradient-to-br from-forest-800 to-forest-950 border-b border-bark-800">
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
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" @click="sidebarOpen = false" :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
          isActive(item.to)
            ? 'bg-forest-600/20 text-white border-l-2 border-forest-500'
            : 'text-bark-400 hover:text-white hover:bg-bark-800/50'
        ]">
          <component :is="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.title }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen lg:ml-64">
      <!-- Desktop Header -->
      <header class="sticky top-0 z-30 bg-bark-950/80 backdrop-blur-md border-b border-bark-800 hidden lg:block">
        <div class="flex items-center justify-between px-6 py-4">
          <h1 class="text-xl font-semibold text-white">{{ pageTitle }}</h1>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-6 overflow-auto pt-16 lg:pt-6">
        <slot />
      </main>
    </div>

    <!-- Toast Notifications -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="toast.show" :class="[
          'fixed bottom-4 right-4 left-4 lg:left-auto px-4 py-3 lg:px-6 lg:py-4 rounded-lg shadow-xl border z-50 flex items-center gap-3',
          toast.type === 'success' ? 'bg-forest-600 border-forest-500 text-white' :
          toast.type === 'error' ? 'bg-red-600 border-red-500 text-white' :
          'bg-bark-700 border-bark-600 text-white'
        ]">
          <svg v-if="toast.type === 'success'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span class="text-sm lg:text-base">{{ toast.message }}</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { HomeIcon, ListBulletIcon, ShoppingCartIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const toast = useToast()

const sidebarOpen = ref(false)

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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
