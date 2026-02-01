import initSqlJs, { Database } from 'sql.js'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

let db: Database | null = null
let sqlJs: any = null

async function getSqlJs() {
  if (sqlJs) return sqlJs
  const wasmPath = path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm')
  sqlJs = await initSqlJs({
    locateFile: (file: string) => {
      if (file.endsWith('.wasm')) {
        return wasmPath
      }
      return file
    }
  })
  return sqlJs
}

export async function getDatabase(): Promise<Database> {
  if (db) return db

  await getSqlJs()

  const config = useRuntimeConfig()
  const dbPath = config.public.databasePath

  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new sqlJs.Database(fileBuffer)
  } else {
    db = new sqlJs.Database()
  }

  runMigrations()

  return db
}

export async function saveDatabase() {
  if (!db) return
  const config = useRuntimeConfig()
  const dbPath = config.public.databasePath
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}

export function runMigrations() {
  if (!db) return

  db.run(`
    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_regular_items INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity TEXT,
      notes TEXT,
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS item_section_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      section_id INTEGER NOT NULL,
      is_manual_override INTEGER DEFAULT 0,
      confidence REAL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (section_id) REFERENCES sections(id),
      UNIQUE(item_name)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS grocery_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      week_of DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS grocery_list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grocery_list_id INTEGER NOT NULL,
      ingredient_name TEXT NOT NULL,
      section_id INTEGER,
      is_checked INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (grocery_list_id) REFERENCES grocery_lists(id) ON DELETE CASCADE,
      FOREIGN KEY (section_id) REFERENCES sections(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS grocery_list_sources (
      grocery_list_id INTEGER NOT NULL,
      source_list_id INTEGER NOT NULL,
      PRIMARY KEY (grocery_list_id, source_list_id),
      FOREIGN KEY (grocery_list_id) REFERENCES grocery_lists(id) ON DELETE CASCADE,
      FOREIGN KEY (source_list_id) REFERENCES lists(id) ON DELETE CASCADE
    )
  `)

  seedDefaultSections()
  saveDatabase()
}

function seedDefaultSections() {
  if (!db) return

  const result = db.exec('SELECT COUNT(*) as count FROM sections')
  const count = result.length > 0 ? result[0].values[0][0] : 0

  if (count === 0) {
    const defaultSections = [
      { name: 'Produce', display_order: 0 },
      { name: 'Meat', display_order: 1 },
      { name: 'Seafood', display_order: 2 },
      { name: 'Dairy', display_order: 3 },
      { name: 'Eggs', display_order: 4 },
      { name: 'Bakery', display_order: 5 },
      { name: 'Frozen', display_order: 6 },
      { name: 'Pantry', display_order: 7 },
      { name: 'Canned Goods', display_order: 8 },
      { name: 'Condiments', display_order: 9 },
      { name: 'Snacks', display_order: 10 },
      { name: 'Beverages', display_order: 11 },
      { name: 'Household', display_order: 12 },
      { name: 'Other', display_order: 13 },
    ]

    for (const section of defaultSections) {
      db!.run('INSERT INTO sections (name, display_order) VALUES (?, ?)', [section.name, section.display_order])
    }
  }
}
