import { getDatabase, saveDatabase } from '~~/server/utils/db'
import { sortItemsWithLLM } from '~~/server/utils/llm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await getDatabase()

  const sectionsResult = db.exec('SELECT * FROM sections ORDER BY display_order')
  const sections = sectionsResult.length > 0 ? sectionsResult[0].values.map(row => {
    const obj: any = {}
    sectionsResult[0].columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  }) : []

  const sectionMap = new Map(sections.map((s: any) => [s.name.toLowerCase(), s.id]))

  const sourceListIds = body.sourceListIds || []
  const allIngredients: string[] = []

  for (const listId of sourceListIds) {
    const ingredients = db.exec('SELECT name FROM ingredients WHERE list_id = ?', [listId])
    if (ingredients.length > 0 && ingredients[0].values.length > 0) {
      for (const row of ingredients[0].values) {
        allIngredients.push(row[0])
      }
    }
  }

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

  const sortedAssignments = await sortItemsWithLLM(allIngredients, existingMappings, sections)

  const name = body.name || `Week of ${new Date().toLocaleDateString()}`

  db.run(
    'INSERT INTO grocery_lists (name, week_of) VALUES (?, ?)',
    [name, new Date().toISOString().split('T')[0]]
  )

  const idResult = db.exec('SELECT last_insert_rowid() as id')
  const groceryListId = idResult[0].values[0][0]

  for (const listId of sourceListIds) {
    db.run(
      'INSERT INTO grocery_list_sources (grocery_list_id, source_list_id) VALUES (?, ?)',
      [groceryListId, listId]
    )
  }

  const assignmentMap = new Map<string, string>()
  for (const assignment of sortedAssignments) {
    assignmentMap.set(assignment.item.toLowerCase(), assignment.section_name)
  }

  let sortOrder = 0
  for (const ingredient of allIngredients) {
    const sectionName = assignmentMap.get(ingredient.toLowerCase()) || 'Other'
    const sectionId = sectionMap.get(sectionName.toLowerCase()) || sectionMap.get('other')

    db.run(
      'INSERT INTO grocery_list_items (grocery_list_id, ingredient_name, section_id, sort_order, is_checked) VALUES (?, ?, ?, ?, 0)',
      [groceryListId, ingredient, sectionId, sortOrder]
    )
    sortOrder++

    if (sectionId) {
      const confidence = sortedAssignments.find(a => a.item.toLowerCase() === ingredient.toLowerCase())?.confidence || 0.8
      db.run(
        'INSERT OR REPLACE INTO item_section_mappings (item_name, section_id, is_manual_override, confidence, updated_at) VALUES (?, ?, 0, ?, CURRENT_TIMESTAMP)',
        [ingredient, sectionId, confidence]
      )
    }
  }

  await saveDatabase()

  const groceryListResult = db.exec('SELECT * FROM grocery_lists WHERE id = ?', [groceryListId])
  const groceryList: any = {}
  groceryListResult[0].columns.forEach((col, i) => { groceryList[col] = groceryListResult[0].values[0][i] })

  const itemsResult = db.exec(`
    SELECT gli.*, s.name as section_name
    FROM grocery_list_items gli
    LEFT JOIN s ON gli.section_id = s.id
    WHERE gli.grocery_list_id = ?
    ORDER BY gli.section_id, gli.sort_order
  `, [groceryListId])

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

  return groceryList
})
