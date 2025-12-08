# Universal App

Database-driven React application that can run as multiple apps via environment variables.

## Running Different Apps

### WhatsFresh (Ingredient Management)
```bash
REACT_APP_NAME=whatsfresh PORT=3004 npm start
```

### Studio (Page Builder)
```bash
REACT_APP_NAME=studio PORT=3005 npm start
```

### Admin (User Management)
```bash
REACT_APP_NAME=admin PORT=3006 npm start
```

## How It Works

1. App loads config from `api_wf.app` table based on `REACT_APP_NAME`
2. Config defines: navbar, sidebar, routes, theme, features
3. PageRenderer loads pages from `api_wf.page_registry`
4. Components load from `api_wf.page_components`

## Architecture

- **One codebase** - All apps share same rendering engine
- **Database-driven** - UI defined in database, not code
- **Template-based** - Pages use templates (CRUD, Recipe Builder, etc.)

## Development

```bash
# Install dependencies
npm install

# Start as whatsfresh
npm start

# Start as studio
REACT_APP_NAME=studio PORT=3005 npm start

# Start as admin
REACT_APP_NAME=admin PORT=3006 npm start
```

## Environment Variables

See `.env.example` for all available configuration options.
