import { defineStore } from 'pinia'

export interface Section {
  id: number
  name: string
  display_order: number
}

export const useSectionsStore = defineStore('sections', {
  state: () => ({
    sections: [] as Section[],
    loading: false
  }),

  actions: {
    async fetchSections() {
      this.loading = true
      try {
        const data = await $fetch<Section[]>('/api/sections')
        this.sections = data
      } finally {
        this.loading = false
      }
    },

    async createSection(name: string) {
      const section = await $fetch<Section>('/api/sections', {
        method: 'POST',
        body: { name }
      })
      this.sections.push(section)
      return section
    },

    async updateSection(id: number, name: string) {
      const section = await $fetch<Section>(`/api/sections/${id}`, {
        method: 'PUT',
        body: { name }
      })
      const index = this.sections.findIndex(s => s.id === id)
      if (index !== -1) {
        this.sections[index] = section
      }
    },

    async deleteSection(id: number) {
      await $fetch(`/api/sections/${id}`, { method: 'DELETE' })
      this.sections = this.sections.filter(s => s.id !== id)
    },

    async reorderSections(sectionIds: number[]) {
      await $fetch('/api/sections/reorder', {
        method: 'POST',
        body: { sectionIds }
      })
      await this.fetchSections()
    }
  }
})
