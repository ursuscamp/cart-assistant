<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Grocery Lists</h1>
        <p class="text-bark-400 mt-1">View and manage your shopping lists</p>
      </div>
      <NuxtLink to="/" class="btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create New
      </NuxtLink>
    </div>

    <div v-if="groceryStore.lists.length > 0" class="space-y-4">
      <div v-for="list in groceryStore.lists" :key="list.id" class="card hover:border-forest-600/50 transition-all duration-300 group">
        <NuxtLink :to="`/grocery/${list.id}`" class="block">
          <div class="flex items-center justify-between p-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-forest-600/20 flex items-center justify-center">
                <svg class="w-6 h-6 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white group-hover:text-forest-400 transition-colors">{{ list.name }}</h3>
                <div class="flex items-center gap-4 mt-1">
                  <span class="text-sm text-bark-400">{{ list.week_of }}</span>
                  <span class="text-sm text-bark-500">·</span>
                  <span class="text-sm text-forest-400">{{ list.item_count || 0 }} items</span>
                  <span v-if="list.checked_count" class="text-sm text-bark-500">·</span>
                  <span v-if="list.checked_count" class="text-sm text-forest-400">{{ list.checked_count }} checked</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div v-if="list.item_count && list.checked_count" class="w-32">
                <div class="h-2 bg-bark-800 rounded-full overflow-hidden">
                  <div class="h-full bg-forest-500 transition-all duration-300" :style="{ width: `${(list.checked_count / list.item_count) * 100}%` }"></div>
                </div>
                <p class="text-xs text-bark-500 mt-1">{{ Math.round((list.checked_count / list.item_count) * 100) }}% complete</p>
              </div>
              <svg class="w-5 h-5 text-bark-500 group-hover:text-forest-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </NuxtLink>
        <div v-if="list.sources?.length" class="px-6 pb-4">
          <div class="flex flex-wrap gap-2">
            <span v-for="source in list.sources.slice(0, 5)" :key="source.id" class="chip-clickable">{{ source.name }}</span>
            <span v-if="list.sources.length > 5" class="chip">+{{ list.sources.length - 5 }} more</span>
          </div>
        </div>
        <div class="px-6 pb-4 flex justify-end">
          <button @click.stop="confirmDelete(list)" class="btn-ghost text-bark-400 hover:text-red-400 text-sm">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>

    <div v-else class="card">
      <div class="card-body text-center py-16">
        <div class="w-20 h-20 mx-auto rounded-full bg-bark-800 flex items-center justify-center mb-6">
          <svg class="w-10 h-10 text-bark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">No grocery lists yet</h3>
        <p class="text-bark-400 mb-6">Create your first combined grocery list</p>
        <NuxtLink to="/" class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Your First List
        </NuxtLink>
      </div>
    </div>

    <Modal :show="showDeleteModal" title="Delete Grocery List" @close="showDeleteModal = false">
      <p class="text-bark-300">Are you sure you want to delete "{{ listToDelete?.name }}"? This action cannot be undone.</p>
      <template #footer>
        <button @click="showDeleteModal = false" class="btn-secondary">Cancel</button>
        <button @click="deleteList" class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { useGroceryStore } from '~/stores/grocery'
import Modal from '~/components/Modal.vue'
import type { GroceryList } from '~/stores/grocery'

const groceryStore = useGroceryStore()
const toast = useToast()

const showDeleteModal = ref(false)
const listToDelete = ref<GroceryList | null>(null)

onMounted(async () => {
  await groceryStore.fetchLists()
})

function confirmDelete(list: GroceryList) {
  listToDelete.value = list
  showDeleteModal.value = true
}

async function deleteList() {
  if (!listToDelete.value) return
  try {
    await groceryStore.deleteList(listToDelete.value.id)
    showDeleteModal.value = false
    listToDelete.value = null
    toast.success('List deleted')
  } catch (error) {
    toast.error('Failed to delete list')
  }
}
</script>
