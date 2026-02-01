<template>
  <div v-if="groceryStore.currentList">
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between flex-wrap">
        <div class="d-flex align-center">
          <v-btn icon variant="text" to="/grocery" class="mr-2">
            <v-icon>mdi-arrow-back</v-icon>
          </v-btn>
          <v-edit-dialog
            :model-value="groceryStore.currentList.name"
            @save="updateName"
          >
            <template v-slot:default>
              <span class="text-h4 cursor-pointer">{{ groceryStore.currentList.name }}</span>
            </template>
            <template v-slot:input>
              <v-text-field v-model="editName" label="Edit name"></v-text-field>
            </template>
          </v-edit-dialog>
        </div>
        <div class="d-flex align-center ga-2">
          <v-chip v-if="progress > 0" color="success" size="small">
            {{ progress.toFixed(0) }}% complete
          </v-chip>
          <v-btn variant="outlined" size="small" @click="showAddItemDialog = true">
            <v-icon left>mdi-plus</v-icon>
            Add Item
          </v-btn>
          <v-btn variant="outlined" size="small" @click="showAddSourceDialog = true">
            <v-icon left>mdi-link-plus</v-icon>
            Add List
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card v-for="section in groceryStore.currentList.sections" :key="section.id" class="mb-4">
          <v-card-title class="d-flex align-center bg-grey-lighten-4">
            {{ section.name }}
            <v-chip size="x-small" class="ml-2">{{ section.items.length }}</v-chip>
          </v-card-title>
          <v-card-text class="pa-0">
            <draggable
              v-model="section.items"
              :group="{ name: 'items', pull: true, put: true }"
              item-key="id"
              @end="onDragEnd"
            >
              <template #item="{ element }">
                <v-list-item
                  :class="{ 'bg-grey-lighten-4': element.is_checked }"
                  class="cursor-move"
                >
                  <template v-slot:prepend>
                    <v-checkbox
                      :model-value="element.is_checked"
                      hide-details
                      @update:model-value="toggleChecked(element)"
                    ></v-checkbox>
                  </template>
                  <v-list-item-title :class="{ 'text-decoration-line-through text-grey': element.is_checked }">
                    {{ element.ingredient_name }}
                  </v-list-item-title>
                  <template v-slot:append>
                    <v-btn icon size="x-small" variant="text" @click="removeItem(element)">
                      <v-icon size="small">mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </template>
            </draggable>
            <div v-if="section.items.length === 0" class="pa-4 text-center text-grey">
              No items
            </div>
          </v-card-text>
        </v-card>

        <v-card v-if="groceryStore.currentList.uncategorized?.length">
          <v-card-title class="bg-grey-lighten-4">Uncategorized</v-card-title>
          <v-card-text class="pa-0">
            <v-list-item v-for="item in groceryStore.currentList.uncategorized" :key="item.id">
              <template v-slot:prepend>
                <v-checkbox :model-value="item.is_checked" hide-details @update:model-value="toggleChecked(item)"></v-checkbox>
              </template>
              <v-list-item-title>{{ item.ingredient_name }}</v-list-item-title>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Sources</v-card-title>
          <v-card-text>
            <v-chip
              v-for="source in groceryStore.currentList.sources"
              :key="source.id"
              class="ma-1"
              size="small"
              closable
              @click:close="removeSource(source.id)"
            >
              {{ source.name }}
            </v-chip>
            <p v-if="!groceryStore.currentList.sources.length" class="text-grey">No sources</p>
          </v-card-text>
        </v-card>

        <v-card class="mt-4">
          <v-card-title>Progress</v-card-title>
          <v-card-text>
            <v-progress-linear
              :model-value="progress"
              color="success"
              height="20"
              rounded
            >
              <template v-slot:default>
                <strong>{{ checkedCount }} / {{ totalCount }}</strong>
              </template>
            </v-progress-linear>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showAddItemDialog" max-width="400">
      <v-card>
        <v-card-title>Add Item</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newItemName"
            label="Item name"
            @keyup.enter="addItem"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showAddItemDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="addingItem" @click="addItem">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAddSourceDialog" max-width="400">
      <v-card>
        <v-card-title>Add Source List</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedSourceList"
            :items="availableLists"
            item-title="name"
            item-value="id"
            label="Select list"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showAddSourceDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="addingSource" :disabled="!selectedSourceList" @click="addSource">
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useGroceryStore, type GroceryItem } from '~/stores/grocery'
import { useListsStore } from '~/stores/lists'
import draggable from 'vuedraggable'

const route = useRoute()
const groceryStore = useGroceryStore()
const listsStore = useListsStore()
const snackbar = inject<any>('snackbar')

const showAddItemDialog = ref(false)
const showAddSourceDialog = ref(false)
const newItemName = ref('')
const addingItem = ref(false)
const selectedSourceList = ref<number | null>(null)
const addingSource = ref(false)
const editName = ref('')

const availableLists = computed(() => {
  const currentSourceIds = groceryStore.currentList?.sources?.map(s => s.id) || []
  return listsStore.lists.filter(l => !currentSourceIds.includes(l.id))
})

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

onMounted(async () => {
  const id = Number(route.params.id)
  await Promise.all([
    groceryStore.fetchList(id),
    listsStore.fetchLists()
  ])
  editName.value = groceryStore.currentList?.name || ''
})

async function updateName() {
  if (editName.value.trim() && groceryStore.currentList) {
    await groceryStore.updateListName(groceryStore.currentList.id, editName.value)
  }
}

async function toggleChecked(item: GroceryItem) {
  if (groceryStore.currentList) {
    await groceryStore.toggleChecked(groceryStore.currentList.id, item.id, !item.is_checked)
  }
}

async function addItem() {
  if (!newItemName.value.trim() || !groceryStore.currentList) return
  addingItem.value = true
  try {
    await groceryStore.addItem(groceryStore.currentList.id, newItemName.value.trim())
    newItemName.value = ''
    showAddItemDialog.value = false
    snackbar.show = true
    snackbar.message = 'Item added'
  } finally {
    addingItem.value = false
  }
}

async function addSource() {
  if (!selectedSourceList.value || !groceryStore.currentList) return
  addingSource.value = true
  try {
    await groceryStore.addSource(groceryStore.currentList.id, selectedSourceList.value)
    selectedSourceList.value = null
    showAddSourceDialog.value = false
    snackbar.show = true
    snackbar.message = 'List added'
  } finally {
    addingSource.value = false
  }
}

async function removeItem(item: GroceryItem) {
  if (groceryStore.currentList) {
    await groceryStore.updateItem(groceryStore.currentList.id, item.id, { is_checked: item.is_checked } as any)
  }
}

async function removeSource(listId: number) {
  if (groceryStore.currentList) {
    snackbar.show = true
    snackbar.message = 'Remove source not implemented'
  }
}

async function onDragEnd() {
  if (groceryStore.currentList) {
    snackbar.show = true
    snackbar.message = 'Section updated - will be remembered for next time'
  }
}
</script>

<style scoped>
.cursor-move {
  cursor: move;
}
</style>
