<template>
  <div>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <h1 class="text-h4">Grocery Lists</h1>
        <v-btn color="primary" to="/">
          <v-icon left>mdi-plus</v-icon>
          Create New
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="list in groceryStore.lists" :key="list.id" cols="12" sm="6" md="4">
        <v-card :to="`/grocery/${list.id}`" hover>
          <v-card-title class="d-flex align-center">
            {{ list.name }}
            <v-progress-linear
              v-if="list.item_count"
              :model-value="((list.checked_count || 0) / list.item_count) * 100"
              color="success"
              height="3"
              class="ml-2"
              style="width: 60px"
            ></v-progress-linear>
          </v-card-title>
          <v-card-subtitle>
            {{ list.week_of }}
          </v-card-subtitle>
          <v-card-text>
            <div class="d-flex align-center text-body-2">
              <v-icon size="small" class="mr-1">mdi-format-list-bulleted</v-icon>
              {{ list.item_count || 0 }} items
              <span v-if="list.checked_count" class="text-success ml-2">
                ({{ list.checked_count }} checked)
              </span>
            </div>
            <div v-if="list.sources && list.sources.length > 0" class="mt-2">
              <v-chip v-for="source in list.sources.slice(0, 3)" :key="source.id" size="x-small" class="mr-1">
                {{ source.name }}
              </v-chip>
              <v-chip v-if="list.sources.length > 3" size="x-small">+{{ list.sources.length - 3 }}</v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-empty-state
      v-if="groceryStore.lists.length === 0 && !groceryStore.loading"
      icon="mdi-cart"
      title="No grocery lists yet"
      text="Create your first combined grocery list"
    >
      <template v-slot:actions>
        <v-btn color="primary" to="/">Create List</v-btn>
      </template>
    </v-empty-state>
  </div>
</template>

<script setup lang="ts">
import { useGroceryStore } from '~/stores/grocery'

const groceryStore = useGroceryStore()

onMounted(async () => {
  await groceryStore.fetchLists()
})
</script>
