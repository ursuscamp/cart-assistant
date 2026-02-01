<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Dashboard</h1>
        <p class="text-bark-400 mt-1">Create and manage your grocery lists</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Quick Create Card -->
      <div class="card">
        <div class="card-header bg-gradient-to-r from-forest-700 to-forest-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">Quick Create Grocery List</h2>
              <p class="text-sm text-forest-200">Select lists to combine</p>
            </div>
          </div>
        </div>
        <div class="card-body space-y-4">
          <p class="text-sm text-bark-300">Select lists to combine into your grocery list:</p>

          <div v-if="listsStore.lists.length > 0" class="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
            <label
              v-for="list in listsStore.lists"
              :key="list.id"
              :class="[
                'flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer',
                selectedLists.includes(list.id)
                  ? 'bg-forest-600/20 border-forest-500'
                  : 'bg-bark-900/50 border-bark-800 hover:border-bark-700'
              ]"
            >
              <div class="flex items-center gap-3">
                <Checkbox v-model="selectedLists" :value="list.id" />
                <span class="font-medium text-white">{{ list.name }}</span>
              </div>
              <span class="chip">{{ list.ingredient_count || 0 }} items</span>
            </label>
          </div>

          <div v-else class="text-center py-8">
            <div class="w-16 h-16 mx-auto rounded-full bg-bark-800 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-bark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p class="text-bark-400">No lists yet</p>
            <NuxtLink to="/lists" class="btn-primary mt-4 inline-flex">
              Create Your First List
            </NuxtLink>
          </div>

          <div>
            <label class="input-label">List name (optional)</label>
            <input
              v-model="listName"
              type="text"
              class="input-field"
              placeholder="Week of Feb 1"
            />
          </div>

          <button
            @click="createGroceryList"
            :disabled="selectedLists.length === 0 || loading"
            class="btn-primary w-full py-3"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Create Grocery List
          </button>
        </div>
      </div>

      <!-- Recent & Quick Actions -->
      <div class="space-y-6">
        <!-- Recent Lists -->
        <div class="card">
          <div class="section-header">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-semibold text-white">Recent Grocery Lists</h3>
            </div>
          </div>
          <div class="card-body">
            <div v-if="groceryStore.lists.length > 0" class="space-y-2">
              <NuxtLink
                v-for="list in groceryStore.lists.slice(0, 5)"
                :key="list.id"
                :to="`/grocery/${list.id}`"
                class="list-item group"
              >
                <div class="w-10 h-10 rounded-lg bg-forest-600/20 flex items-center justify-center">
                  <svg class="w-5 h-5 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-white group-hover:text-forest-400 transition-colors">{{ list.name }}</p>
                  <p class="text-sm text-bark-400">
                    {{ list.item_count || 0 }} items
                    <span v-if="list.checked_count" class="text-forest-400 ml-2">
                      · {{ list.checked_count }} checked
                    </span>
                  </p>
                </div>
                <svg class="w-5 h-5 text-bark-500 group-hover:text-forest-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
            <div v-else class="text-center py-8">
              <div class="w-16 h-16 mx-auto rounded-full bg-bark-800 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-bark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p class="text-bark-400">No grocery lists yet</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="section-header">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-moss-500/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-moss-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="font-semibold text-white">Quick Actions</h3>
            </div>
          </div>
          <div class="card-body space-y-3">
            <NuxtLink to="/lists" class="btn-secondary w-full justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Manage Lists
            </NuxtLink>
            <NuxtLink to="/grocery" class="btn-secondary w-full justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              View All Grocery Lists
            </NuxtLink>
            <NuxtLink to="/settings" class="btn-secondary w-full justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListsStore } from '~/stores/lists'
import { useGroceryStore } from '~/stores/grocery'
import Checkbox from '~/components/Checkbox.vue'

const listsStore = useListsStore()
const groceryStore = useGroceryStore()
const router = useRouter()

const selectedLists = ref<number[]>([])
const listName = ref('')
const loading = ref(false)

onMounted(async () => {
  await Promise.all([
    listsStore.fetchLists(),
    groceryStore.fetchLists()
  ])
})

async function createGroceryList() {
  loading.value = true
  try {
    const list = await groceryStore.createList(
      listName.value || `Week of ${new Date().toLocaleDateString()}`,
      selectedLists.value
    )
    router.push(`/grocery/${list.id}`)
  } catch (error) {
    console.error('Failed to create grocery list:', error)
  } finally {
    loading.value = false
  }
}
</script>
