<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-white">Lists</h1>
        <p class="text-bark-400 mt-1">Manage your recipe and shopping lists</p>
      </div>
      <div class="flex gap-2">
        <button @click="showImportModal = true" class="btn-secondary flex-1 sm:flex-none touch-manipulation">
          <svg class="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import
        </button>
        <button @click="openCreateModal" class="btn-primary flex-1 sm:flex-none touch-manipulation">
          <svg class="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New List
        </button>
      </div>
    </div>

    <div v-if="listsStore.lists.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="list in sortedLists" :key="list.id" class="card hover:border-forest-600/50 transition-all duration-300 group">
        <div class="card-header bg-gradient-to-r from-forest-700/50 to-forest-800/30 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="font-semibold text-white truncate">{{ list.name }}</h3>
                <p class="text-xs text-forest-300">{{ list.ingredient_count || 0 }} ingredients</p>
              </div>
            </div>
            <div class="flex gap-1 flex-shrink-0">
              <button @click.stop="openEditModal(list)" class="p-2 rounded-lg text-bark-400 hover:text-white hover:bg-white/10 transition-colors touch-manipulation">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click.stop="confirmDelete(list)" class="p-2 rounded-lg text-bark-400 hover:text-red-400 hover:bg-red-900/20 transition-colors touch-manipulation">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="card-body p-4">
          <NuxtLink :to="`/lists/${list.id}`" class="block touch-manipulation">
            <div class="flex flex-wrap gap-1.5">
              <span v-for="ing in getPreviewIngredients(list.id)" :key="ing.id" class="chip-clickable text-xs">{{ ing.name }}</span>
              <span v-if="(list.ingredient_count || 0) > 5" class="chip text-xs">+{{ (list.ingredient_count || 0) - 5 }} more</span>
            </div>
          </NuxtLink>
        </div>
        <div v-if="list.is_regular_items" class="px-4 pb-3">
          <span class="badge bg-forest-600 text-xs">Regular Items</span>
        </div>
      </div>
    </div>

    <div v-else class="card">
      <div class="card-body text-center py-16">
        <div class="w-20 h-20 mx-auto rounded-full bg-bark-800 flex items-center justify-center mb-6">
          <svg class="w-10 h-10 text-bark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">No lists yet</h3>
        <p class="text-bark-400 mb-6">Create your first dish or recipe list</p>
        <button @click="openCreateModal" class="btn-primary touch-manipulation">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Your First List
        </button>
      </div>
    </div>

    <Modal :show="showListModal" :title="editingList ? 'Edit List' : 'New List'" @close="closeListModal">
      <div class="space-y-4">
        <div>
          <label class="input-label">List Name</label>
          <input v-model="listForm.name" type="text" class="input-field" placeholder="e.g., Spaghetti, Tacos" />
        </div>
        <div class="flex items-center gap-3">
          <input v-model="listForm.is_regular_items" type="checkbox" id="regular-items" class="checkbox-custom" />
          <label for="regular-items" class="text-sm text-bark-300 cursor-pointer">Regular items list</label>
        </div>
        <div class="divider my-4"></div>
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="input-label mb-0">Ingredients</label>
            <button @click="addIngredient" class="text-sm text-forest-400 hover:text-forest-300 touch-manipulation">+ Add</button>
          </div>
          <div class="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
            <div v-for="(ing, index) in listForm.ingredients" :key="index" class="flex gap-2">
              <input v-model="ing.name" type="text" class="input-field flex-1 text-sm" placeholder="Item name" />
              <input v-model="ing.quantity" type="text" class="input-field w-20 text-sm" placeholder="Qty" />
              <button @click="removeIngredient(index)" class="p-2 text-bark-400 hover:text-red-400 transition-colors touch-manipulation">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="closeListModal" class="btn-secondary">Cancel</button>
        <button @click="saveList" class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Save
        </button>
      </template>
    </Modal>

    <Modal :show="showImportModal" title="Import Lists from Text" @close="closeImportModal" size="lg">
      <div class="space-y-4">
        <p class="text-sm text-bark-300">Paste your recipe or shopping lists below.</p>
        <textarea v-model="importText" class="input-field min-h-48 font-mono text-sm" placeholder="SPAGHETTI:&#10;1 lb ground beef&#10;1 jar marinara sauce&#10;1 lb spaghetti pasta"></textarea>
        <button @click="previewImport" :disabled="!importText.trim() || importing" class="btn-primary w-full touch-manipulation">
          <svg v-if="importing" class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Preview Import
        </button>
        <div v-if="importPreview.length > 0" class="space-y-3">
          <div class="divider"></div>
          <h4 class="font-medium text-white">Preview</h4>
          <div v-for="(list, index) in importPreview" :key="index" class="card">
            <div class="p-4">
              <label class="flex items-center gap-3 cursor-pointer touch-manipulation">
                <input v-model="list.selected" type="checkbox" class="checkbox-custom" />
                <span class="font-medium text-white">{{ list.name }}</span>
              </label>
              <div class="mt-3 ml-8 flex flex-wrap gap-1.5">
                <span v-for="ing in list.ingredients.slice(0, 8)" :key="ing.name" class="chip text-xs">{{ ing.name }} {{ ing.quantity ? `(${ing.quantity})` : '' }}</span>
                <span v-if="list.ingredients.length > 8" class="chip text-xs">+{{ list.ingredients.length - 8 }} more</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="closeImportModal" class="btn-secondary">Cancel</button>
        <button v-if="importPreview.length > 0" @click="confirmImport" :disabled="importPreview.filter(l => l.selected).length === 0" class="btn-primary touch-manipulation">Import Selected</button>
      </template>
    </Modal>

    <Modal :show="showDeleteModal" title="Delete List" @close="showDeleteModal = false">
      <p class="text-bark-300">Are you sure you want to delete "{{ deletingList?.name }}"?</p>
      <template #footer>
        <button @click="showDeleteModal = false" class="btn-secondary">Cancel</button>
        <button @click="deleteList" class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation">Delete</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { useListsStore, type List, type Ingredient } from '~/stores/lists'
