# AGENTS.md - Cart Assistant Development Guide

## Project Overview

Cart Assistant is a Nuxt 3 grocery list management application with AI-powered sorting. It uses:
- **Frontend**: Vue 3, Headless UI, Tailwind CSS, Pinia
- **Backend**: Nuxt server routes (Nitro), SQLite via sql.js
- **AI**: OpenRouter API for sorting items into grocery sections
- **Database**: SQLite (file-based, configured via `DATABASE_PATH` env var)

## Build Commands

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate

# Install dependencies
npm install
```

## Docker

```bash
# Build image
docker build -t cart-assistant .

# Run container
docker run -p 3000:3000 -v ./data:/data -e DATABASE_PATH=/data/grocery.db cart-assistant
```

**Image publishing**: GitHub Actions workflow at `.github/workflows/docker-publish.yml` builds and pushes to GHCR on version tags (`v*`).

## Code Style Guidelines

### TypeScript

- Use explicit types for function parameters and return values
- Define interfaces for all data structures (see `app/stores/*.ts` for examples)
- Use `any` sparingly; prefer `unknown` for truly unknown types
- Use `null` instead of `undefined` for optional values in APIs

### Vue Components

- Use `<script setup lang="ts">` for all components
- Use `defineProps` and `defineEmits` with TypeScript generics
- Use `ref` for primitives, `reactive` for objects
- Prefer computed properties over inline calculations
- Use `onMounted` for client-side initialization

Example:
```typescript
const props = defineProps<{
  show: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
```

### Styling (Tailwind CSS)

- Use the custom "Dark Forest" color palette: `forest`, `moss`, `bark`, `pine`, `fern`
- Use `text-*` for text colors, `bg-*` for backgrounds, `border-*` for borders
- Mobile-first: base classes for mobile, `lg:` prefix for desktop
- Use `touch-manipulation` class on buttons for better mobile responsiveness
- Use `scrollbar-thin` class for custom scrollbars
- Avoid custom CSS; use Tailwind utilities or extend `tailwind.config.ts`

### Pinia Stores

- Use setup store pattern: `defineStore('name', () => { ... })`
- Export interfaces for state types (e.g., `GroceryItem`, `GroceryList`)
- Use `async` actions for API calls
- Handle loading states with `loading` boolean

### API Routes

- Place in `server/api/**/` directories
- Use `~~/server/utils/db` for database access
- Return JSON directly from handlers
- Use `$fetch` in frontend stores for API calls

Example:
```typescript
import { getDatabase } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const db = await getDatabase()
  const result = db.exec('SELECT * FROM sections ORDER BY display_order')
  // ...
})
```

### Database (sql.js)

- Use `getDatabase()` to get DB instance, `saveDatabase()` to persist
- All tables created in `server/utils/db.ts:runMigrations()`
- Use parameterized queries: `db.run('INSERT INTO x VALUES (?, ?)', [val1, val2])`

### Naming Conventions

- **Files**: kebab-case (`grocery-list.vue`)
- **Components**: PascalCase (`GroceryList.vue`)
- **Variables/functions**: camelCase (`fetchLists`, `currentList`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_ITEMS`)
- **Interfaces**: PascalCase (`GroceryItem`)
- **CSS classes**: kebab-case (`btn-primary`)

### Error Handling

- Use `try/catch` in async actions
- Show errors via toast notifications (use `useToast()`)
- Don't expose internal errors to client; log server-side

### Imports

- Use `~` alias for app directory: `~/stores/grocery`
- Use `~~` alias for project root (server utilities)
- Group imports: external libs, internal modules, components

Example:
```typescript
import { defineStore } from 'pinia'
import { useGroceryStore, type GroceryItem } from '~/stores/grocery'
import Modal from '~/components/Modal.vue'
```

## Key Files

| Path | Purpose |
|------|---------|
| `app/stores/*.ts` | Pinia stores for state management |
| `app/pages/*.vue` | Route pages |
| `app/components/*.vue` | Reusable components |
| `app/layouts/default.vue` | Main layout with sidebar |
| `server/utils/db.ts` | SQLite database initialization/migrations |
| `server/api/**/` | API endpoints |
| `tailwind.config.ts` | Custom colors and theme |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_PATH` | Yes | Path to SQLite DB (e.g., `data/grocery.db`) |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM |
| `OPENROUTER_MODEL` | No | Model name (default: `google/gemini-3-flash-preview`) |
| `NUXT_HOST` | No | Host to bind (default: `0.0.0.0`) |
| `NUXT_PORT` | No | Port to bind (default: `3000`) |

## Common Tasks

### Adding a New API Endpoint

1. Create `server/api/resource/[id].get.ts` (or `.post.ts`, etc.)
2. Use `defineEventHandler` and return data
3. Use `getDatabase()` for DB access
4. Call `saveDatabase()` after mutations

### Adding a New Store

1. Create `app/stores/newstore.ts`
2. Define interfaces for types
3. Export `useNewStore` using setup pattern
4. Import and use in components

### Adding a New Component

1. Create `app/components/NewComponent.vue`
2. Use `<script setup lang="ts">`
3. Define props/emits
4. Import in pages as needed

### Modifying Database Schema

1. Edit `server/utils/db.ts:runMigrations()`
2. Add new `CREATE TABLE` or `ALTER TABLE` statements
3. Test migration works on existing DB
