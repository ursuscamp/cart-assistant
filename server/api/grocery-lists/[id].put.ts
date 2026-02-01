import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const db = await getDatabase()

  if (body.name) {
    db.run('UPDATE grocery_lists SET name = ? WHERE id = ?', [body.name, id])
  }

  await saveDatabase()

  return { success: true }
})
