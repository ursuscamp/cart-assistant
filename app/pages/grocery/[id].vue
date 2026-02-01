<template>
  <div v-if="groceryStore.currentList" class="max-w-5xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/grocery" class="p-2 rounded-lg text-bark-400 hover:text-white hover:bg-bark-800 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold text-white">{{ groceryStore.currentList.name }}</h1>
          <p class="text-sm text-bark-400">{{ groceryStore.currentList.week_of }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button @click="showAddItemModal = true" class="btn-secondary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Item
        </button>
        <button @click="showAddSourceModal = true" class="btn-secondary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Add List
        </button>
      </div>
    </div>

    <!-- Progress -->
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-bark-300">Shopping Progress</span>
          <span class="text-sm font-semibold text-forest-400">{{ checkedCount }} / {{ totalCount }} items</span>
        </div>
        <div class="h-3 bg-bark-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-forest-600 to-moss-500 transition-all duration-500"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <p v-if="progress === 100" class="text-center text-forest-400 font-medium mt-3">
          All items checked! Great job!
        </p>
      </div>
    </div>

    <!-- Sections -->
    <div class="space-y-4">
      <div
        v-for="(section, index) in sortedSections"
        :key="section.id"
        class="card overflow-hidden cursor-move"
        :class="{ 'ring-2 ring-forest-500': draggedSectionIndex === section.originalIndex }"
        draggable="true"
        @dragstart="onDragStart(section.originalIndex, $event)"
        @dragover.prevent="onDragOver(section.originalIndex, $event)"
        @drop="onDrop(section.originalIndex, $event)"
        @dragend="onDragEnd"
      >
        <div class="section-header">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-forest-600/20 flex items-center justify-center">
              <svg class="w-4 h-4 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="font-semibold text-white">{{ section.name }}</h3>
            <span class="badge">{{ section.items.length }}</span>
          </div>
        </div>
        <div v-if="section.items.length > 0" class="divide-y divide-bark-800">
          <template v-for="item in sortedSectionItems(section.items)" :key="item.id">
            <label
              :class="[
                'flex items-center gap-4 px-4 py-3 transition-all duration-200',
                item.is_checked ? 'bg-bark-900/30' : 'hover:bg-bark-800/30'
              ]"
            >
              <Checkbox v-model="item.is_checked" @change="toggleItem(item)" />
              <span :class="[
                'flex-1 transition-all',
                item.is_checked ? 'text-bark-500 line-through' : 'text-white'
              ]">
                {{ item.ingredient_name }}
              </span>
              <button
                @click="removeItem(item)"
                class="p-1.5 rounded-lg text-bark-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </label>
          </template>
        </div>
        <div v-else class="px-4 py-8 text-center text-bark-500">
          No items in this section
        </div>
      </div>

      <!-- Uncategorized -->
      <div v-if="groceryStore.currentList.uncategorized?.length" class="card overflow-hidden">
        <div class="section-header">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-yellow-600/20 flex items-center justify-center">
              <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="font-semibold text-white">Uncategorized</h3>
            <span class="badge bg-yellow-600">{{ groceryStore.currentList.uncategorized.length }}</span>
          </div>
        </div>
        <div class="divide-y divide-bark-800">
          <label
            v-for="item in groceryStore.currentList.uncategorized"
            :key="item.id"
            :class="[
              'flex items-center gap-4 px-4 py-3 transition-all duration-200',
              item.is_checked ? 'bg-bark-900/30' : 'hover:bg-bark-800/30'
            ]"
          >
            <Checkbox v-model="item.is_checked" @change="toggleItem(item)" />
            <span :class="[
              'flex-1 transition-all',
              item.is_checked ? 'text-bark-500 line-through' : 'text-white'
            ]">
              {{ item.ingredient_name }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <Modal :show="showAddItemModal" title="Add Item" @close="showAddItemModal = false">
      <input
        v-model="newItemName"
        type="text"
        class="input-field"
        placeholder="Enter item name"
        @keyup.enter="addItem"
      />
      <template #footer>
        <button @click="showAddItemModal = false" class="btn-secondary">Cancel</button>
        <button @click="addItem" class="btn-primary">Add</button>
      </template>
    </Modal>

    <!-- Add Source Modal -->
    <Modal :show="showAddSourceModal" title="Add Source List" @close="showAddSourceModal = false">
      <select v-model="selectedSourceList" class="input-field">
        <option value="">Select a list</option>
        <option
          v-for="list in availableLists"
          :key="list.id"
          :value="list.id"
        >
          {{ list.name }} ({{ list.ingredient_count || 0 }} items)
        </option>
      </select>
      <template #footer>
        <button @click="showAddSourceModal = false" class="btn-secondary">Cancel</button>
        <button
          @click="addSource"
          :disabled="!selectedSourceList"
          class="btn-primary"
        >
          Add
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { useGroceryStore, type GroceryItem } from '~/stores/grocery'
import { useListsStore } from '~/stores/lists'
import Modal from '~/components/Modal.vue'
import Checkbox from '~/components/Checkbox.vue'

const route = useRoute()
const groceryStore = useGroceryStore()
const listsStore = useListsStore()
const toast = useToast()

const showAddItemModal = ref(false)
const showAddSourceModal = ref(false)
const newItemName = ref('')
const selectedSourceList = ref<string | number>('')
const draggedSectionIndex = ref<number | null>(null)
const draggedSectionOrder = ref<number[]>([])

const totalCount = computed(() => {
  return groceryStore.currentList?.sections?.reduce((sum, s) => sum + s.items.length, 0) || 0
})

const checkedCount = computed(() => {
  return groceryStore.currentList?.sections?.reduce((sum, s) =>
    sum + s.items.filter(i => i.is_checked).length, 0) || 0
})

const progress = computed(() => {
  if (totalCount.value === 0) return 0
  return (checkedCount.value / totalCount.value) * 100
})

const availableLists = computed(() => {
  const currentSourceIds = groceryStore.currentList?.sources?.map(s => s.id) || []
  return listsStore.lists.filter(l => !currentSourceIds.includes(l.id))
})

const sortedSections = computed(() => {
  if (!groceryStore.currentList?.sections) return []
  
  const sections = groceryStore.currentList.sections.map((s, i) => ({ ...s, originalIndex: i }))
  const uncompleted = sections.filter(s => s.items.some(i => !i.is_checked))
  const completed = sections.filter(s => s.items.length > 0 && s.items.every(i => i.is_checked))
  
  return [...uncompleted, ...completed]
})

onMounted(async () => {
  const id = Number(route.params.id)
  await Promise.all([
    groceryStore.fetchList(id),
    listsStore.fetchLists()
  ])
})

async function toggleItem(item: GroceryItem) {
  if (groceryStore.currentList) {
    await groceryStore.toggleChecked(groceryStore.currentList.id, item.id, item.is_checked)
  }
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
    await groceryStore.updateItem(groceryStore.currentList.id, item.id, { is_checked: item.is_checked } as any)
  }
}

function sortedSectionItems(items: GroceryItem[]) {
  return [...items].sort((a, b) => {
    if (a.is_checked === b.is_checked) return 0
    return a.is_checked ? 1 : -1
  })
}

function onDragStart(index: number, event: DragEvent) {
  draggedSectionIndex.value = index
  draggedSectionOrder.value = groceryStore.currentList!.sections.map(s => s.id)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

function onDragOver(index: number, event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

async function onDrop(targetIndex: number, event: DragEvent) {
  event.preventDefault()
  if (draggedSectionIndex.value === null || draggedSectionIndex.value === targetIndex) {
    onDragEnd()
    return
  }

  const sections = [...groceryStore.currentList!.sections]
  const [movedSection] = sections.splice(draggedSectionIndex.value, 1)
  sections.splice(targetIndex, 0, movedSection)
  
  const order = sections.map(s => s.id)
  await groceryStore.reorderSections(groceryStore.currentList!.id, order)
  
  onDragEnd()
}

function onDragEnd() {
  draggedSectionIndex.value = null
  draggedSectionOrder.value = []
}
</script>
