<template>
  <div>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <h1 class="text-h4">Lists</h1>
        <div>
          <v-btn color="secondary" class="mr-2" @click="showImportDialog = true">
            <v-icon left>mdi-import</v-icon>
            Import Text
          </v-btn>
          <v-btn color="primary" @click="openCreateDialog">
            <v-icon left>mdi-plus</v-icon>
            New List
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="list in listsStore.lists" :key="list.id" cols="12" sm="6" md="4">
        <v-card :to="`/lists/${list.id}`" hover>
          <v-card-title class="d-flex align-center">
            {{ list.name }}
            <v-chip v-if="list.is_regular_items" size="small" color="info" class="ml-2">
              Regular Items
            </v-chip>
          </v-card-title>
          <v-card-subtitle>
            {{ list.ingredient_count || 0 }} ingredients
          </v-card-subtitle>
          <v-card-text>
            <v-chip
              v-for="ing in getPreviewIngredients(list.id)"
              :key="ing.id"
              size="small"
              class="mr-1 mb-1"
            >
              {{ ing.name }}
            </v-chip>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon size="small" @click.prevent="openEditDialog(list)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" color="error" @click.prevent="confirmDelete(list)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-empty-state
      v-if="listsStore.lists.length === 0 && !listsStore.loading"
      icon="mdi-format-list-bulleted"
      title="No lists yet"
      text="Create your first dish or recipe list"
    >
      <template v-slot:actions>
        <v-btn color="primary" @click="openCreateDialog">Create List</v-btn>
      </template>
    </v-empty-state>

    <v-dialog v-model="showListDialog" max-width="600">
      <v-card>
        <v-card-title>{{ editingList ? 'Edit List' : 'New List' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="listForm.name"
            label="List name"
            :rules="[v => !!v || 'Name is required']"
          ></v-text-field>
          <v-checkbox
            v-model="listForm.is_regular_items"
            label="Regular items list"
            hint="This list will appear at the top when creating grocery lists"
            persistent-hint
          ></v-checkbox>
          <v-divider class="my-4"></v-divider>
          <h4 class="mb-2">Ingredients</h4>
          <v-row v-for="(ing, index) in listForm.ingredients" :key="index" align="center">
            <v-col cols="5">
              <v-text-field
                v-model="ing.name"
                label="Item"
                density="compact"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="ing.quantity"
                label="Qty"
                density="compact"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-btn icon size="small" color="error" @click="removeIngredient(index)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-btn variant="text" color="primary" @click="addIngredient">
            <v-icon left>mdi-plus</v-icon>
            Add Ingredient
          </v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showListDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveList">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showImportDialog" max-width="700">
      <v-card>
        <v-card-title>Import Lists from Text</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="importText"
            label="Paste your lists here"
            rows="8"
            placeholder="SPAGHETTI:&#10;1 lb ground beef&#10;1 jar marinara sauce&#10;&#10;TACOS:&#10;1 lb ground beef&#10;Taco shells"
          ></v-textarea>
          <v-btn
            color="primary"
            :loading="importing"
            :disabled="!importText.trim()"
            @click="previewImport"
          >
            Preview Import
          </v-btn>
          <v-expand-transition>
            <div v-if="importPreview.length > 0" class="mt-4">
              <h4 class="mb-2">Preview</h4>
              <v-card
                v-for="(list, index) in importPreview"
                :key="index"
                variant="outlined"
                class="mb-2"
              >
                <v-card-text>
                  <v-checkbox
                    v-model="list.selected"
                    :label="list.name"
                    hide-details
                  ></v-checkbox>
                  <div class="ml-8 text-caption">
                    {{ list.ingredients.map(i => i.name).join(', ') }}
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-expand-transition>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showImportDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="importPreview.filter(l => l.selected).length === 0"
            @click="confirmImport"
          >
            Import Selected
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete List</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ deletingList?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteList">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useListsStore, type List, type Ingredient } from '~/stores/lists'

const listsStore = useListsStore()
const snackbar = inject<any>('snackbar')

const showListDialog = ref(false)
const showImportDialog = ref(false)
const showDeleteDialog = ref(false)
const editingList = ref<List | null>(null)
const deletingList = ref<List | null>(null)

const listForm = reactive({
  name: '',
  is_regular_items: false,
  ingredients: [] as Ingredient[]
})

const importText = ref('')
const importing = ref(false)
const importPreview = ref<Array<{ name: string; selected: boolean; ingredients: Ingredient[] }>>([])

const listIngredientsCache = ref<Map<number, Ingredient[]>>(new Map())

onMounted(async () => {
  await listsStore.fetchLists()
  for (const list of listsStore.lists) {
    const fullList = await listsStore.fetchList(list.id)
    if (fullList) {
      listIngredientsCache.value.set(list.id, fullList.ingredients || [])
    }
  }
})

function getPreviewIngredients(listId: number) {
  return listIngredientsCache.value.get(listId)?.slice(0, 5) || []
}

function openCreateDialog() {
  editingList.value = null
  listForm.name = ''
  listForm.is_regular_items = false
  listForm.ingredients = [{ name: '', quantity: '' }]
  showListDialog.value = true
}

function openEditDialog(list: List) {
  editingList.value = list
  listForm.name = list.name
  listForm.is_regular_items = list.is_regular_items
  listForm.ingredients = listIngredientsCache.value.get(list.id)?.map(i => ({ ...i })) || [{ name: '', quantity: '' }]
  showListDialog.value = true
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
      snackbar.show = true
      snackbar.message = 'List updated'
      snackbar.color = 'success'
    } else {
      await listsStore.createList(listForm.name, listForm.is_regular_items, ingredients)
      snackbar.show = true
      snackbar.message = 'List created'
      snackbar.color = 'success'
    }
    showListDialog.value = false
  } catch (error) {
    snackbar.show = true
    snackbar.message = 'Failed to save list'
    snackbar.color = 'error'
  }
}

function confirmDelete(list: List) {
  deletingList.value = list
  showDeleteDialog.value = true
}

async function deleteList() {
  if (!deletingList.value) return
  try {
    await listsStore.deleteList(deletingList.value.id)
    showDeleteDialog.value = false
    snackbar.show = true
    snackbar.message = 'List deleted'
    snackbar.color = 'success'
  } catch (error) {
    snackbar.show = true
    snackbar.message = 'Failed to delete list'
    snackbar.color = 'error'
  }
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
    snackbar.show = true
    snackbar.message = 'Failed to parse text'
    snackbar.color = 'error'
  } finally {
    importing.value = false
  }
}

async function confirmImport() {
  const selected = importPreview.value.filter(l => l.selected)
  try {
    await listsStore.confirmImport(selected)
    showImportDialog.value = false
    importText.value = ''
    importPreview.value = []
    snackbar.show = true
    snackbar.message = `Imported ${selected.length} lists`
    snackbar.color = 'success'
  } catch (error) {
    snackbar.show = true
    snackbar.message = 'Failed to import lists'
    snackbar.color = 'error'
  }
}
</script>
