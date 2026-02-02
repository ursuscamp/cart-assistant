<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-white">Settings</h1>
      <p class="text-bark-400 mt-1">Configure your grocery sections and preferences</p>
    </div>

    <div class="grid lg:grid-cols-2 gap-4 lg:gap-6">
      <div class="card flex flex-col">
        <div class="section-header">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-forest-600/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h3 class="font-semibold text-white">Grocery Sections</h3>
          </div>
          <button @click="showAddSectionModal = true" class="btn-ghost p-2 touch-manipulation">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        <div class="p-3 lg:p-4 space-y-2 overflow-y-auto scrollbar-thin max-h-[calc(100vh-320px)]">
          <draggable v-model="localSections" item-key="id" handle=".cursor-grab" @end="onSectionsReorder">
            <template #item="{ element: section }">
              <div class="flex items-center gap-2 p-2 lg:p-3 rounded-lg bg-bark-900/50 border border-bark-800">
                <div class="cursor-grab text-bark-500 hover:text-bark-300">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                <span class="flex-1 font-medium text-white truncate text-sm lg:text-base">{{ section.name }}</span>
                <div class="flex items-center gap-0.5 lg:gap-1">
                  <button @click="editSection(section)" class="p-1.5 lg:p-2 rounded-lg text-bark-400 hover:text-white hover:bg-bark-800 touch-manipulation">
                    <svg class="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteSection(section)" class="p-1.5 lg:p-2 rounded-lg text-bark-400 hover:text-red-400 hover:bg-red-900/20 touch-manipulation">
                    <svg class="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <div class="card">
        <div class="section-header">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-moss-500/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-moss-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-white">Item Mappings</h3>
          </div>
        </div>
        <div class="card-body">
          <p class="text-sm text-bark-400 mb-4">Manually overridden item-section assignments.</p>
          <div class="flex gap-2 mb-4">
            <input v-model="newMappingItem" type="text" class="input-field flex-1 text-sm" placeholder="Item name" @keyup.enter="createMapping" />
            <select v-model="newMappingSection" class="bg-bark-800 border border-bark-700 text-white text-sm rounded-lg px-2 lg:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest-500 w-32 lg:w-40">
              <option value="">Section</option>
              <option v-for="section in sectionsStore.sections" :key="section.id" :value="section.id">{{ section.name }}</option>
            </select>
            <button @click="createMapping" :disabled="!newMappingItem.trim() || !newMappingSection" class="btn-primary touch-manipulation">Add</button>
          </div>
          <input v-model="mappingSearch" type="text" class="input-field mb-4 text-sm" placeholder="Search items..." />
          <div v-if="filteredMappings.length > 0" class="space-y-2 max-h-[calc(100vh-460px)] overflow-y-auto scrollbar-thin">
            <div v-for="mapping in filteredMappings" :key="mapping.item_name" class="flex items-center justify-between p-2 lg:p-3 rounded-lg bg-bark-900/50 border border-bark-800">
              <div class="flex-1 min-w-0 mr-2">
                <p class="font-medium text-white truncate text-sm lg:text-base">{{ mapping.item_name }}</p>
                <span :class="['text-xs px-2 py-0.5 rounded-full', mapping.is_manual_override ? 'bg-forest-600/30 text-forest-300' : 'bg-bark-700 text-bark-400']">{{ mapping.section_name }}</span>
              </div>
              <select :value="mapping.section_id" @change="updateMapping(mapping.item_name, Number($event.target.value))" class="bg-bark-800 border border-bark-700 text-white text-xs lg:text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-forest-500 w-28 lg:w-32 flex-shrink-0">
                <option v-for="section in sectionsStore.sections" :key="section.id" :value="section.id">{{ section.name }}</option>
              </select>
              <button @click="deleteMapping(mapping.item_name)" class="p-1.5 lg:p-2 rounded-lg text-bark-400 hover:text-red-400 hover:bg-red-900/20 ml-2 touch-manipulation">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <p class="text-bark-400">No mappings yet</p>
          </div>
        </div>
      </div>
    </div>

    <Modal :show="showAddSectionModal" :title="editingSection ? 'Edit Section' : 'Add Section'" @close="closeSectionModal">
      <input v-model="sectionForm.name" type="text" class="input-field" :placeholder="editingSection ? 'Section name' : 'New section name'" />
      <template #footer>
        <button @click="closeSectionModal" class="btn-secondary">Cancel</button>
        <button @click="saveSection" class="btn-primary">Save</button>
      </template>
    </Modal>

    <ConfirmationModal
      :show="showDeleteConfirm"
      :title="deleteConfirmTitle"
      :message="deleteConfirmMessage"
      @close="showDeleteConfirm = false; itemToDelete = null"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { useSectionsStore, type Section } from '~/stores/sections'
