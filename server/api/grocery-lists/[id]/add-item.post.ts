import { getDatabase, saveDatabase } from '~~/server/utils/db'
import { sortItemsWithLLM } from '~~/server/utils/llm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const db = await getDatabase()

  const sectionsResult = db.exec('SELECT * FROM sections ORDER BY display_order')
  const sections = sectionsResult.length > 0 ? sectionsResult[0].values.map(row => {
    const obj: any = {}
    sectionsResult[0].columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  }) : []

  const mappingsResult = db.exec(`
    SELECT item_name, s.name as section_name
    FROM item_section_mappings m
    JOIN sections s ON m.section_id = s.id
  `)

  const existingMappings: Record<string, string> = {}
  if (mappingsResult.length > 0) {
    for (const row of mappingsResult[0].values) {
      existingMappings[row[0].toLowerCase()] = row[1]
    }
  }

  const sortedAssignments = await sortItemsWithLLM([body.name], existingMappings, sections)

  const assignment = sortedAssignments[0]
  const sectionName = assignment?.section_name || 'Other'
  const section = sections.find((s: any) => s.name.toLowerCase() === sectionName.toLowerCase())
  const sectionId = section?.id || sections.find((s: any) => s.name === 'Other')?.id

  const maxOrderResult = db.exec('SELECT MAX(sort_order) as max FROM grocery_list_items WHERE grocery_list_id = ?', [id])
  const maxOrder = maxOrderResult.length > 0 && maxOrderResult[0].values.length > 0 ? maxOrderResult[0].values[0][0] : -1
  const nextOrder = (maxOrder ?? -1) + 1

  db.run(
    'INSERT INTO grocery_list_items (grocery_list_id, ingredient_name, section_id, sort_order, is_checked) VALUES (?, ?, ?, ?, 0)',
    [id, body.name, sectionId, nextOrder]
  )

  const idResult = db.exec('SELECT last_insert_rowid() as id')
  const itemId = idResult[0].values[0][0]

  if (sectionId) {
    const confidence = assignment?.confidence || 0.8
    db.run(
      'INSERT OR REPLACE INTO item_section_mappings (item_name, section_id, is_manual_override, confidence, updated_at) VALUES (?, ?, 0, ?, CURRENT_TIMESTAMP)',
      [body.name, sectionId, confidence]
    )
  }

  await saveDatabase()

  return { id: itemId, ingredient_name: body.name, section_id: sectionId }
})
