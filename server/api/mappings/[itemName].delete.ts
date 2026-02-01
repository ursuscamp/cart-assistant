import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const itemName = decodeURIComponent(getRouterParam(event, 'itemName') || '')
  const db = await getDatabase()

  db.run('DELETE FROM item_section_mappings WHERE item_name = ?', [itemName])
  
  await saveDatabase()

  return { success: true }
})
