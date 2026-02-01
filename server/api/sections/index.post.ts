import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await getDatabase()

  const maxResult = db.exec('SELECT MAX(display_order) as max FROM sections')
  const maxOrder = maxResult.length > 0 && maxResult[0].values.length > 0 ? maxResult[0].values[0][0] : -1
  const nextOrder = (maxOrder ?? -1) + 1

  db.run('INSERT INTO sections (name, display_order) VALUES (?, ?)', [body.name, nextOrder])

  const idResult = db.exec('SELECT last_insert_rowid() as id')
  const id = idResult[0].values[0][0]

  await saveDatabase()

  return { id, name: body.name, display_order: nextOrder }
})
