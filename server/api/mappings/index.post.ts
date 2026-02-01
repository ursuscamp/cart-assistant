import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await getDatabase()

  db.run(
    'INSERT OR REPLACE INTO item_section_mappings (item_name, section_id, is_manual_override, confidence, updated_at) VALUES (?, ?, 1, 1.0, CURRENT_TIMESTAMP)',
    [body.item_name, body.section_id]
  )

  await saveDatabase()

  return { success: true }
})
