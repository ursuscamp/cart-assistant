import { getDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const db = await getDatabase()

  const result = db.exec('SELECT * FROM lists WHERE id = ?', [id])
  if (result.length === 0 || result[0].values.length === 0) {
    throw createError({ statusCode: 404, message: 'List not found' })
  }

  const columns = result[0].columns
  const values = result[0].values[0]
  const list: any = {}
  columns.forEach((col, i) => { list[col] = values[i] })

  const ingResult = db.exec('SELECT * FROM ingredients WHERE list_id = ? ORDER BY name', [id])
  if (ingResult.length > 0) {
    const ingColumns = ingResult[0].columns
    list.ingredients = ingResult[0].values.map(row => {
      const obj: any = {}
      ingColumns.forEach((col, i) => { obj[col] = row[i] })
      return obj
    })
  } else {
    list.ingredients = []
  }

  return list
})
