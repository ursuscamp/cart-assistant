import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await getDatabase()

  const created: number[] = []

  for (const list of body.lists || []) {
    db.run(
      'INSERT OR IGNORE INTO lists (name, is_regular_items) VALUES (?, ?)',
      [list.name, list.is_regular_items ? 1 : 0]
    )

    const existing = db.exec('SELECT id FROM lists WHERE name = ?', [list.name])
    let listId = existing[0].values[0][0]

    const checkResult = db.exec('SELECT changes() as changes')
    if (checkResult[0].values[0][0] > 0) {
      created.push(Number(listId))
    }

    if (list.ingredients && list.ingredients.length > 0) {
      const insert = db.prepare('INSERT OR IGNORE INTO ingredients (list_id, name, quantity) VALUES (?, ?, ?)')
      for (const ing of list.ingredients) {
        insert.run([listId, ing.name, ing.quantity || null])
      }
      insert.free()
    }
  }

  await saveDatabase()

  return { created, count: created.length }
})
