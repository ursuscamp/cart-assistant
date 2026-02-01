import { getDatabase } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const db = await getDatabase()
  const result = db.exec('SELECT * FROM sections ORDER BY display_order')
  if (result.length === 0) return []
  const columns = result[0].columns
  const values = result[0].values
  return values.map(row => {
    const obj: any = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj
  })
})
