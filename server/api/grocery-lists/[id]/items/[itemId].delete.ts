import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const listId = getRouterParam(event, 'id')
  const itemId = getRouterParam(event, 'itemId')
  const db = await getDatabase()

  db.run('DELETE FROM grocery_list_items WHERE grocery_list_id = ? AND id = ?', [listId, itemId])

  await saveDatabase()

  return { success: true }
})
