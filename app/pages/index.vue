<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Dashboard</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Quick Create Grocery List</v-card-title>
          <v-card-text>
            <p class="mb-4">Select lists to combine into your grocery list:</p>
            <v-list density="compact">
              <v-list-item
                v-for="list in listsStore.lists"
                :key="list.id"
                :value="list.id"
              >
                <template v-slot:prepend>
                  <v-checkbox-btn v-model="selectedLists" :value="list.id"></v-checkbox-btn>
                </template>
                <v-list-item-title>{{ list.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ list.ingredient_count || 0 }} items</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-text-field
              v-model="listName"
              label="List name (optional)"
              placeholder="Week of Feb 1"
              class="mt-4"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="selectedLists.length === 0"
              @click="createGroceryList"
            >
              Create Grocery List
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Recent Grocery Lists</v-card-title>
          <v-card-text>
            <v-list v-if="groceryStore.lists.length > 0" density="compact">
              <v-list-item
                v-for="list in groceryStore.lists.slice(0, 5)"
                :key="list.id"
                :to="`/grocery/${list.id}`"
              >
                <v-list-item-title>{{ list.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ list.item_count || 0 }} items
                  <span v-if="list.checked_count"> · {{ list.checked_count }} checked</span>
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-icon>mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="text-center text-grey py-4">No grocery lists yet</p>
          </v-card-text>
        </v-card>

        <v-card class="mt-4">
          <v-card-title>Quick Links</v-card-title>
          <v-card-text>
            <v-btn block color="secondary" class="mb-2" to="/lists">
              <v-icon left>mdi-format-list-bulleted</v-icon>
              Manage Lists
            </v-btn>
            <v-btn block color="secondary" class="mb-2" to="/grocery">
              <v-icon left>mdi-cart</v-icon>
              View All Grocery Lists
            </v-btn>
            <v-btn block color="secondary" to="/settings">
              <v-icon left>mdi-cog</v-icon>
              Settings
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useListsStore } from '~/stores/lists'
import { useGroceryStore } from '~/stores/grocery'

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
    const list = await groceryStore.createList(listName.value || `Week of ${new Date().toLocaleDateString()}`, selectedLists.value)
    router.push(`/grocery/${list.id}`)
  } catch (error) {
    console.error('Failed to create grocery list:', error)
  } finally {
    loading.value = false
  }
}
</script>
