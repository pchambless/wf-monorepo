# Directive Rules and Conventions

This document outlines the rules and conventions for field directives used in the WhatsFresh pageMap generation system.

## Overview

Directives control how fields are displayed and behave in both table and form views. They are defined in JSON files that correspond to SQL views and are processed by `genPageMaps.js` to generate pageMap configurations.

## Auto-Hide Rules

### Fields Always Hidden in Tables AND Forms:
- **`primaryKey: true`** - Primary key fields (e.g., `btchID`, `ingrID`)
- **`parentKey: true`** - Parent relationship fields (e.g., `ingrID` in ingredient batches)

### Fields Hidden in Tables Only (visible in forms):
- **`type: "multiLine"`** - Multi-line text fields (comments, descriptions)
- **`type: "select"`** - Select/dropdown fields (vendor, brand, measure selectors)

### Business Intelligence Fields (excluded from CRUD):
- **`BI: true`** - Fields used for reporting/analytics only (automatically hidden from tables, forms, and excluded from DML operations)

## Field Type Conventions

### Data Types:
- **`type: "text"`** - Single-line text, visible in both tables and forms
- **`type: "number"`** - Integer values
- **`type: "decimal"`** - Decimal values (use `dec` property for precision)
- **`type: "date"`** - Date fields
- **`type: "select"`** - Dropdown/lookup fields (requires `selList` property)
- **`type: "multiLine"`** - Multi-line text areas

### System Fields:
- **`sys: true`** - System fields (typically combined with `primaryKey` or `parentKey`)

### Business Intelligence Fields:
- **`BI: true`** - Business intelligence fields (automatically excluded from tables, forms, and DML operations)

## Property Reference

### Core Properties:
- **`type`** - Field data type (required)
- **`label`** - Display label for the field
- **`width`** - Column width in tables (string format, e.g., "120")
- **`grp`** - Form group number for organizing fields (string format)

### Validation Properties:
- **`required`** - Whether field is required in forms (boolean)
- **`dec`** - Decimal precision for numeric fields (e.g., "10,2")

### Behavior Properties:
- **`searchable`** - Whether field is searchable in tables (boolean)
- **`tableHide`** - Force hide in tables (boolean)
- **`formHide`** - Force hide in forms (boolean)
- **`editable`** - Whether field is editable (defaults based on field type)

### Relationship Properties:
- **`selList`** - Entity name for select field options (e.g., "vndrList")
- **`valField`** - Value field for select options
- **`dispField`** - Display field for select options

### Key Properties:
- **`PK`** - Primary key indicator (boolean, implies `primaryKey: true`)
- **`primaryKey`** - Primary key field (boolean)
- **`parentKey`** - Parent relationship field (boolean)
- **`BI`** - Business intelligence field (boolean, auto-excludes from CRUD operations)

## Grouping Conventions

Form fields are organized into numbered groups for better UX:
- **Group 1** - Primary identification fields (names, codes, required selectors)
- **Group 2** - Secondary classification fields (brands, categories)
- **Group 3** - Quantity and measurement fields
- **Group 4** - Dates and reference information
- **Group 5** - Comments and notes (typically `tableHide: true`)

## Naming Patterns

### Field Naming:
- IDs typically end with `ID` (e.g., `ingrID`, `vndrID`, `brndID`)
- Abbreviations follow consistent patterns:
  - `btch` = batch
  - `ingr` = ingredient
  - `prd`/`prod` = product
  - `vndr` = vendor
  - `brnd` = brand
  - `meas` = measure

### Select List Naming:
- Select lists reference other view names (e.g., `selList: "vndrList"`)
- Must match existing eventType/view names for proper data loading

## Best Practices

1. **Start Conservative** - New calculated fields should initially use `tableHide: true`
2. **Consistent Labeling** - Use proper case and consistent terminology
3. **Logical Grouping** - Group related fields together using `grp` property
4. **Width Optimization** - Set appropriate widths based on content length
5. **Required Fields** - Mark essential fields as `required: true`

## TODO: Rules to Document

- [ ] Additional auto-hide patterns
- [ ] Width conventions by field type
- [ ] Validation rule patterns
- [ ] Icon and color conventions
- [ ] Action button configurations
- [ ] Error handling patterns

---

*This document is maintained as directive rules are discovered and refined during development.*