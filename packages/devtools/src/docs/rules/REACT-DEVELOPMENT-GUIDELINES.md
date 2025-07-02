# React Development Guidelines

## Overview

This document outlines the React development standards and conventions for the WhatsFresh monorepo. Following these guidelines ensures consistency, maintainability, and proper integration across all applications.

## File Extensions and ES Modules

### File Extension Rules

**Use `.jsx` for:**
- React components that contain JSX syntax
- Any file that returns JSX elements
- Component files in `/components/` directories

**Use `.js` for:**
- Utility functions and helpers
- Store files (MobX stores)
- Hook files (custom React hooks)
- Configuration files
- API service files
- Non-JSX JavaScript modules

### ES Module Requirements

All packages use `"type": "module"` - follow these rules:

```javascript
// ✅ Correct - explicit .js/.jsx extensions
import MyComponent from './MyComponent.jsx';
import { myUtility } from './utils/myUtility.js';
import myStore from './stores/myStore.js';

// ❌ Incorrect - missing extensions
import MyComponent from './MyComponent';
import { myUtility } from './utils/myUtility';
```

**Key Points:**
- File extensions are **mandatory** in ES modules
- Use the actual file extension (`.jsx` for JSX files, `.js` for JS files)
- Node.js will not resolve imports without explicit extensions

## Material-UI (MUI) Usage

### Component Import Pattern

```javascript
// ✅ Preferred - named imports for tree shaking
import { 
  Box, 
  Button, 
  TextField, 
  Dialog,
  Grid 
} from '@mui/material';

// ❌ Avoid - default imports hurt bundle size
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
```

### Styling Approach

**Use MUI's sx prop for styling:**

```javascript
// ✅ Preferred - sx prop for component-level styles
<Box 
  sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 2,
    p: 3 
  }}
>

// ✅ Also good - theme-aware styling
<Button 
  sx={{ 
    bgcolor: 'primary.main',
    '&:hover': { bgcolor: 'primary.dark' }
  }}
>
```

**Avoid inline styles and CSS files when possible - leverage MUI's theme system instead.**

### Layout Patterns

```javascript
// ✅ Standard layout pattern
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    <TableSection />
  </Grid>
  <Grid item xs={12} md={6}>
    <FormSection />
  </Grid>
</Grid>
```

## State Management with MobX

### Store Structure

```javascript
// stores/MyStore.js
import { makeAutoObservable } from 'mobx';

class MyStore {
  constructor() {
    makeAutoObservable(this);
  }
  
  // Observable state
  data = [];
  loading = false;
  selectedItem = null;
  
  // Actions
  setData(newData) {
    this.data = newData;
  }
  
  setLoading(isLoading) {
    this.loading = isLoading;
  }
}

// Export singleton instance
export default new MyStore();
```

### Component Integration

```javascript
// ✅ Correct - observer wrapper for reactive components
import { observer } from 'mobx-react-lite';
import myStore from '@stores/myStore.js';

const MyComponent = observer(() => {
  const { data, loading, setData } = myStore;
  
  return (
    <Box>
      {loading ? 'Loading...' : `Data count: ${data.length}`}
    </Box>
  );
});
```

### Store Organization

- **One store per domain** (e.g., `dataStore`, `navigationStore`, `modalStore`)
- **Singleton pattern** - export instance, not class
- **Actions for mutations** - all state changes through actions
- **Computed values** when needed for derived state

## Widget vs Component Architecture

### Widget System (Preferred for Reusable Elements)

**Location:** `/packages/shared-ui/src/widgets/`

```javascript
// widgets/fields/TextField.jsx
import { createFieldWidget } from '../createFieldWidget.js';

export default createFieldWidget({
  name: 'TextField',
  component: MuiTextField,
  defaultProps: { variant: 'outlined' }
});
```

**Use widgets for:**
- Form fields and inputs
- Data display components
- Reusable UI elements across apps
- Components that benefit from registry pattern

### Component System (App-Specific Logic)

**Location:** `/packages/shared-ui/src/components/`

