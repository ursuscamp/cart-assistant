import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await getDatabase()

  db.run(
    'INSERT INTO lists (name, is_regular_items) VALUES (?, ?)',
    [body.name, body.is_regular_items ? 1 : 0]
  )

  const idResult = db.exec('SELECT last_insert_rowid() as id')
  const listId = idResult[0].values[0][0]

  if (body.ingredients && body.ingredients.length > 0) {
    const insert = db.prepare('INSERT INTO ingredients (list_id, name, quantity, notes) VALUES (?, ?, ?, ?)')
    for (const ing of body.ingredients) {
      insert.run([listId, ing.name, ing.quantity || null, ing.notes || null])
    }
    insert.free()
  }

  await saveDatabase()

  return { id: listId, name: body.name, is_regular_items: body.is_regular_items }
})
