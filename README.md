# Cart Assistant

A smart grocery list application that helps you organize your shopping by sorting items into grocery store sections using AI.

## Features

- **Dish Lists Management**: Create and manage lists of ingredients for your favorite recipes
- **Smart Sorting**: Uses LLM to sort grocery items into store sections in the order they appear in your store
- **Learned Preferences**: Manual reordering is remembered for future lists
- **Checklist Mode**: Check off items as you shop
- **Text Import**: Import existing lists by pasting text
- **Section Customization**: Customize section names and order to match your grocery store

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (optional)

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### Running with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f
```

### Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
node .output/server/index.mjs
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_PATH` | Yes | Path to SQLite database file |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM |
| `OPENROUTER_MODEL` | No | LLM model to use (default: google/gemini-3-flash-preview) |
| `NUXT_HOST` | No | Host to bind (default: 0.0.0.0) |
| `NUXT_PORT` | No | Port to bind (default: 3000) |

## Usage

1. **Create Dish Lists**: Go to Lists page and add your recipe ingredients
2. **Configure Sections**: Customize section order in Settings
3. **Create Grocery List**: Select dishes to combine, items will auto-sort
4. **Shop**: Check off items as you go through the store

## API Endpoints

### Sections

- `GET /api/sections` - List all sections
- `POST /api/sections` - Create section
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section
- `POST /api/sections/reorder` - Bulk reorder

### Lists

- `GET /api/lists` - List all dish lists
- `GET /api/lists/:id` - Get list with ingredients
- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `POST /api/lists/import` - Import from text (preview)
- `POST /api/lists/import/confirm` - Confirm import

### Grocery Lists

- `GET /api/grocery-lists` - List all grocery lists
- `GET /api/grocery-lists/:id` - Get grocery list
- `POST /api/grocery-lists` - Create from source lists
- `PUT /api/grocery-lists/:id` - Update grocery list
- `POST /api/grocery-lists/:id/items` - Add item
- `PUT /api/grocery-lists/:id/items/:itemId` - Update item

### LLM

- `POST /api/llm/sort` - Sort items into sections
- `POST /api/llm/import-parse` - Parse imported text

## License

MIT
