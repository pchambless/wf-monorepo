# WhatsFresh Shared Imports Package

**Core infrastructure only** - API utilities, logging, and static assets for the WhatsFresh monorepo.

## Architecture Philosophy

WhatsFresh uses a **database-driven, self-contained app architecture**:
- ✅ Each app renders its UI from database configuration (eventComp_xref)
- ✅ Apps use DirectRenderer to build layouts from database
- ✅ No shared UI components - apps are independent
- ✅ Shared-imports provides **only** core infrastructure

## What's In This Package

### Core API Utilities
```javascript
import {
  execEvent,      // Execute eventType queries
  execDml,        // Execute DML operations (INSERT, UPDATE, DELETE, SELECT)
  execCreateDoc,  // Create documents from templates
  setVals,        // Set context values
  getVal,         // Get context values
  clearVals,      // Clear context values
  userLogin       // User authentication
} from '@whatsfresh/shared-imports';
```

### Logging Utility
```javascript
import { createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('MyComponent');
log.info('Application started');
log.error('Something failed', { error });
```

### Static Assets
```javascript
// Import logo image
import logo from '@assets/wf-icon.png';
```

## Structure

```
packages/shared-imports/src/
├── api/                # Core API functions
├── assets/             # Static files (logos, icons)
├── utils/
│   ├── logger.js       # Logging utility
│   ├── dml/            # Database utilities
│   └── fileOperations/ # File utilities
├── createDocs/         # Document generation templates
└── stores/
    └── contextStore.js # Runtime context management
```

## What's NOT In This Package

❌ **No UI Components** - Apps render from database using DirectRenderer
❌ **No Layouts** - Each app defines layout in database (eventComp_xref)
❌ **No Forms/Grids** - Rendered dynamically from database config
❌ **No Navigation** - AppBar/Sidebar defined per-app in database

## Migration Notes

If you're looking for old shared components (AppBar, Sidebar, SimpleLayout, forms, grids, etc.), they have been removed. The new architecture uses:

1. **Database-driven layouts** via `eventComp_xref` table
2. **DirectRenderer** in each app to render from database
3. **App-specific components** when needed (no sharing)

See `.claude/new-chat-sessions/` for architecture documentation.
