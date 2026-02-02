<template>
  <div v-if="groceryStore.currentList" class="max-w-5xl mx-auto space-y-4 lg:space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink to="/grocery" class="p-2 rounded-lg text-bark-400 hover:text-white hover:bg-bark-800 transition-colors touch-manipulation">
          <svg class="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <div>
          <h1 class="text-xl lg:text-2xl font-bold text-white">{{ groceryStore.currentList.name }}</h1>
          <p class="text-sm text-bark-400">{{ groceryStore.currentList.week_of }}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button @click="showAddItemModal = true" class="btn-secondary flex-1 sm:flex-none touch-manipulation">
          <svg class="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="sm:hidden">Add</span>
          <span class="hidden sm:inline">Add Item</span>
        </button>
        <button @click="showAddSourceModal = true" class="btn-secondary flex-1 sm:flex-none touch-manipulation">
          <svg class="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span class="sm:hidden">Add List</span>
          <span class="hidden sm:inline">Add List</span>
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-bark-300">Progress</span>
          <span class="text-sm font-semibold text-forest-400">{{ checkedCount }} / {{ totalCount }}</span>
        </div>
        <div class="h-3 bg-bark-800 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-forest-600 to-moss-500 transition-all duration-500" :style="{ width: `${progress}%` }"></div>
        </div>
        <p v-if="progress === 100" class="text-center text-forest-400 font-medium mt-3">All items checked! Great job!</p>
      </div>
    </div>

    <div class="space-y-4">
      <div v-for="section in localSections" :key="section.id" class="card overflow-hidden">
        <div class="section-header px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-forest-600/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="font-semibold text-white">{{ section.name }}</h3>
              <span class="badge">{{ section.items.length }}</span>
            </div>
          </div>
        </div>
        <draggable 
          v-model="section.items" 
          group="grocery-items" 
          item-key="id"
          class="divide-y divide-bark-800"
          ghost-class="opacity-50"
          drag-class="opacity-100"
          @end="onDragEnd(section)"
        >
          <template #item="{ element: item }">
            <div :class="['flex items-center gap-2 lg:gap-4 px-3 lg:px-4 py-3 lg:py-4 transition-all duration-200 touch-manipulation', item.is_checked ? 'bg-bark-900/30' : 'hover:bg-bark-800/30']">
              <div class="flex-shrink-0 cursor-grab">
                <svg class="w-4 h-4 text-bark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <div class="flex-shrink-0">
                <Checkbox v-model="item.is_checked" @change="toggleItem(item)" />
              </div>
              <span :class="['flex-1 min-w-0 text-base lg:text-lg', item.is_checked ? 'text-bark-500 line-through' : 'text-white']">
                {{ item.ingredient_name }}
              </span>
              <select :value="item.section_id || 0" @change="changeItemSection(item, Number($event.target.value))" class="bg-bark-800 border border-bark-700 text-white text-xs lg:text-sm rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 focus:outline-none focus:ring-1 focus:ring-forest-500 w-24 lg:w-32 flex-shrink-0">
                <option v-for="s in allSections" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
              <button @click="removeItem(item)" class="p-2 rounded-lg text-bark-500 hover:text-red-400 hover:bg-red-900/20 transition-colors flex-shrink-0 touch-manipulation">
                <svg class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </template>
        </draggable>
        <div v-if="section.items.length === 0" class="px-4 py-6 lg:py-8 text-center text-bark-500 text-sm">No items in this section</div>
      </div>
    </div>

    <Modal :show="showAddItemModal" title="Add Item" @close="showAddItemModal = false">
      <input v-model="newItemName" type="text" class="input-field" placeholder="Enter item name" @keyup.enter="addItem" />
      <template #footer>
        <button @click="showAddItemModal = false" class="btn-secondary">Cancel</button>
        <button @click="addItem" class="btn-primary">Add</button>
      </template>
    </Modal>

    <Modal :show="showAddSourceModal" title="Add Source List" @close="showAddSourceModal = false">
      <select v-model="selectedSourceList" class="input-field">
        <option value="">Select a list</option>
        <option v-for="list in availableLists" :key="list.id" :value="list.id">{{ list.name }} ({{ list.ingredient_count || 0 }} items)</option>
      </select>
      <template #footer>
        <button @click="showAddSourceModal = false" class="btn-secondary">Cancel</button>
        <button @click="addSource" :disabled="!selectedSourceList" class="btn-primary">Add</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { useGroceryStore, type GroceryItem } from '~/stores/grocery'
