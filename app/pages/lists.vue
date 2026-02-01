<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex align-center justify-space-between flex-wrap">
        <h1 class="text-h4 font-weight-bold text-primary">
          <v-icon class="mr-2" color="primary">mdi-format-list-bulleted</v-icon>
          Lists
        </h1>
        <div>
          <v-btn color="secondary" class="mr-2" @click="showImportDialog = true" elevation="2">
            <v-icon left>mdi-import</v-icon>
            Import Text
          </v-btn>
          <v-btn color="primary" @click="openCreateDialog" elevation="2">
            <v-icon left>mdi-plus</v-icon>
            New List
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="list in listsStore.lists" :key="list.id" cols="12" sm="6" md="4">
        <v-card hover :to="`/lists/${list.id}`" class="h-100">
          <v-card-title class="d-flex align-center bg-primary text-white">
            <v-icon class="mr-2">mdi-food</v-icon>
            {{ list.name }}
            <v-chip v-if="list.is_regular_items" size="small" class="ml-2" color="white" variant="tonal">
              Regular Items
            </v-chip>
          </v-card-title>
          <v-card-text class="pt-4">
            <div class="d-flex align-center mb-3">
              <v-icon size="small" color="secondary" class="mr-1">mdi-package-variant</v-icon>
              <span class="text-body-2 text-medium-emphasis">
                {{ list.ingredient_count || 0 }} ingredients
              </span>
            </div>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="ing in getPreviewIngredients(list.id)"
                :key="ing.id"
                size="small"
                color="secondary"
                variant="tonal"
                class="mr-1 mb-1"
              >
                {{ ing.name }}
              </v-chip>
              <v-chip
                v-if="(list.ingredient_count || 0) > 5"
                size="small"
                color="grey"
                variant="tonal"
                class="mr-1 mb-1"
              >
                +{{ (list.ingredient_count || 0) - 5 }} more
              </v-chip>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon size="small" variant="text" color="primary" @click.prevent="openEditDialog(list)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" color="error" @click.prevent="confirmDelete(list)">
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
      class="mt-8"
    >
      <template v-slot:actions>
        <v-btn color="primary" size="large" @click="openCreateDialog" elevation="2">
          <v-icon left>mdi-plus</v-icon>
          Create List
        </v-btn>
      </template>
    </v-empty-state>

    <v-dialog v-model="showListDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">{{ editingList ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingList ? 'Edit List' : 'New List' }}
        </v-card-title>
        <v-card-text class="pt-4">
          <v-text-field
            v-model="listForm.name"
            label="List name"
            :rules="[v => !!v || 'Name is required']"
            color="primary"
            class="mb-4"
          ></v-text-field>
          <v-checkbox
            v-model="listForm.is_regular_items"
            label="Regular items list"
            hint="This list will appear at the top when creating grocery lists"
            persistent-hint
            color="primary"
          ></v-checkbox>
          <v-divider class="my-4"></v-divider>
          <div class="d-flex align-center mb-2">
            <v-icon color="secondary" class="mr-2">mdi-food</v-icon>
            <h4 class="text-h6">Ingredients</h4>
          </div>
          <v-row v-for="(ing, index) in listForm.ingredients" :key="index" align="center" class="mb-2">
            <v-col cols="5">
              <v-text-field
                v-model="ing.name"
                label="Item"
                density="compact"
                hide-details
                color="primary"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="ing.quantity"
                label="Qty"
                density="compact"
                hide-details
                color="primary"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-btn icon size="small" color="error" variant="text" @click="removeIngredient(index)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-btn variant="text" color="primary" @click="addIngredient" class="mt-2">
            <v-icon left>mdi-plus</v-icon>
            Add Ingredient
          </v-btn>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn @click="showListDialog = false" variant="text">Cancel</v-btn>
          <v-btn color="primary" @click="saveList" elevation="2">
            <v-icon left>mdi-check</v-icon>
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showImportDialog" max-width="700">
      <v-card>
        <v-card-title class="bg-secondary text-white">
          <v-icon class="mr-2">mdi-import</v-icon>
          Import Lists from Text
        </v-card-title>
        <v-card-text class="pt-4">
          <v-textarea
            v-model="importText"
            label="Paste your lists here"
            rows="8"
            placeholder="SPAGHETTI:&#10;1 lb ground beef&#10;1 jar marinara sauce&#10;&#10;TACOS:&#10;1 lb ground beef&#10;Taco shells"
            color="primary"
          ></v-textarea>
          <v-btn
            color="primary"
            block
            size="large"
            :loading="importing"
            :disabled="!importText.trim()"
            @click="previewImport"
            class="mt-4"
            elevation="2"
          >
            <v-icon left>mdi-eye</v-icon>
            Preview Import
          </v-btn>
          <v-expand-transition>
            <div v-if="importPreview.length > 0" class="mt-4">
              <v-divider class="mb-4"></v-divider>
              <h4 class="text-h6 mb-3">
                <v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>
                Preview
              </h4>
              <v-card
                v-for="(list, index) in importPreview"
                :key="index"
                variant="outlined"
                class="mb-3"
              >
                <v-card-text>
                  <v-checkbox
                    v-model="list.selected"
                    :label="list.name"
                    hide-details
                    color="primary"
                  ></v-checkbox>
                  <div class="ml-8 mt-2">
                    <v-chip
                      v-for="ing in list.ingredients.slice(0, 10)"
                      :key="ing.name"
                      size="small"
                      color="secondary"
                      variant="tonal"
                      class="mr-1 mb-1"
                    >
                      {{ ing.name }} {{ ing.quantity ? `(${ing.quantity})` : '' }}
                    </v-chip>
                    <v-chip
                      v-if="list.ingredients.length > 10"
                      size="small"
                      color="grey"
                      variant="tonal"
                    >
                      +{{ list.ingredients.length - 10 }} more
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-expand-transition>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn @click="showImportDialog = false" variant="text">Cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="importPreview.filter(l => l.selected).length === 0"
            @click="confirmImport"
            elevation="2"
          >
            <v-icon left>mdi-check</v-icon>
            Import Selected
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Delete List
        </v-card-title>
        <v-card-text class="pt-4">
          Are you sure you want to delete "{{ deletingList?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteList" elevation="2">
            <v-icon left>mdi-delete</v-icon>
            Delete
          </v-btn>
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
      snackbar.message = 'List updated successfully'
      snackbar.color = 'success'
    } else {
      await listsStore.createList(listForm.name, listForm.is_regular_items, ingredients)
      snackbar.show = true
      snackbar.message = 'List created successfully'
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
