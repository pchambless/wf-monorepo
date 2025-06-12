# Page Filter Header Component

## Overview
A reusable component that displays configurable filters at the top of a page, enabling users to filter table data based on various criteria.

## Features
- Works with existing Select component
- Supports both independent and dependent filters
- Shows active filters as chips for easy reference
- Integrates with URL parameters for bookmarkable filters
- Automatically manages the loading of filter options
- **Honors existing externalStore values as default selections**

## Component Structure
1. **Filter Controls Row**: Contains Select components for each filter
2. **Active Filters Row**: Shows currently selected filters as chips with remove option
3. **Integration with CrudLayout**: Automatically included when pageFilters is configured

## Default Value Resolution
The component follows this precedence for determining default values:
1. Values from URL parameters (highest priority)
2. Values already in externalStore (e.g., `:ingrTypeID` or `:prodID`)
3. Default values specified in filter configuration
4. Empty/null value (lowest priority)

## Initialization Process
```jsx
// On component mount
useEffect(() => {
  // For each filter
  filterConfig.filters.forEach(filter => {
    // Check for values in this order:
    const urlValue = searchParams.get(filter.id);
    const storeValue = getVar(`:${filter.id}`);
    const configDefault = filter.defaultValue;
    
    // Use first non-empty value found
    const initialValue = urlValue || storeValue || configDefault || '';
    
    if (initialValue) {
      // Set as selected value and trigger dependent filters
      handleFilterChange(filter.id, initialValue, false); // no UI update
    }
  });
}, []);

## Example Implementation

```jsx
<PageFilterHeader
  filterConfig={{
    title: "Filter Products",
    filters: [
      {
        id: "prodTypeID",
        label: "Product Type",
        listEvent: "prodTypeList"
      },
      {
        id: "status",
        label: "Status",
        listEvent: "productStatusList"
      }
    ]
  }}
  onFilterChange={(filters) => {
    // Update table data based on filters
    loadTableData(filters);
  }}
/>
