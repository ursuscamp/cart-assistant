# Technical Specification

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Nuxt.js Application                   │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   Frontend      │  │         Backend             │  │
│  │   (Vuetify)     │  │         (Nitro)             │  │
│  │   - Pages       │  │  - API Routes               │  │
│  │   - Components  │  │  - Database Connection      │  │
│  │   - Stores      │  │  - LLM Service              │  │
│  └─────────────────┘  └─────────────────────────────┘  │
│                          │                              │
│                    ┌─────┴─────┐                       │
│                    │  SQLite   │                       │
│                    │   File    │                       │
│                    └───────────┘                       │
└─────────────────────────────────────────────────────────┘
```

## 2. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | 20.x |
| Framework | Nuxt | 3.x |
| UI Library | Vuetify | 3.x |
| State Management | Pinia | 2.x |
| Database | SQLite | 3.x (via better-sqlite3) |
| LLM | OpenRouter API | - |
| Container | Docker | 3.x |

## 3. Database Schema

### 3.1 Sections Table

```sql
CREATE TABLE sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Lists Table

```sql
CREATE TABLE lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  is_regular_items BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 Ingredients Table

```sql
CREATE TABLE ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT,
  notes TEXT,
  FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);
```

### 3.4 Item Section Mappings Table

```sql
CREATE TABLE item_section_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  section_id INTEGER NOT NULL,
  is_manual_override BOOLEAN DEFAULT 0,
  confidence REAL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id),
  UNIQUE(item_name)
);
```

### 3.5 Grocery Lists Table

```sql
CREATE TABLE grocery_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  week_of DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.6 Grocery List Items Table

```sql
CREATE TABLE grocery_list_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grocery_list_id INTEGER NOT NULL,
  ingredient_name TEXT NOT NULL,
  section_id INTEGER,
  is_checked BOOLEAN DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (grocery_list_id) REFERENCES grocery_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES sections(id)
);
```

### 3.7 Grocery List Sources Table

```sql
CREATE TABLE grocery_list_sources (
  grocery_list_id INTEGER NOT NULL,
  source_list_id INTEGER NOT NULL,
  PRIMARY KEY (grocery_list_id, source_list_id),
  FOREIGN KEY (grocery_list_id) REFERENCES grocery_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (source_list_id) REFERENCES lists(id) ON DELETE CASCADE
);
```

## 4. API Specification

### 4.1 Sections API

#### GET /api/sections

**Response** (200 OK):
```json
[
  { "id": 1, "name": "Produce", "display_order": 0 },
  { "id": 2, "name": "Meat", "display_order": 1 },
  ...
]
```

#### POST /api/sections

**Request**:
```json
{ "name": "New Section" }
```

**Response** (201 Created):
```json
{ "id": 5, "name": "New Section", "display_order": 5 }
```

#### PUT /api/sections/:id

**Request**:
```json
{ "name": "Updated Name" }
```

**Response** (200 OK):
```json
{ "id": 5, "name": "Updated Name", "display_order": 5 }
```

#### DELETE /api/sections/:id

**Response** (204 No Content)

#### POST /api/sections/reorder

**Request**:
```json
{ "sectionIds": [3, 1, 2, 4] }
```

**Response** (200 OK)

### 4.2 Lists API

#### GET /api/lists

**Response** (200 OK):
```json
[
  { "id": 1, "name": "Spaghetti", "is_regular_items": false, "ingredient_count": 5 },
  { "id": 2, "name": "Tacos", "is_regular_items": false, "ingredient_count": 8 },
  ...
]
```

#### GET /api/lists/:id

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Spaghetti",
  "is_regular_items": false,
  "ingredients": [
    { "id": 1, "name": "ground beef", "quantity": "1 lb" },
    { "id": 2, "name": "marinara sauce", "quantity": "1 jar" }
  ]
}
```

#### POST /api/lists

**Request**:
```json
{
  "name": "New List",
  "is_regular_items": false,
  "ingredients": [
    { "name": "item 1", "quantity": "1" },
    { "name": "item 2" }
  ]
}
```

**Response** (201 Created):
```json
{ "id": 5, "name": "New List", "is_regular_items": false }
```

#### PUT /api/lists/:id

**Request**:
```json
{
  "name": "Updated List",
  "ingredients": [
    { "id": 1, "name": "item 1", "quantity": "2" }
  ]
}
```

#### DELETE /api/lists/:id

**Response** (204 No Content)

#### POST /api/lists/import

**Request**:
```json
{ "rawText": "SPAGHETTI:\n1 lb beef\n..." }
```

**Response** (200 OK):
```json
{
  "parsedLists": [
    {
      "name": "Spaghetti",
      "isRegularItems": false,
      "ingredients": [
        { "name": "ground beef", "quantity": "1 lb" }
      ]
    }
  ]
}
```

#### POST /api/lists/import/confirm

**Request**:
```json
{
  "lists": [
    {
      "name": "Spaghetti",
      "isRegularItems": false,
      "ingredients": [{ "name": "ground beef", "quantity": "1 lb" }]
    }
  ]
}
```

**Response** (201 Created)

### 4.3 Grocery Lists API

#### GET /api/grocery-lists

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Week of Feb 1",
    "week_of": "2026-02-01",
    "item_count": 25,
    "checked_count": 10
  }
]
```

