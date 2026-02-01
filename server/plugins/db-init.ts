import { getDatabase, runMigrations } from '../utils/db'

export default defineNitroPlugin(async () => {
  try {
    await getDatabase()
    runMigrations()
  } catch (error) {
    console.error('Database initialization error:', error)
  }
})
