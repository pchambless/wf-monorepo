# Actions System Documentation

This document describes the centralized action system used in the WhatsFresh application. Actions are dispatched throughout the application and can be subscribed to by various components.

## Action Structure

Each action consists of:
- **Type**: A string identifier for the action (defined in constants.js)
- **Payload**: Data associated with the action

## Core Action Types

### Navigation Actions

| Action Type | Description | Payload | Triggered By | Handled By |
|-------------|-------------|---------|-------------|------------|
| `TAB_SELECT` | User selects a tab | `{ tabIndex, tabId, tabLabel }` | HierTabs tab change | HierPresenter, navigation tracking |
| `PAGE_SELECT` | Navigate to a new page | `{ path, pageName }` | MenuItems, navigation links | Router, breadcrumbs |
| `MODAL_OPEN` | Open a modal dialog | `{ modalId, modalData }` | Various buttons | Modal components |
| `MODAL_CLOSE` | Close a modal dialog | `{ modalId }` | Close button, backdrop click | Modal components |

### Selection Actions

| Action Type | Description | Payload | Triggered By | Handled By |
|-------------|-------------|---------|-------------|------------|
| `ROW_SELECT` | Select a table row | `{ row, tabIndex, tabId }` | Table row click | HierPresenter, form population |
| `ITEM_SELECT` | Select a discrete item | `{ item, itemType, itemId }` | Dropdown, checkbox, etc. | Components requiring selection state |
| `FILTER_APPLY` | Apply a filter to data | `{ filter, listId }` | Filter UI | List components |
| `SORT_CHANGE` | Change sort order | `{ field, direction, listId }` | Column headers | Table components |

### Form Actions

| Action Type | Description | Payload | Triggered By | Handled By |
|-------------|-------------|---------|-------------|------------|
| `FIELD_CHANGED` | Form field value changed | `{ field, value, formId }` | Input fields | Form validation, state updates |
| `SUBMITTED` | Form submitted | `{ formData, formId }` | Submit button | Data saving, API calls |
| `VALIDATED` | Form validation complete | `{ valid, errors, formId }` | Validation process | Form UI, error display |
| `MODE_CHANGED` | Form mode changed | `{ mode, formId }` | Edit/View toggle | Form rendering |
| `REFRESHED` | Form refreshed with new data | `{ formData, formId }` | Data load, reset | Form component |

### CRUD Operations

| Action Type | Description | Payload | Triggered By | Handled By |
|-------------|-------------|---------|-------------|------------|
| `ITEM_CREATE` | Create a new item | `{ item, itemType }` | Create form submission | API calls, list refresh |
| `ITEM_UPDATE` | Update an existing item | `{ item, itemId, itemType }` | Edit form submission | API calls, item refresh |
| `ITEM_DELETE` | Delete an item | `{ itemId, itemType }` | Delete button | API calls, list refresh |
| `LIST_REFRESH` | Refresh a data list | `{ listId, params }` | After CRUD ops, manual refresh | List components |

### UI State Actions

| Action Type | Description | Payload | Triggered By | Handled By |
|-------------|-------------|---------|-------------|------------|
| `STATE_CHANGE` | UI state change | `{ stateId, value }` | Various UI interactions | UI components |
| `LOADING_START` | Begin loading operation | `{ operationId }` | API calls, data fetch | Loading indicators |
| `LOADING_FINISH` | End loading operation | `{ operationId, success }` | API completion | Loading indicators |
| `ERROR_OCCUR` | Error occurred | `{ error, context }` | Error boundary, failed operations | Error display, logging |

## Action Implementation Status

| Action Type | Status | Priority | Description |
|-------------|--------|----------|-------------|
| **Navigation Actions** |
| `TAB_SELECT` | ✅ Implemented | 🔴 High | User selects a tab |
| `PAGE_SELECT` | 🟡 Planned | 🟠 Medium | Navigate to a new page |
| `MODAL_OPEN` | 🟡 Planned | 🟢 Low | Open a modal dialog |
| `MODAL_CLOSE` | 🟡 Planned | 🟢 Low | Close a modal dialog |
| **Selection Actions** |
| `ROW_SELECT` | ✅ Implemented | 🔴 High | Select a table row |
| `ITEM_SELECT` | 🟡 Planned | 🟠 Medium | Select a discrete item |
| `FILTER_APPLY` | 🟡 Planned | 🟢 Low | Apply a filter to data |
| `SORT_CHANGE` | 🟡 Planned | 🟢 Low | Change sort order |
| **Form Actions** |
| `FIELD_CHANGED` | ✅ Implemented | 🔴 High | Form field value changed |
| `SUBMITTED` | ✅ Implemented | 🔴 High | Form submitted |
| `VALIDATED` | ✅ Implemented | 🔴 High | Form validation complete |
| `MODE_CHANGED` | ✅ Implemented | 🔴 High | Form mode changed |
| `REFRESHED` | ✅ Implemented | 🔴 High | Form refreshed with new data |
| **CRUD Operations** |
| `ITEM_CREATE` | ✅ Implemented | 🔴 High | Create a new item |
| `ITEM_UPDATE` | ✅ Implemented | 🔴 High | Update an existing item |
| `ITEM_DELETE` | ✅ Implemented | 🔴 High | Delete an item |
| `LIST_REFRESH` | ✅ Implemented | 🔴 High | Refresh a data list |
| **UI State Actions** |
| `STATE_CHANGE` | ✅ Implemented | 🔴 High | UI state change |
| `LOADING_START` | ✅ Implemented | 🔴 High | Begin loading operation |
| `LOADING_FINISH` | ✅ Implemented | 🔴 High | End loading operation |
| `ERROR_OCCUR` | ✅ Implemented | 🔴 High | Error occurred |

## Using Actions

### Dispatching Actions

```javascript
import { dispatchAction } from '../actions/actionStore';
import { SELECTION } from '../actions/core/constants';

// Dispatch an action
dispatchAction(SELECTION.ROW_SELECT, { row, tabIndex: 1 });
```

### Subscribing to Actions

```javascript
import { subscribeToAction } from '../actions/actionStore';
import { SELECTION } from '../actions/core/constants';

// Subscribe to an action
const unsubscribe = subscribeToAction(SELECTION.ROW_SELECT, (payload) => {
  console.log('Row selected:', payload.row);
});

// Don't forget to unsubscribe when component unmounts
unsubscribe();
```

## Best Practices

1. Always use constants from `constants.js` rather than string literals
2. Keep payloads small and focused - only include necessary data
3. Document new action types in this README
4. Unsubscribe from actions when components unmount
5. Consider action sequence and avoid infinite loops when actions trigger other actions
