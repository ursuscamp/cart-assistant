import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const db = await getDatabase()

  db.run('DELETE FROM sections WHERE id = ?', [id])

  await saveDatabase()

  return { success: true }
})