```javascript
// components/1-page/c-crud/CrudLayout/CrudLayout.jsx
import { observer } from 'mobx-react-lite';

const CrudLayout = observer(({ pageMap, dataStore }) => {
  // Complex business logic here
  return <Grid container>...</Grid>;
});
```

**Use components for:**
- Page-level layouts
- Complex business logic containers
- App-specific functionality
- Integration between multiple widgets

## Import Aliases and Path Management

### Monorepo Package Imports

```javascript
// ✅ Correct - use package imports
import { CrudLayout, Modal } from '@whatsfresh/shared-ui';
import { getEventType } from '@whatsfresh/shared-events';
import pageMap from '@whatsfresh/shared-config/src/pageMap/myPage';

// ❌ Avoid - relative path madness
import CrudLayout from '../../../../packages/shared-ui/src/components/CrudLayout';
```

### Local Aliases (within apps)

```javascript
// ✅ App-level aliases in package.json imports field
import dataStore from '@stores/dataStore.js';
import { apiCall } from '@utils/api.js';
import MyComponent from '@components/MyComponent.jsx';
```

## Event-Driven Architecture

### EventType Integration

```javascript
// ✅ Components should reference eventTypes for data
const MyPage = observer(() => {
  useEffect(() => {
    if (pageMap.systemConfig?.listEvent) {
      dataStore.fetchData(pageMap.systemConfig.listEvent);
    }
  }, []);
});
```

### Widget Parameter Requirements

```javascript
// ✅ Widgets declare their parameter dependencies
const SelAcct = createSelectWidget({
  name: 'SelAcct',
  eventType: 'userAcctList',
  params: ['userID'], // Required from context
  valueField: 'acctID',
  displayField: 'acctName'
});
```

## Error Handling and Logging

### Consistent Error Patterns

```javascript
import createLogger from '@utils/logger.js';

const log = createLogger('ComponentName');

const MyComponent = observer(() => {
  const handleError = (error) => {
    log.error('Operation failed:', error);
    modalStore.showError({
      title: 'Error',
      message: error.message
    });
  };
});
```

### Modal Integration

```javascript
// ✅ Use shared modal store
import { modalStore } from '@whatsfresh/shared-ui';

// Show confirmation
modalStore.showConfirmation({
  title: 'Delete Item',
  message: 'Are you sure?',
  onConfirm: () => handleDelete()
});

// Show error
modalStore.showError({
  title: 'Error',
  message: 'Something went wrong'
});
```

## Package Structure Best Practices

### Shared Packages Export Patterns

```javascript
// packages/shared-ui/src/index.js
export { 
  WIDGET_REGISTRY,
  getWidgetById 
} from './registry.js';

export { default as CrudLayout } from './components/1-page/c-crud/CrudLayout/index.js';
export { default as Modal, modalStore } from './components/3-common/a-modal/index.js';
```

### Package.json Configuration

```json
{
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./widgets": "./src/widgets/index.js"
  },
  "files": ["src", "dist"]
}
```

## Development Workflow

### Before Committing

1. **Run type checking** if TypeScript is configured
2. **Verify ES module imports** have proper extensions
3. **Check MobX observer wrapping** on reactive components
4. **Validate widget registry** if adding new widgets
5. **Test cross-package imports** work correctly

### Common Pitfalls to Avoid

- Missing `.js`/`.jsx` extensions in ES module imports
- Forgetting `observer()` wrapper on MobX-reactive components
- Using relative paths instead of package aliases
- Mixing widget and component patterns inappropriately
- Direct DOM manipulation instead of MUI/React patterns

---

## Quick Reference

| Pattern | Use Case | Example |
|---------|----------|---------|
| `.jsx` files | React components with JSX | `CrudLayout.jsx` |
| `.js` files | Utilities, stores, hooks | `dataStore.js` |
| `observer()` | MobX-reactive components | `observer(() => {...})` |
| `sx` prop | Component styling | `sx={{ p: 2, m: 1 }}` |
| Package imports | Cross-package references | `@whatsfresh/shared-ui` |
| Widget registry | Reusable UI elements | `getWidgetById('selAcct')` |

This document should be updated as patterns evolve and new conventions are established.