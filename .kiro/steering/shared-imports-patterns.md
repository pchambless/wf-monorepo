# Shared Imports Import Patterns

## Import Structure Rules

The `@whatsfresh/shared-imports` package uses a split export pattern to separate React components from utilities:

### React Components (.jsx files)

```javascript
// Import React components from jsx.js index
import {
  MainLayout,
  CrudLayout,
  Modal,
  LoginView,
} from "@whatsfresh/shared-imports/jsx";
import { SelPlan, SelAcct, DataGrid } from "@whatsfresh/shared-imports/jsx";
```

### Utilities and Non-React Code

```javascript
// Import utilities from regular index.js
import {
  createLogger,
  contextStore,
  useContextStore,
} from "@whatsfresh/shared-imports";
import {
  eventTypes,
  getEventType,
  execEvent,
} from "@whatsfresh/shared-imports";
import { createPlan, createAnalysis, api } from "@whatsfresh/shared-imports";
```

## Common Components Available

### From jsx.js:

- **Layouts**: `MainLayout`, `AuthLayout`
- **Navigation**: `AppBar`, `Sidebar`
- **CRUD**: `CrudLayout`, `Form`, `Table`, `DataGrid`
- **Modals**: `Modal`, `useModalStore`, `modalStore`
- **Selectors**: `SelPlan`, `SelAcct`, `SelBrnd`, etc.
- **Auth**: `LoginForm`, `LoginView`, `useAuth`

### From index.js:

- **Stores**: `contextStore`, `useContextStore`
- **EventTypes**: `eventTypes`, `getEventType`, `execEvent`
- **API**: `api`, `createApi`, `execEvent`
- **Workflows**: `createPlan`, `createAnalysis`, `createCommunication`
- **Utilities**: `createLogger`, `debounce`, `deepClone`

## Why This Pattern?

- **jsx.js**: Contains React components that need JSX compilation
- **index.js**: Contains pure JavaScript utilities that work in any environment
- **Prevents**: Import errors and webpack compilation issues
- **Enables**: Tree shaking and better bundle optimization

## Error Prevention

❌ **Wrong**: `import { MainLayout } from '@whatsfresh/shared-imports';`
✅ **Correct**: `import { MainLayout } from '@whatsfresh/shared-imports/jsx';`

❌ **Wrong**: `import { createLogger } from '@whatsfresh/shared-imports/jsx';`
✅ **Correct**: `import { createLogger } from '@whatsfresh/shared-imports';`
