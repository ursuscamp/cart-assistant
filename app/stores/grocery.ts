import { defineStore } from 'pinia'

export interface GroceryItem {
  id: number
  ingredient_name: string
  section_id?: number
  section_name?: string
  is_checked: boolean
  sort_order: number
}

export interface GrocerySection {
  id: number
  name: string
  display_order: number
  items: GroceryItem[]
}

export interface GroceryList {
  id: number
  name: string
  week_of: string
  sections: GrocerySection[]
  uncategorized?: GroceryItem[]
  sources: Array<{ id: number; name: string }>
  item_count?: number
  checked_count?: number
}

export const useGroceryStore = defineStore('grocery', {
  state: () => ({
    lists: [] as GroceryList[],
    currentList: null as GroceryList | null,
    loading: false
  }),

  actions: {
    async fetchLists() {
      this.loading = true
      try {
        const data = await $fetch<GroceryList[]>('/api/grocery-lists')
        this.lists = data
      } finally {
        this.loading = false
      }
    },

    async fetchList(id: number) {
      this.loading = true
      try {
        const data = await $fetch<GroceryList>(`/api/grocery-lists/${id}`)
        this.currentList = data
        return data
      } finally {
        this.loading = false
      }
    },

    async createList(name: string, sourceListIds: number[]) {
      const list = await $fetch<GroceryList>('/api/grocery-lists', {
        method: 'POST',
        body: { name, sourceListIds }
      })
      this.lists.unshift(list)
      return list
    },

    async updateListName(id: number, name: string) {
      await $fetch(`/api/grocery-lists/${id}`, {
        method: 'PUT',
        body: { name }
      })
      const list = this.lists.find(l => l.id === id)
      if (list) {
        list.name = name
      }
    },

    async addItem(listId: number, name: string) {
      const item = await $fetch<GroceryItem>(`/api/grocery-lists/${listId}/add-item`, {
        method: 'POST',
        body: { name }
      })
      await this.fetchList(listId)
      return item
    },

    async addSource(listId: number, sourceListId: number) {
      const result = await $fetch<{ added: string[]; count: number }>(`/api/grocery-lists/${listId}/add-source`, {
        method: 'POST',
        body: { sourceListId }
      })
      await this.fetchList(listId)
      return result
    },

    async updateItem(listId: number, itemId: number, updates: Partial<GroceryItem> & { is_manual_override?: boolean }) {
      await $fetch(`/api/grocery-lists/${listId}/items/${itemId}`, {
        method: 'PUT',
        body: updates
      })
      await this.fetchList(listId)
    },

    async toggleChecked(listId: number, itemId: number, isChecked: boolean) {
      await this.updateItem(listId, itemId, { is_checked: isChecked })
    }
  }
})