import Modal from '~/components/Modal.vue'
import Checkbox from '~/components/Checkbox.vue'

const listsStore = useListsStore()
const toast = useToast()

const showListModal = ref(false)
const showImportModal = ref(false)
const showDeleteModal = ref(false)
const editingList = ref<List | null>(null)
const deletingList = ref<List | null>(null)

const listForm = reactive({ name: '', is_regular_items: false, ingredients: [] as Ingredient[] })
const importText = ref('')
const importing = ref(false)
const importPreview = ref<Array<{ name: string; selected: boolean; ingredients: Ingredient[] }>>([])
const listIngredientsCache = ref<Map<number, Ingredient[]>>(new Map())

onMounted(async () => {
  await listsStore.fetchLists()
  for (const list of listsStore.lists) {
    const fullList = await listsStore.fetchList(list.id)
    if (fullList) listIngredientsCache.value.set(list.id, fullList.ingredients || [])
  }
})

function getPreviewIngredients(listId: number) {
  return listIngredientsCache.value.get(listId)?.slice(0, 5) || []
}

const sortedLists = computed(() => {
  return [...listsStore.lists].sort((a, b) => {
    if (a.is_regular_items === b.is_regular_items) return a.name.localeCompare(b.name)
    return a.is_regular_items ? -1 : 1
  })
})

function openCreateModal() {
  editingList.value = null
  listForm.name = ''
  listForm.is_regular_items = false
  listForm.ingredients = [{ name: '', quantity: '' }]
  showListModal.value = true
}

function openEditModal(list: List) {
  editingList.value = list
  listForm.name = list.name
  listForm.is_regular_items = list.is_regular_items
  listForm.ingredients = listIngredientsCache.value.get(list.id)?.map(i => ({ ...i })) || [{ name: '', quantity: '' }]
  showListModal.value = true
}

function closeListModal() {
  showListModal.value = false
  editingList.value = null
}

function addIngredient() {
  listForm.ingredients.push({ name: '', quantity: '' })
}

function removeIngredient(index: number) {
  listForm.ingredients.splice(index, 1)
}

async function saveList() {
  const ingredients = listForm.ingredients.filter(i => i.name.trim())
  if (!listForm.name.trim()) return
  try {
    if (editingList.value) {
      await listsStore.updateList(editingList.value.id, listForm.name, listForm.is_regular_items, ingredients)
      toast.success('List updated')
    } else {
      await listsStore.createList(listForm.name, listForm.is_regular_items, ingredients)
      toast.success('List created')
    }
    closeListModal()
  } catch (error) {
    toast.error('Failed to save list')
  }
}

function confirmDelete(list: List) {
  deletingList.value = list
  showDeleteModal.value = true
}

async function deleteList() {
  if (!deletingList.value) return
  try {
    await listsStore.deleteList(deletingList.value.id)
    showDeleteModal.value = false
    toast.success('List deleted')
  } catch (error) {
    toast.error('Failed to delete list')
  }
}

function closeImportModal() {
  showImportModal.value = false
  importText.value = ''
  importPreview.value = []
}

async function previewImport() {
  importing.value = true
  try {
    const result = await listsStore.previewImport(importText.value)
    importPreview.value = result.lists.map(list => ({
      name: list.name,
      selected: true,
      ingredients: list.ingredients.map(i => ({ name: i.name, quantity: i.quantity || '' }))
    }))
  } catch (error) {
    toast.error('Failed to parse text')
  } finally {
    importing.value = false
  }
}

async function confirmImport() {
  const selected = importPreview.value.filter(l => l.selected)
  try {
    await listsStore.confirmImport(selected)
    closeImportModal()
    toast.success(`Imported ${selected.length} lists`)
  } catch (error) {
    toast.error('Failed to import lists')
  }
}
</script>