import Modal from '~/components/Modal.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'

const sectionsStore = useSectionsStore()
const toast = useToast()

const localSections = ref<Section[]>([])

const mappings = ref<Array<{ item_name: string; section_id: number; section_name: string; is_manual_override: number }>>([])
const mappingSearch = ref('')
const newMappingItem = ref('')
const newMappingSection = ref<number | ''>('')

const showAddSectionModal = ref(false)
const editingSection = ref<Section | null>(null)
const sectionForm = reactive({ name: '' })

const showDeleteConfirm = ref(false)
const itemToDelete = ref<{ type: 'section' | 'mapping'; data: any } | null>(null)

const deleteConfirmTitle = computed(() => itemToDelete.value?.type === 'section' ? 'Delete Section' : 'Delete Mapping')
const deleteConfirmMessage = computed(() => {
  if (!itemToDelete.value) return ''
  if (itemToDelete.value.type === 'section') {
    return `Delete section "${itemToDelete.value.data.name}"? This will affect any items mapped to this section.`
  }
  return `Delete mapping for "${itemToDelete.value.data.item_name}"?`
})

const filteredMappings = computed(() => {
  if (!mappingSearch.value.trim()) return mappings.value
  return mappings.value.filter(m => m.item_name.toLowerCase().includes(mappingSearch.value.toLowerCase()))
})

onMounted(async () => {
  await Promise.all([sectionsStore.fetchSections(), fetchMappings()])
  localSections.value = [...sectionsStore.sections]
})

watch(() => sectionsStore.sections, (newSections) => {
  localSections.value = [...newSections]
}, { deep: true })

async function onSectionsReorder() {
  await sectionsStore.reorderSections(localSections.value.map(s => s.id))
  toast.success('Sections reordered')
}

async function fetchMappings() {
  mappings.value = await $fetch('/api/mappings')
}

async function createMapping() {
  if (!newMappingItem.value.trim() || !newMappingSection.value) return
  try {
    await $fetch('/api/mappings', { method: 'POST', body: { item_name: newMappingItem.value.trim(), section_id: newMappingSection.value, is_manual_override: true } })
    await fetchMappings()
    newMappingItem.value = ''
    newMappingSection.value = ''
    toast.success('Mapping created')
  } catch (error) {
    toast.error('Failed to create mapping')
  }
}

async function updateMapping(itemName: string, sectionId: number) {
  try {
    await $fetch(`/api/mappings/${encodeURIComponent(itemName)}`, { method: 'PUT', body: { section_id: sectionId, is_manual_override: true } })
    await fetchMappings()
    toast.success('Mapping updated')
  } catch (error) {
    toast.error('Failed to update mapping')
  }
}

async function deleteMapping(itemName: string) {
  itemToDelete.value = { type: 'mapping', data: { item_name: itemName } }
  showDeleteConfirm.value = true
}

function editSection(section: Section) {
  editingSection.value = section
  sectionForm.name = section.name
  showAddSectionModal.value = true
}

function closeSectionModal() {
  showAddSectionModal.value = false
  editingSection.value = null
  sectionForm.name = ''
}

async function saveSection() {
  if (!sectionForm.name.trim()) return
  try {
    if (editingSection.value) {
      await sectionsStore.updateSection(editingSection.value.id, sectionForm.name)
      toast.success('Section updated')
    } else {
      await sectionsStore.createSection(sectionForm.name)
      toast.success('Section created')
    }
    closeSectionModal()
  } catch (error) {
    toast.error('Failed to save section')
  }
}

async function deleteSection(section: Section) {
  itemToDelete.value = { type: 'section', data: section }
  showDeleteConfirm.value = true
}

async function handleDeleteConfirm() {
  if (!itemToDelete.value) return

  try {
    if (itemToDelete.value.type === 'section') {
      await sectionsStore.deleteSection(itemToDelete.value.data.id)
      toast.success('Section deleted')
    } else if (itemToDelete.value.type === 'mapping') {
      await $fetch(`/api/mappings/${encodeURIComponent(itemToDelete.value.data.item_name)}`, { method: 'DELETE' })
      await fetchMappings()
      toast.success('Mapping deleted')
    }
  } catch (error) {
    toast.error('Failed to delete')
  }

  showDeleteConfirm.value = false
  itemToDelete.value = null
}
</script>
