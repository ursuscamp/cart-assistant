import { getDatabase } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const db = await getDatabase()
  const result = db.exec(`
    SELECT gl.*,
      (SELECT COUNT(*) FROM grocery_list_items gli WHERE gli.grocery_list_id = gl.id) as item_count,
      (SELECT COUNT(*) FROM grocery_list_items gli WHERE gli.grocery_list_id = gl.id AND gli.is_checked = 1) as checked_count
    FROM grocery_lists gl
    ORDER BY gl.created_at DESC
  `)
  if (result.length === 0) return []
  const columns = result[0].columns
  return result[0].values.map(row => {
    const obj: any = {}
    columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })
})
