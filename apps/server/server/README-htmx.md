# HTMX Rendering Infrastructure

## Overview

This folder contains the loaders, renderers, and route for the database-driven HTMX rendering system.

### Key Files

- `loaders/renderRegistry.js`: Loads base-components from `vw_HTMXRegistry` and maps to renderer functions.
- `loaders/compositeLoader.js`: Loads all composites from `vw_Composites` and keys by name.
- `renderers/`: Contains all renderer modules for base-components.
- `routes/htmxRoutes.js`: Express route for rendering pages by composite name.
- `app-htmx.js`: Minimal Express app to serve HTMX-rendered pages.
- `utils/db.js`: Minimal DB utility (replace with your actual connection logic).

## Usage

1. Ensure your database has the views `api_wf.vw_HTMXRegistry` and `api_wf.vw_Composites`.
2. Start the app:

```bash
node apps/server/server/app-htmx.js
```

3. Access a page:

```
GET http://localhost:3010/PageName
```

## Extending
- Add new base-component renderers in `renderers/` and update the registry view as needed.
- Composites and their structure are managed in the database.

---
This system is fully database-driven for maximum flexibility and maintainability.
