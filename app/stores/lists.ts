import { defineStore } from 'pinia'

export interface Ingredient {
  id?: number
  name: string
  quantity?: string
  notes?: string
}

export interface List {
  id: number
  name: string
  is_regular_items: boolean
  ingredient_count?: number
  ingredients?: Ingredient[]
}

export const useListsStore = defineStore('lists', {
  state: () => ({
    lists: [] as List[],
    currentList: null as List | null,
    loading: false
  }),

  actions: {
    async fetchLists() {
      this.loading = true
      try {
        const data = await $fetch<List[]>('/api/lists')
        this.lists = data
      } finally {
        this.loading = false
      }
    },

    async fetchList(id: number) {
      this.loading = true
      try {
        const data = await $fetch<List>(`/api/lists/${id}`)
        this.currentList = data
        return data
      } finally {
        this.loading = false
      }
    },

    async createList(name: string, isRegularItems: boolean, ingredients: Ingredient[] = []) {
      const list = await $fetch<List>('/api/lists', {
        method: 'POST',
        body: { name, is_regular_items: isRegularItems, ingredients }
      })
      this.lists.push(list)
      return list
    },

    async updateList(id: number, name: string, isRegularItems: boolean, ingredients: Ingredient[]) {
      const list = await $fetch<List>(`/api/lists/${id}`, {
        method: 'PUT',
        body: { name, is_regular_items: isRegularItems, ingredients }
      })
      const index = this.lists.findIndex(l => l.id === id)
      if (index !== -1) {
        this.lists[index] = list
      }
      if (this.currentList?.id === id) {
        this.currentList = list
      }
      return list
    },

    async deleteList(id: number) {
      await $fetch(`/api/lists/${id}`, { method: 'DELETE' })
      this.lists = this.lists.filter(l => l.id !== id)
    },

    async previewImport(rawText: string) {
      return await $fetch<{ lists: Array<{ name: string; ingredients: Ingredient[] }> }>('/api/lists/import-preview', {
        method: 'POST',
        body: { rawText }
      })
    },

    async confirmImport(lists: Array<{ name: string; isRegularItems: boolean; ingredients: Ingredient[] }>) {
      const result = await $fetch<{ created: number[]; count: number }>('/api/lists/import-confirm', {
        method: 'POST',
        body: { lists }
      })
      await this.fetchLists()
      return result
    }
  }
})
