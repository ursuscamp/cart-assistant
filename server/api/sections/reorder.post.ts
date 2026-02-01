import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await getDatabase()

  const stmt = db.prepare('UPDATE sections SET display_order = ? WHERE id = ?')

  body.sectionIds.forEach((id: number, index: number) => {
    stmt.run([index, id])
  })

  stmt.free()

  await saveDatabase()

  return { success: true }
})
