import { parseImportText } from '~~/server/utils/llm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.rawText || !body.rawText.trim()) {
    throw createError({ statusCode: 400, message: 'rawText is required' })
  }

  const result = await parseImportText(body.rawText)
  return result
})
