<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Settings</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            Grocery Sections
            <v-spacer></v-spacer>
            <v-btn size="small" color="primary" @click="showAddSectionDialog = true">
              <v-icon left>mdi-plus</v-icon>
              Add
            </v-btn>
          </v-card-title>
          <v-card-text>
            <draggable
              v-model="sectionsStore.sections"
              :group="{ name: 'sections', pull: false, put: false }"
              item-key="id"
              @end="onSectionReorder"
            >
              <template #item="{ element }">
                <v-card variant="outlined" class="mb-2 cursor-move">
                  <v-card-text class="d-flex align-center py-2">
                    <v-icon class="mr-2">mdi-drag-vertical</v-icon>
                    <span class="flex-grow-1">{{ element.name }}</span>
                    <v-btn icon size="x-small" variant="text" @click="editSection(element)">
                      <v-icon size="small">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon size="x-small" variant="text" color="error" @click="deleteSection(element)">
                      <v-icon size="small">mdi-delete</v-icon>
                    </v-btn>
                  </v-card-text>
                </v-card>
              </template>
            </draggable>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Item Section Mappings</v-card-title>
          <v-card-text>
            <p class="text-body-2 text-grey mb-4">
              Manually overridden item-section assignments. These take precedence over LLM suggestions.
            </p>
            <v-text-field
              v-model="mappingSearch"
              label="Search items"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              class="mb-2"
            ></v-text-field>
            <v-list density="compact" max-height="400" class="overflow-y-auto">
              <v-list-item v-for="mapping in filteredMappings" :key="mapping.item_name">
                <v-list-item-title>{{ mapping.item_name }}</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip size="x-small" :color="mapping.is_manual_override ? 'info' : 'default'">
                    {{ mapping.section_name }}
                  </v-chip>
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-select
                    :model-value="mapping.section_id"
                    :items="sectionsStore.sections"
                    item-title="name"
                    item-value="id"
                    density="compact"
                    hide-details
                    style="width: 150px"
                    @update:model-value="updateMapping(mapping.item_name, $event)"
                  ></v-select>
                </template>
              </v-list-item>
            </v-list>
            <p v-if="mappings.length === 0" class="text-center text-grey py-4">
              No mappings yet. Drag items between sections in a grocery list to create mappings.
            </p>
          </v-card-text>
        </v-card>

        <v-card class="mt-4">
          <v-card-title>LLM Configuration</v-card-title>
          <v-card-text>
            <v-alert type="info" variant="tonal" class="mb-4">
              OpenRouter API is configured via environment variables.
            </v-alert>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>API Key</v-list-item-title>
                <v-list-item-subtitle>
                  {{ openrouterApiKey ? '••••••••••••••••' : 'Not configured' }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Model</v-list-item-title>
                <v-list-item-subtitle>{{ openrouterModel }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showAddSectionDialog" max-width="400">
      <v-card>
        <v-card-title>{{ editingSection ? 'Edit Section' : 'Add Section' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="sectionForm.name" label="Section name"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeSectionDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveSection">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useSectionsStore, type Section } from '~/stores/sections'
import draggable from 'vuedraggable'

const config = useRuntimeConfig()
const snackbar = inject<any>('snackbar')

const sectionsStore = useSectionsStore()
const mappings = ref<Array<{ item_name: string; section_id: number; section_name: string; is_manual_override: number }>>([])
const mappingSearch = ref('')
const showAddSectionDialog = ref(false)
const editingSection = ref<Section | null>(null)
const sectionForm = reactive({ name: '' })

const openrouterApiKey = config.openrouterApiKey
const openrouterModel = config.openrouterModel

const filteredMappings = computed(() => {
  if (!mappingSearch.value.trim()) return mappings.value
  return mappings.value.filter(m =>
    m.item_name.toLowerCase().includes(mappingSearch.value.toLowerCase())
  )
})

onMounted(async () => {
  await Promise.all([
    sectionsStore.fetchSections(),
    fetchMappings()
  ])
})

async function fetchMappings() {
  mappings.value = await $fetch('/api/mappings')
}

async function onSectionReorder() {
  const sectionIds = sectionsStore.sections.map(s => s.id)
  await sectionsStore.reorderSections(sectionIds)
  snackbar.show = true
  snackbar.message = 'Section order updated'
}

function editSection(section: Section) {
  editingSection.value = section
  sectionForm.name = section.name
  showAddSectionDialog.value = true
}

function deleteSection(section: Section) {
  if (confirm(`Delete section "${section.name}"?`)) {
    sectionsStore.deleteSection(section.id)
  }
}

function closeSectionDialog() {
  showAddSectionDialog.value = false
  editingSection.value = null
  sectionForm.name = ''
}

async function saveSection() {
  if (!sectionForm.name.trim()) return
  if (editingSection.value) {
    await sectionsStore.updateSection(editingSection.value.id, sectionForm.name)
  } else {
    await sectionsStore.createSection(sectionForm.name)
  }
  closeSectionDialog()
}

async function updateMapping(itemName: string, sectionId: number) {
  await $fetch(`/api/mappings/${encodeURIComponent(itemName)}`, {
    method: 'PUT',
    body: { section_id: sectionId }
  })
  await fetchMappings()
}
</script>

<style scoped>
.cursor-move {
  cursor: move;
}
</style>
