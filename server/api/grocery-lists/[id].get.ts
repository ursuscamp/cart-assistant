import { getDatabase } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const db = await getDatabase()

  const result = db.exec('SELECT * FROM grocery_lists WHERE id = ?', [id])
  if (result.length === 0 || result[0].values.length === 0) {
    throw createError({ statusCode: 404, message: 'Grocery list not found' })
  }

  const columns = result[0].columns
  const values = result[0].values[0]
  const groceryList: any = {}
  columns.forEach((col, i) => { groceryList[col] = values[i] })

  const sectionsResult = db.exec(`
    SELECT s.*, glso.display_order as custom_order
    FROM sections s
    LEFT JOIN grocery_list_section_orders glso ON s.id = glso.section_id AND glso.grocery_list_id = ?
    ORDER BY COALESCE(glso.display_order, s.display_order)
  `, [id])
  const sections = sectionsResult.length > 0 ? sectionsResult[0].values.map(row => {
    const obj: any = {}
    sectionsResult[0].columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  }) : []

  const sectionMap = new Map(sections.map((s: any) => [s.name, s.id]))

  const itemsResult = db.exec(`
    SELECT gli.*, s.name as section_name
    FROM grocery_list_items gli
    LEFT JOIN sections s ON gli.section_id = s.id
    WHERE gli.grocery_list_id = ?
    ORDER BY gli.section_id, gli.sort_order
  `, [id])

  const items = itemsResult.length > 0 ? itemsResult[0].values.map(row => {
    const obj: any = {}
    itemsResult[0].columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  }) : []

  const itemsBySection = new Map<string, any[]>()
  for (const section of sections) {
    itemsBySection.set(section.name, [])
  }
  itemsBySection.set('Uncategorized', [])

  for (const item of items) {
    if (item.section_name) {
      itemsBySection.get(item.section_name)?.push(item)
    } else {
      itemsBySection.get('Uncategorized')?.push(item)
    }
  }

  groceryList.sections = sections.map((s: any) => ({
    ...s,
    items: itemsBySection.get(s.name) || []
  }))

  groceryList.uncategorized = itemsBySection.get('Uncategorized') || []

  const sourcesResult = db.exec(`
    SELECT l.id, l.name
    FROM lists l
    JOIN grocery_list_sources gls ON l.id = gls.source_list_id
    WHERE gls.grocery_list_id = ?
  `, [id])

  groceryList.sources = sourcesResult.length > 0 ? sourcesResult[0].values.map(row => {
    const obj: any = {}
    sourcesResult[0].columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  }) : []

  return groceryList
})
