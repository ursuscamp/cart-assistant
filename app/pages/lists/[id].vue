<template>
  <div v-if="list" class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/lists" class="btn-ghost p-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </NuxtLink>
        <h1 class="text-3xl font-bold text-white">{{ list.name }}</h1>
        <span v-if="list.is_regular_items" class="chip">Regular Items</span>
      </div>
      <div class="flex items-center gap-2">
        <button @click="openEditDialog" class="btn-ghost p-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button @click="confirmDelete" class="btn-ghost p-2 text-red-400 hover:text-red-300">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="font-semibold text-white">Ingredients ({{ list.ingredients?.length || 0 }})</h2>
      </div>
      <div class="card-body">
        <div v-if="list.ingredients && list.ingredients.length > 0" class="space-y-2">
          <div v-for="ing in list.ingredients" :key="ing.id" class="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-bark-800/30">
            <svg class="w-4 h-4 text-bark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span class="text-white flex-1">{{ ing.name }}</span>
            <span v-if="ing.quantity" class="text-bark-400 text-sm">{{ ing.quantity }}</span>
          </div>
        </div>
        <p v-else class="text-center text-bark-400 py-8">No ingredients yet</p>
      </div>
    </div>

    <Modal :show="showDialog" @close="showDialog = false" title="Edit List">
      <div class="space-y-4">
        <div>
          <label class="input-label">List name</label>
          <input v-model="form.name" type="text" class="input-field" />
        </div>
        <div class="flex items-center gap-3">
          <input v-model="form.is_regular_items" type="checkbox" id="regular-items" class="checkbox-custom" />
          <label for="regular-items" class="text-bark-300 cursor-pointer">Regular items list</label>
        </div>
        <div class="border-t border-bark-800 pt-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium text-white">Ingredients</h3>
            <button @click="addIngredient" class="btn-ghost text-sm">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Ingredient
            </button>
          </div>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div v-for="(ing, index) in form.ingredients" :key="index" class="flex items-center gap-2">
              <input v-model="ing.name" type="text" class="input-field text-sm" placeholder="Item name" />
              <input v-model="ing.quantity" type="text" class="input-field w-20 text-sm" placeholder="Qty" />
              <button @click="removeIngredient(index)" class="btn-ghost p-2 text-red-400 hover:text-red-300">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="showDialog = false" class="btn-secondary">Cancel</button>
        <button @click="saveList" class="btn-primary">Save</button>
      </template>
    </Modal>

    <Modal :show="showDeleteDialog" @close="showDeleteDialog = false" title="Delete List">
      <p class="text-bark-300">Are you sure you want to delete "{{ list.name }}"?</p>
      <template #footer>
        <button @click="showDeleteDialog = false" class="btn-secondary">Cancel</button>
        <button @click="deleteList" class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { useListsStore, type List, type Ingredient } from '~/stores/lists'
import Modal from '~/components/Modal.vue'

const route = useRoute()
const router = useRouter()
const listsStore = useListsStore()

const list = ref<List | null>(null)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const form = reactive({ name: '', is_regular_items: false, ingredients: [] as Ingredient[] })

onMounted(async () => {
  const id = Number(route.params.id)
  list.value = await listsStore.fetchList(id)
})

function openEditDialog() {
  form.name = list.value!.name
  form.is_regular_items = list.value!.is_regular_items
  form.ingredients = list.value!.ingredients?.map(i => ({ ...i })) || []
  showDialog.value = true
}

function addIngredient() {
  form.ingredients.push({ name: '', quantity: '' })
}

function removeIngredient(index: number) {
  form.ingredients.splice(index, 1)
}

async function saveList() {
  const ingredients = form.ingredients.filter(i => i.name.trim())
  await listsStore.updateList(list.value!.id, form.name, form.is_regular_items, ingredients)
  list.value = await listsStore.fetchList(list.value!.id)
  showDialog.value = false
}

function confirmDelete() {
  showDeleteDialog.value = true
}

async function deleteList() {
  await listsStore.deleteList(list.value!.id)
  showDeleteDialog.value = false
  router.push('/lists')
}
</script>
