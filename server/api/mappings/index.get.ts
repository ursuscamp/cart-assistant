import { getDatabase } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const db = await getDatabase()
  const result = db.exec(`
    SELECT m.*, s.name as section_name, m.is_manual_override
    FROM item_section_mappings m
    JOIN sections s ON m.section_id = s.id
    ORDER BY m.item_name
  `)
  if (result.length === 0) return []
  const columns = result[0].columns
  return result[0].values.map(row => {
    const obj: any = {}
    columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })
})
