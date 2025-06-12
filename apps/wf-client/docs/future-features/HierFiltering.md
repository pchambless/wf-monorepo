# Hierarchical Filtering System

## Overview
A system for implementing dependent filters that allows users to drill down through hierarchical data (e.g., ProductType → Product → Batch).

## Core Concepts
1. **Filter Dependencies**: Filters can depend on other filters, creating a hierarchy
2. **Automatic Loading**: Dependent filters automatically load options based on parent selection
3. **Parameter Passing**: Parent filter values are passed as parameters to child filter data requests
4. **URL Integration**: Filter selections can be persisted in URL parameters for sharing/bookmarking
5. **Automatic Disabling**: Dependent filters are disabled until their parent filter has a value

## Implementation Details

### Data Flow
1. User selects a value in parent filter
2. System loads options for child filters using parent value as parameter
3. Child filters become enabled
4. Selected values are used to filter main table data

### Configuration Example
```javascript
.addPageFilters([
  {
    id: 'prodTypeID',
    label: 'Product Type',
    listEvent: 'prodTypeList'
  },
  {
    id: 'prodID',
    label: 'Product',
    listEvent: 'prodList',
    dependsOn: 'prodTypeID',
    parentParam: 'prodTypeID'
  },
  {
    id: 'batchStatus',
    label: 'Batch Status',
    listEvent: 'batchStatusList'
  }
])
