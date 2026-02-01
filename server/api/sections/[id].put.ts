import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const db = await getDatabase()

  db.run('UPDATE sections SET name = ? WHERE id = ?', [body.name, id])

  await saveDatabase()

  const result = db.exec('SELECT * FROM sections WHERE id = ?', [id])
  const columns = result[0].columns
  const values = result[0].values[0]
  const obj: any = {}
  columns.forEach((col, i) => { obj[col] = values[i] })
  return obj
})
