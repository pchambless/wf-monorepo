# Breadcrumb Implementation

This document outlines our implementation of breadcrumbs based on the requirements in Issue #30.

## Display Fields by Entity Type

For each entity type in hierarchical navigation, we use specific fields for display in breadcrumbs:

### Ingredients Hierarchy
- **IngredientTypes**: Value from `ingrTypeName` field
- **Ingredients**: Value from `ingrName` field
- **IngredientBatches**: Value from `btchNbr` field

### Products Hierarchy
- **ProductTypes**: Value from `prodTypeName` field
- **Products**: Value from `prodName` field
- **ProductBatches**: Value from `btchNbr` field

## Implementation Approach

1. When a row is selected, the value from the appropriate field is extracted
2. The breadcrumb for that level is updated with this value
3. When navigating back, breadcrumbs are truncated to the appropriate level
