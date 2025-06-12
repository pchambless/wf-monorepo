# WhatsFresh Client Documentation

## Overview

WhatsFresh is a modular, configurable application built with React that utilizes a DRY (Don't Repeat Yourself) approach to handle hierarchical data relationships and UI patterns.

## Tab Component Architecture

The application uses two primary tab components for different use cases:

### HierTabs (Hierarchical Tabs)

For pages that have parent-child relationships between data in different tabs:

- **Purpose**: Manages hierarchical relationships between tabs
- **Key Features**:
  - Tab enablement based on selections in previous tabs
  - Parent-child data relationships
  - Contextual navigation options
  - Consistent selection management

### JustTabs (Simple Tabs)

For pages that don't have hierarchical relationships:

- **Purpose**: Simple tab navigation without parent-child dependencies
- **Key Features**:
  - Independent tabs
  - Simplified interface
  - No hierarchical dependencies

## How Tab Hierarchy Works

1. **Parent Selection → Child Data**:
   - When a row is selected in a parent tab, its ID is stored
   - Child tabs are enabled only when parent selection exists
   - Child tab data is filtered based on parent selection

2. **Data Flow**:
   - Selection in Tab 0 enables Tab 1
   - Tab 1 data is filtered by Tab 0 selection
   - Selection in Tab 1 enables Tab 2
   - Tab 2 data is filtered by Tab 1 selection

## ID Field Handling

Primary key fields are explicitly defined in tab configuration:

```javascript
{
    label: 'Ingredients',
    columnMap: columnMap.Ingredients,
    listEvent: 'ingrList',
    idField: 'ingrID',      // Primary key for this tab
    parentID: 'ingrTypeID'  // Link to parent ingredient type
}
```

## Event Resolution

The system follows a consistent pattern for resolving events:

1. When a row is selected in a table, the ID field is stored using `setVars(":idField", value)`
2. The `execEvent()` function uses these stored variables to resolve parameters
3. No parameters are attached to event names; they're resolved from stored variables

## Configuration Example

```javascript
export const pageConfig = {
    pageName: 'Ingredients',
    tabConfig: [
        {
            label: 'Ingredient Types',
            columnMap: columnMap.IngrTypes,
            listEvent: 'ingrTypeList',
            idField: 'ingrTypeID'  
        },
        {
            label: 'Ingredients',
            columnMap: columnMap.Ingredients,
            listEvent: 'ingrList',
            idField: 'ingrID',
            parentID: 'ingrTypeID'
        },
        {
            label: 'Batches',
            columnMap: columnMap.IngrBatches,
            listEvent: 'ingrBtchList',
            idField: 'ingrBtchID',
            parentID: 'ingrID'
        }
    ]
};
```

## Contextual Navigation

Tabs can define contextual navigation options that appear only when relevant:

```javascript
const contextualNavigation = [
    {
        label: "View Recipe",
        icon: <MenuBookIcon />,
        sourceTab: 1, // product tab
        requiresSelection: true,
        path: '/recipes',
        onClick: (selection) => {
            navigate('/recipes', { state: { productId: selection?.id } });
        }
    }
];
```

## Creating New Pages

1. **Create a configuration file** defining tabs, columns, and events
2. **Create a presenter** to handle tab-specific logic
3. **Create a page component** that uses either `HierTabs` or `JustTabs`

## Best Practices

1. **Always define `idField`** explicitly for each tab
2. **Use consistent naming patterns** for IDs across related entities
3. **Keep presenter logic focused** on data relationships
4. **Use the action system** for cross-component communication

## Debugging Tips

- Check browser console for detailed tab change and selection logs
- Verify that `setVar` is called with the correct parameter names
- Ensure tab configuration has all required fields
- Use React DevTools to inspect component state
