import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const itemName = decodeURIComponent(getRouterParam(event, 'itemName') || '')
  const body = await readBody(event)
  const db = await getDatabase()

  db.run(
    'UPDATE item_section_mappings SET section_id = ?, is_manual_override = 1, updated_at = CURRENT_TIMESTAMP WHERE item_name = ?',
    [body.section_id, itemName]
  )

  await saveDatabase()

  return { success: true }
})
