# Requirements Document

## 1. Overview

Cart Assistant is a single-user grocery list management web application designed for home deployment. It eliminates manual grocery list organization by using AI to sort items into grocery store sections.

## 2. Functional Requirements

### 2.1 Dish Lists Management

**REQ-001**: Users shall be able to create, read, update, and delete dish lists
- Each list has a unique name
- Each list contains ingredients with optional quantity and notes
- Regular items list is marked as such

**REQ-002**: Users shall be able to import lists from pasted text
- LLM parses raw text into structured lists
- Preview step allows review before import
- Users can select which parsed lists to import

### 2.2 Section Management

**REQ-003**: Users shall be able to create, read, update, and delete sections
- Sections represent store areas (produce, meat, dairy, etc.)
- Each section has a unique name
- Sections have a configurable display order

**REQ-004**: Users shall be able to reorder sections
- Drag-and-drop reordering
- New items sort into correct section based on learned mappings

### 2.3 Grocery List Creation

**REQ-005**: Users shall be able to combine multiple dish lists
- Select one or more source lists
- Items are deduplicated (quantity preserved separately if needed)
- New combined list is created

**REQ-006**: Items shall be sorted into sections automatically
- Uses learned item-section mappings first
- For unknown items, LLM determines appropriate section
- Preserves all items including duplicates

### 2.4 Grocery List Interaction

**REQ-007**: Users shall be able to add individual items to grocery lists
- New items are sorted via LLM
- Added items can be manually moved to different sections

**REQ-008**: Users shall be able to add additional source lists to existing grocery lists
- Forgotten lists can be added post-creation
- New items are sorted into appropriate sections

**REQ-009**: Users shall be able to move items between sections
- Drag-and-drop between sections
- Movement updates learned mappings for future use

**REQ-010**: Users shall have a checklist for shopping
- Items can be checked/unchecked
- Checked items are visually distinct

### 2.5 Learning and Persistence

**REQ-011**: Manual section assignments shall be remembered
- When user moves item to different section, store as manual override
- Manual overrides take precedence over LLM suggestions

**REQ-012**: All data shall persist across sessions
- SQLite database for persistence
- No login required (assumes reverse proxy authentication)

## 3. Non-Functional Requirements

### 3.1 Performance

**NFR-001**: Page loads shall complete within 2 seconds
**NFR-002**: LLM sorting shall complete within 10 seconds for typical lists (<100 items)

### 3.2 Reliability

**NFR-003**: Application shall recover from database errors gracefully
**NFR-004**: LLM calls shall have timeout handling

### 3.3 Usability

**NFR-005**: Application shall be usable on mobile devices
**NFR-006**: Application shall provide visual feedback for all actions

### 3.4 Security

**NFR-007**: API key shall not be exposed to client
**NFR-008**: Application assumes deployment behind authenticated reverse proxy

## 4. Technical Requirements

### 4.1 Stack

- **Frontend**: Nuxt.js 3, Vue 3, Vuetify 3
- **Backend**: Nuxt server routes (Nitro)
- **Database**: SQLite with better-sqlite3
- **AI**: OpenRouter API (google/gemini-3-flash-preview)
- **Deployment**: Docker

### 4.2 Environment

- Single Docker container
- SQLite database persisted via volume mount
- Configurable via environment variables

## 5. Data Model

### 5.1 Entities

| Entity | Description |
|--------|-------------|
| Section | Grocery store sections with display order |
| List | Dish/recipe lists containing ingredients |
| Ingredient | Individual ingredient within a list |
| ItemSectionMapping | Learned item to section assignments |
| GroceryList | Generated shopping lists |
| GroceryListItem | Individual item in a grocery list |
| GroceryListSource | Many-to-many relationship |

### 5.2 Relationships

```
Section 1───* ItemSectionMapping
List 1───* Ingredient
GroceryList 1───* GroceryListItem
GroceryList *───* List (via GroceryListSource)
GroceryListItem *─── Section
```

## 6. Constraints

- Single-user only (no authentication in app)
- Must work behind reverse proxy with external auth
- Must use SQLite (no external database server)
- Must use OpenRouter for LLM
