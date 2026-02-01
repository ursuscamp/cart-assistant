import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const db = await getDatabase()

  db.run(
    'UPDATE lists SET name = ?, is_regular_items = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [body.name, body.is_regular_items ? 1 : 0, id]
  )

  if (body.ingredients) {
    db.run('DELETE FROM ingredients WHERE list_id = ?', [id])

    const insert = db.prepare('INSERT INTO ingredients (list_id, name, quantity, notes) VALUES (?, ?, ?, ?)')
    for (const ing of body.ingredients) {
      insert.run([id, ing.name, ing.quantity || null, ing.notes || null])
    }
    insert.free()
  }

  await saveDatabase()

  return { id: Number(id), name: body.name, is_regular_items: body.is_regular_items }
})
