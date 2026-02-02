# Cart Assistant

A smart grocery list application that helps you organize your shopping by sorting items into grocery store sections using AI.

## Features

- **Dish Lists Management**: Create and manage lists of ingredients for your favorite recipes
- **Smart Sorting**: Uses LLM to sort grocery items into store sections
- **Learned Preferences**: Manual section assignments are remembered for future lists
- **Checklist Mode**: Check off items as you shop
- **Text Import**: Import existing lists by pasting text
- **Section Customization**: Customize section names and order to match your grocery store
- **Mobile-First Design**: Optimized for use in-store on your phone

## Tech Stack

- **Frontend**: Nuxt 3, Vue 3, Headless UI, Tailwind CSS (Dark Forest theme)
- **Backend**: Nuxt server routes (Nitro), SQLite via sql.js
- **AI**: OpenRouter API for LLM-powered sorting
- **State Management**: Pinia

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

### Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Running with Docker

```bash
# Build image
docker build -t cart-assistant .

# Run container
docker run -p 3000:3000 -v ./data:/data -e DATABASE_PATH=/data/grocery.db cart-assistant
```

Or use docker-compose:

```bash
docker-compose up -d
```

### Production Build

```bash
# Build for production
npm run build

# Run the production server
node .output/server/index.mjs
```

### GitHub Container Registry

Docker images are automatically built and pushed to GHCR on version tags:

```bash
# Pull latest image
docker pull ghcr.io/ursuscamp/cart-assistant:latest

# Run with environment variables
docker run -p 3000:3000 -v ./data:/data \
  -e DATABASE_PATH=/data/grocery.db \
  -e OPENROUTER_API_KEY=your-key \
  ghcr.io/ursuscamp/cart-assistant:latest
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_PATH` | Yes | Path to SQLite DB (e.g., `data/grocery.db`) |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM |
| `OPENROUTER_MODEL` | No | Model name (default: `google/gemini-3-flash-preview`) |
| `NUXT_HOST` | No | Host to bind (default: `0.0.0.0`) |
| `NUXT_PORT` | No | Port to bind (default: `3000`) |

## Usage

1. **Create Dish Lists**: Go to Lists page and add your recipe ingredients
2. **Configure Sections**: Customize section order in Settings
3. **Create Grocery List**: Select dishes to combine, items will auto-sort
4. **Shop**: Check off items as you go through the store

## For Developers

See [AGENTS.md](AGENTS.md) for development guidelines, code style, and common tasks.

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
- `DELETE /api/grocery-lists/:id/items/:itemId` - Delete item
- `POST /api/grocery-lists/:id/add-source` - Add source list
- `POST /api/grocery-lists/:id/reorder-sections` - Reorder sections

### Item Mappings

- `GET /api/mappings` - List all item-section mappings
- `POST /api/mappings` - Create mapping
- `PUT /api/mappings/:itemName` - Update mapping
- `DELETE /api/mappings/:itemName` - Delete mapping

## License

MIT
