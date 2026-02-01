<template>
  <div v-if="list">
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <div>
          <v-btn icon variant="text" to="/lists" class="mr-2">
            <v-icon>mdi-arrow-back</v-icon>
          </v-btn>
          <span class="text-h4">{{ list.name }}</span>
          <v-chip v-if="list.is_regular_items" size="small" color="info" class="ml-2">
            Regular Items
          </v-chip>
        </div>
        <div>
          <v-btn icon variant="text" color="primary" @click="openEditDialog">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" color="error" @click="confirmDelete">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Ingredients ({{ list.ingredients?.length || 0 }})</v-card-title>
          <v-card-text>
            <v-list v-if="list.ingredients && list.ingredients.length > 0">
              <v-list-item v-for="ing in list.ingredients" :key="ing.id">
                <template v-slot:prepend>
                  <v-icon v-if="ing.quantity">mdi-circle-small</v-icon>
                </template>
                <v-list-item-title>{{ ing.name }}</v-list-item-title>
                <v-list-item-subtitle v-if="ing.quantity">{{ ing.quantity }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else class="text-center text-grey py-4">No ingredients yet</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showDialog" max-width="600">
      <v-card>
        <v-card-title>Edit List</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="List name"></v-text-field>
          <v-checkbox v-model="form.is_regular_items" label="Regular items list"></v-checkbox>
          <v-divider class="my-4"></v-divider>
          <h4 class="mb-2">Ingredients</h4>
          <v-row v-for="(ing, index) in form.ingredients" :key="index" align="center">
            <v-col cols="5">
              <v-text-field v-model="ing.name" label="Item" density="compact" hide-details></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="ing.quantity" label="Qty" density="compact" hide-details></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-btn icon size="small" color="error" @click="removeIngredient(index)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-btn variant="text" color="primary" @click="addIngredient">
            <v-icon left>mdi-plus</v-icon>Add Ingredient
          </v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveList">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete List</v-card-title>
        <v-card-text>Are you sure you want to delete "{{ list.name }}"?</v-card-text>
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

const route = useRoute()
const router = useRouter()
const listsStore = useListsStore()
const snackbar = inject<any>('snackbar')

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
  snackbar.show = true
  snackbar.message = 'List updated'
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
