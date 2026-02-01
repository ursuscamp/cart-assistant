import { getDatabase } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const db = await getDatabase()
  const result = db.exec(`
    SELECT l.*,
      (SELECT COUNT(*) FROM ingredients i WHERE i.list_id = l.id) as ingredient_count
    FROM lists l
    ORDER BY l.name
  `)
  if (result.length === 0) return []
  const columns = result[0].columns
  return result[0].values.map(row => {
    const obj: any = {}
    columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })
})
