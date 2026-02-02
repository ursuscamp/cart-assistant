interface SortAssignment {
  item: string
  section_name: string
  confidence: number
}

interface ImportList {
  name: string
  ingredients: Array<{
    name: string
    quantity?: string
  }>
}

interface ImportResult {
  lists: ImportList[]
}

export async function sortItemsWithLLM(
  items: string[],
  existingMappings: Record<string, string>,
  sections: Array<{ id: number; name: string }>
): Promise<SortAssignment[]> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-3-flash-preview'

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  const sectionNames = sections.map(s => s.name).join('\n')
  const mappingsText = Object.entries(existingMappings)
    .map(([item, section]) => `- "${item}" → ${section}`)
    .join('\n') || '(none)'

  const prompt = `You are organizing grocery items into store sections.

EXISTING KNOWLEDGE (respect these - use same section names):
${mappingsText}

SECTIONS (in store order, use these exact names):
${sectionNames}

ITEMS TO SORT:
${items.map(i => `- ${i}`).join('\n')}

RULES:
1. Use existing mappings when available (same section name)
2. Otherwise, assign to most logical section from the list above
3. Return valid JSON array with fields: item, section_name, confidence (0-1)

Example output format:
[
  {"item": "milk", "section_name": "Dairy", "confidence": 0.97},
  {"item": "lettuce", "section_name": "Produce", "confidence": 0.99}
]

Respond only with valid JSON, no additional text.`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Cart Assistant',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in LLM response')
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from LLM response')
    }

    const assignments = JSON.parse(jsonMatch[0]) as SortAssignment[]
    return assignments
  } catch (error) {
    console.error('LLM sorting error:', error)
    throw error
  }
}

export async function parseImportText(rawText: string): Promise<ImportResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-3-flash-preview'

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  const prompt = `You are parsing grocery lists from raw text.

INSTRUCTIONS:
1. Identify distinct lists/recipes in the text
2. Extract list names (create descriptive names if none exist)
3. Extract ingredients with quantities where available
4. Return valid JSON with format shown below

Input:
${rawText}

Output format:
{
  "lists": [
    {
      "name": "List Name",
      "ingredients": [
        {"name": "ingredient name", "quantity": "1 lb"}
      ]
    }
  ]
}

Rules:
- If no list name is found, create a descriptive one based on the content
- Parse quantities like "1 lb", "2 cups", "1 jar", etc.
- Return all lists found in the text
- Respond only with valid JSON, no additional text`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Cart Assistant',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in LLM response')
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from LLM response')
    }

    const result = JSON.parse(jsonMatch[0]) as ImportResult
    return result
  } catch (error) {
    console.error('LLM import parsing error:', error)
    throw error
  }
}