#### GET /api/grocery-lists/:id

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Week of Feb 1",
  "week_of": "2026-02-01",
  "sections": [
    {
      "id": 1,
      "name": "Produce",
      "items": [
        { "id": 1, "ingredient_name": "lettuce", "is_checked": false }
      ]
    }
  ],
  "sources": [{ "id": 1, "name": "Spaghetti" }]
}
```

#### POST /api/grocery-lists

**Request**:
```json
{
  "name": "Week of Feb 1",
  "sourceListIds": [1, 2, 3]
}
```

**Response** (201 Created):
```json
{
  "id": 5,
  "name": "Week of Feb 1",
  "sections": [...]
}
```

#### PUT /api/grocery-lists/:id

**Request**:
```json
{ "name": "Updated Name" }
```

#### POST /api/grocery-lists/:id/items

**Request**:
```json
{ "name": "New Item" }
```

**Response** (201 Created)

#### PUT /api/grocery-lists/:id/items/:itemId

**Request**:
```json
{
  "section_id": 2,
  "is_checked": true,
  "sort_order": 0
}
```

### 4.4 LLM API

#### POST /api/llm/sort

**Request**:
```json
{
  "items": ["ground beef", "lettuce", "milk"],
  "existingMappings": { "ground beef": "Meat" }
}
```

**Response** (200 OK):
```json
{
  "assignments": [
    { "item": "ground beef", "section_name": "Meat", "confidence": 0.95 },
    { "item": "lettuce", "section_name": "Produce", "confidence": 0.98 },
    { "item": "milk", "section_name": "Dairy", "confidence": 0.97 }
  ]
}
```

#### POST /api/llm/import-parse

**Request**:
```json
{ "rawText": "SPAGHETTI:\n1 lb beef\n..." }
```

**Response** (200 OK):
```json
{
  "lists": [
    {
      "name": "Spaghetti",
      "ingredients": [{ "name": "ground beef", "quantity": "1 lb" }]
    }
  ]
}
```

## 5. LLM Prompt Strategy

### 5.1 Sorting Prompt

```
You are organizing grocery items into store sections.

EXISTING KNOWLEDGE (respect these):
- "ground beef" → Meat
- "milk" → Dairy

SECTIONS (in store order):
1. Produce
2. Meat
3. Dairy
4. Bakery
5. Frozen
6. Pantry
7. Snacks
8. Beverages

ITEMS TO SORT:
- ground beef
- lettuce
- milk

RULES:
1. Use existing mappings when available
2. Assign unmapped items to most logical section
3. Return valid JSON array with: item, section_name, confidence
```

### 5.2 Import Parsing Prompt

```
You are parsing grocery lists from raw text.

Identify distinct lists/recipes, extract names and ingredients with quantities.

Input:
SPAGHETTI:
1 lb ground beef
1 jar marinara sauce

TACOS:
1 lb ground beef
Taco shells

Output:
{
  "lists": [
    {
      "name": "Spaghetti",
      "ingredients": [
        {"name": "ground beef", "quantity": "1 lb"},
        {"name": "marinara sauce", "quantity": "1 jar"}
      ]
    }
  ]
}

Respond only with valid JSON.
```

## 6. Frontend Pages

### 6.1 Dashboard (/index.vue)

- Recent grocery lists
- Quick create new grocery list
- Quick access to regular items

### 6.2 Lists (/lists.vue)

- List of all dish lists
- Create/Edit/Delete lists
- Import text feature

### 6.3 Grocery List (/grocery/[id].vue)

- View grocery list with sections
- Check/uncheck items
- Drag items between sections
- Add new items

### 6.4 Settings (/settings.vue)

- Manage sections (add/edit/reorder)
- View learned mappings
- LLM configuration display

## 7. State Management (Pinia)

### 7.1 Sections Store

```typescript
interface Section {
  id: number;
  name: string;
  display_order: number;
}

interface SectionsState {
  sections: Section[];
  loading: boolean;
}
```

### 7.2 Lists Store

```typescript
interface List {
  id: number;
  name: string;
  is_regular_items: boolean;
  ingredient_count?: number;
}

interface ListsState {
  lists: List[];
  currentList: List | null;
  loading: boolean;
}
```

### 7.3 Grocery Store

```typescript
interface GroceryList {
  id: number;
  name: string;
  week_of: string;
  sections: SectionWithItems[];
}

interface GroceryState {
  currentList: GroceryList | null;
  loading: boolean;
}
```

## 8. Docker Configuration

### 8.1 Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### 8.2 docker-compose.yml

```yaml
version: '3.8'
services:
  grocery-app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
    environment:
      - DATABASE_PATH=/data/grocery.db
      - NUXT_HOST=0.0.0.0
      - NUXT_PORT=3000
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OPENROUTER_MODEL=google/gemini-3-flash-preview
    restart: unless-stopped
```

## 9. Default Sections (Seed Data)

1. Produce (display_order: 0)
2. Meat (display_order: 1)
3. Seafood (display_order: 2)
4. Dairy (display_order: 3)
5. Eggs (display_order: 4)
6. Bakery (display_order: 5)
7. Frozen (display_order: 6)
8. Pantry (display_order: 7)
9. Canned Goods (display_order: 8)
10. Condiments (display_order: 9)
11. Snacks (display_order: 10)
12. Beverages (display_order: 11)
13. Household (display_order: 12)
14. Other (display_order: 13)
