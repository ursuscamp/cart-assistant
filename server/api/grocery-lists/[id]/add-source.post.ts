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

  const sectionMap = new Map(sections.map((s: any) => [s.name.toLowerCase(), s.id]))

  const ingredientsResult = db.exec('SELECT name FROM ingredients WHERE list_id = ?', [body.sourceListId])
  const newIngredients = ingredientsResult.length > 0 ? ingredientsResult[0].values.map((row: any[]) => row[0]) : []

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

  const sortedAssignments = await sortItemsWithLLM(newIngredients, existingMappings, sections)

  const assignmentMap = new Map<string, string>()
  for (const assignment of sortedAssignments) {
    assignmentMap.set(assignment.item.toLowerCase(), assignment.section_name)
  }

  db.run(
    'INSERT OR IGNORE INTO grocery_list_sources (grocery_list_id, source_list_id) VALUES (?, ?)',
    [id, body.sourceListId]
  )

  const maxOrderResult = db.exec('SELECT MAX(sort_order) as max FROM grocery_list_items WHERE grocery_list_id = ?', [id])
  const maxOrder = maxOrderResult.length > 0 && maxOrderResult[0].values.length > 0 ? maxOrderResult[0].values[0][0] : -1
  let nextOrder = (maxOrder ?? -1) + 1

  const added: string[] = []

  for (const ing of newIngredients) {
    const sectionName = assignmentMap.get(ing.toLowerCase()) || 'Other'
    const sectionId = sectionMap.get(sectionName.toLowerCase()) || sectionMap.get('other')

    db.run(
      'INSERT INTO grocery_list_items (grocery_list_id, ingredient_name, section_id, sort_order, is_checked) VALUES (?, ?, ?, ?, 0)',
      [id, ing, sectionId, nextOrder]
    )
    nextOrder++
    added.push(ing)

    if (sectionId) {
      const confidence = sortedAssignments.find(a => a.item.toLowerCase() === ing.toLowerCase())?.confidence || 0.8
      db.run(
        'INSERT OR REPLACE INTO item_section_mappings (item_name, section_id, is_manual_override, confidence, updated_at) VALUES (?, ?, 0, ?, CURRENT_TIMESTAMP)',
        [ing, sectionId, confidence]
      )
    }
  }

  await saveDatabase()

  return { added, count: added.length }
})
