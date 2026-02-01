import { getDatabase, saveDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const itemId = getRouterParam(event, 'itemId')
  const body = await readBody(event)
  const db = await getDatabase()

  const updates: string[] = []
  const values: any[] = []

  if (body.section_id !== undefined) {
    updates.push('section_id = ?')
    values.push(body.section_id)

    if (body.is_manual_override !== undefined && body.is_manual_override) {
      const itemResult = db.exec('SELECT ingredient_name FROM grocery_list_items WHERE id = ?', [itemId])
      if (itemResult.length > 0 && itemResult[0].values.length > 0) {
        const itemName = itemResult[0].values[0][0]

        db.run(
          'UPDATE item_section_mappings SET section_id = ?, is_manual_override = 1, updated_at = CURRENT_TIMESTAMP WHERE item_name = ?',
          [body.section_id, itemName]
        )
      }
    }
  }

  if (body.is_checked !== undefined) {
    updates.push('is_checked = ?')
    values.push(body.is_checked ? 1 : 0)
  }

  if (body.sort_order !== undefined) {
    updates.push('sort_order = ?')
    values.push(body.sort_order)
  }

  if (updates.length > 0) {
    values.push(itemId)
    db.run(`UPDATE grocery_list_items SET ${updates.join(', ')} WHERE id = ?`, values)
  }

  await saveDatabase()

  const itemResult = db.exec(`
    SELECT gli.*, s.name as section_name
    FROM grocery_list_items gli
    LEFT JOIN sections s ON gli.section_id = s.id
    WHERE gli.id = ?
  `, [itemId])

  if (itemResult.length > 0) {
    const obj: any = {}
    itemResult[0].columns.forEach((col, i) => { obj[col] = itemResult[0].values[0][i] })
    return obj
  }

  return { id: Number(itemId) }
})
