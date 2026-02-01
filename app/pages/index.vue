<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold text-primary">Dashboard</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card class="h-100">
          <v-card-title class="bg-primary text-white d-flex align-center">
            <v-icon class="mr-2">mdi-playlist-plus</v-icon>
            Quick Create Grocery List
          </v-card-title>
          <v-card-text class="pt-4">
            <p class="text-body-1 text-grey-lighten-1 mb-4 font-weight-medium">
              Select lists to combine into your grocery list:
            </p>
            <v-list v-if="listsStore.lists.length > 0" density="compact" class="rounded-lg mb-4">
              <v-list-item
                v-for="list in listsStore.lists"
                :key="list.id"
                :value="list.id"
                rounded="lg"
                class="mb-1"
              >
                <template v-slot:prepend>
                  <v-checkbox-btn v-model="selectedLists" :value="list.id" color="primary"></v-checkbox-btn>
                </template>
                <v-list-item-title class="font-weight-medium">{{ list.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip size="small" color="primary" variant="tonal">
                    {{ list.ingredient_count || 0 }} items
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-alert v-else type="info" variant="tonal" class="mb-4">
              No lists yet. Create some lists first!
            </v-alert>
            <v-text-field
              v-model="listName"
              label="List name (optional)"
              placeholder="Week of Feb 1"
              color="primary"
              hide-details
              base-color="primary"
            ></v-text-field>
          </v-card-text>
          <v-card-actions class="pa-4 pt-0">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              size="large"
              :loading="loading"
              :disabled="selectedLists.length === 0"
              @click="createGroceryList"
            >
              <v-icon left>mdi-cart-plus</v-icon>
              Create Grocery List
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title class="bg-secondary text-white d-flex align-center">
            <v-icon class="mr-2">mdi-history</v-icon>
            Recent Grocery Lists
          </v-card-title>
          <v-card-text class="pt-4">
            <v-list v-if="groceryStore.lists.length > 0" density="compact">
              <v-list-item
                v-for="list in groceryStore.lists.slice(0, 5)"
                :key="list.id"
                :to="`/grocery/${list.id}`"
                rounded="lg"
                class="mb-1"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary" size="40" class="mr-3">
                    <v-icon color="white">mdi-cart</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">{{ list.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-primary">{{ list.item_count || 0 }} items</span>
                  <span v-if="list.checked_count" class="text-success ml-2">
                    · {{ list.checked_count }} checked
                  </span>
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-icon color="primary">mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center py-6">
              <v-icon size="64" color="grey-darken-1">mdi-cart-outline</v-icon>
              <p class="text-body-1 text-grey mt-2">No grocery lists yet</p>
            </div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title class="bg-accent text-white d-flex align-center">
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Quick Actions
          </v-card-title>
          <v-card-text class="pt-4">
            <v-btn block color="secondary" size="large" class="mb-3" to="/lists">
              <v-icon left>mdi-format-list-bulleted</v-icon>
              Manage Lists
            </v-btn>
            <v-btn block color="secondary" size="large" class="mb-3" to="/grocery">
              <v-icon left>mdi-cart</v-icon>
              View All Grocery Lists
            </v-btn>
            <v-btn block color="secondary" size="large" to="/settings">
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
