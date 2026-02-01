import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const db = await getDatabase()

  db.run('DELETE FROM grocery_list_section_orders WHERE grocery_list_id = ?', [id])

  const stmt = db.prepare('INSERT INTO grocery_list_section_orders (grocery_list_id, section_id, display_order) VALUES (?, ?, ?)')

  body.sectionIds.forEach((sectionId: number, index: number) => {
    stmt.run([id, sectionId, index])
  })

  stmt.free()

  await saveDatabase()

  return { success: true }
})