import { useListsStore } from '~/stores/lists'
import { useSectionsStore } from '~/stores/sections'
import Modal from '~/components/Modal.vue'
import Checkbox from '~/components/Checkbox.vue'

const route = useRoute()
const groceryStore = useGroceryStore()
const listsStore = useListsStore()
const sectionsStore = useSectionsStore()
const toast = useToast()

const showAddItemModal = ref(false)
const showAddSourceModal = ref(false)
const newItemName = ref('')
const selectedSourceList = ref<string | number>('')

const localSections = ref<Array<{ id: number; name: string; items: GroceryItem[] }>>([])

const totalCount = computed(() => groceryStore.currentList?.sections?.reduce((sum, s) => sum + s.items.length, 0) || 0)
const checkedCount = computed(() => groceryStore.currentList?.sections?.reduce((sum, s) => sum + s.items.filter(i => i.is_checked).length, 0) || 0)
const progress = computed(() => totalCount.value === 0 ? 0 : (checkedCount.value / totalCount.value) * 100)

const availableLists = computed(() => {
  const currentSourceIds = groceryStore.currentList?.sources?.map(s => s.id) || []
  return listsStore.lists.filter(l => !currentSourceIds.includes(l.id))
})

const allSections = computed(() => sectionsStore.sections)

async function onDragEnd(section: { id: number; items: GroceryItem[] }) {
  if (!groceryStore.currentList) return
  for (const item of section.items) {
    if (item.section_id !== section.id) {
      await groceryStore.updateItem(groceryStore.currentList.id, item.id, { section_id: section.id, is_manual_override: true })
    }
  }
  toast.success('Items reordered')
}

onMounted(async () => {
  const id = Number(route.params.id)
  await Promise.all([groceryStore.fetchList(id), listsStore.fetchLists(), sectionsStore.fetchSections()])
  syncLocalSections()
})

watch(() => groceryStore.currentList, () => {
  syncLocalSections()
})

function syncLocalSections() {
  if (groceryStore.currentList?.sections) {
    localSections.value = groceryStore.currentList.sections.map(s => ({
      ...s,
      items: [...s.items]
    }))
  }
}

async function onItemDrop(evt: any, targetSectionId: number) {
  if (!groceryStore.currentList) return
  const item = evt.item.__draggable_context?.element
  if (!item) return
  await groceryStore.updateItem(groceryStore.currentList.id, item.id, { section_id: targetSectionId, is_manual_override: true })
  toast.success('Section updated')
}

async function toggleItem(item: GroceryItem) {
  if (groceryStore.currentList) await groceryStore.toggleChecked(groceryStore.currentList.id, item.id, item.is_checked)
}

async function addItem() {
  if (!newItemName.value.trim() || !groceryStore.currentList) return
  await groceryStore.addItem(groceryStore.currentList.id, newItemName.value.trim())
  newItemName.value = ''
  showAddItemModal.value = false
  toast.success('Item added')
}

async function addSource() {
  if (!selectedSourceList.value || !groceryStore.currentList) return
  await groceryStore.addSource(groceryStore.currentList.id, selectedSourceList.value as number)
  selectedSourceList.value = ''
  showAddSourceModal.value = false
  toast.success('List added')
}

async function removeItem(item: GroceryItem) {
  if (groceryStore.currentList) {
    await groceryStore.deleteItem(groceryStore.currentList.id, item.id)
    toast.success('Item removed')
  }
}

async function changeItemSection(item: GroceryItem, newSectionId: number) {
  if (!groceryStore.currentList || item.section_id === newSectionId) return
  await groceryStore.updateItem(groceryStore.currentList.id, item.id, { section_id: newSectionId, is_manual_override: true })
  toast.success('Section updated')
}

function sortedSectionItems(items: GroceryItem[]) {
  return [...items].sort((a, b) => {
    if (a.is_checked === b.is_checked) return 0
    return a.is_checked ? 1 : -1
  })
}
</script>
