# Batch Mapping SQL Views Creation

## User Idea
Create the SQL views for the btchMapping page components based on Appsmith implementation. Need to create 3 listEvent SQL views that support the drag-and-drop interaction between Available ↔ Mapped ingredient batches, with recipe list driving the selection.

**Component Flow:**
- **btchMapRcpeList** - Shows recipe ingredients needed (drives selection)
- **btchMapAvailable** - Shows available ingredient batches for selection  
- **btchMapMapped** - Shows ingredient batches already assigned to product batch

**Initial SQL provided for btchMapMapped:**
```sql
select a.ingr_btch_nbr, a.purch_date, a.vndr_name, a.prd_btch_ingr_id
from   whatsfresh.v_prd_btch_ingr_dtl a
where  a.ingr_id = 8
and    prd_btch_id = 2657
order by purch_date desc
```

**Sample Data:**
```json
[
  {
    "ingr_btch_nbr": "GB0291",
    "purch_date": "2023-11-14", 
    "vndr_name": "Restaurant Depot",
    "prd_btch_ingr_id": 23937
  }
]
```

**SQL for btchMapAvailable:**
```sql
select ingr_name, a.ingr_btch_nbr, a.purch_date, a.vndr_name, a.ingr_btch_id, ingr_id
from   v_ingr_btch_dtl a
where  a.ingr_id = 8
and    a.ingr_btch_id not in 
(select ingr_btch_id
 from   v_prd_btch_ingr_dtl
 where  prd_btch_id = 2657
 and    ingr_id = 8)
 order by ingr_btch_id desc
```

**Key Logic:** Shows ingredient batches available for selection (NOT already mapped to the product batch)

**Sample Data:**
```json
[
  {
    "ingr_name": "Garlic - Bulbs",
    "ingr_btch_nbr": "GB0305",
    "purch_date": "2024-08-06",
    "vndr_name": "Restaurant Depot",
    "ingr_btch_id": 3517,
    "ingr_id": 8
  },
  {
    "ingr_name": "Garlic - Bulbs",
    "ingr_btch_nbr": "GB0304",
    "purch_date": "2024-07-30",
    "vndr_name": "Restaurant Depot",
    "ingr_btch_id": 3508,
    "ingr_id": 8
  }
]
```

**SQL for btchMapRcpeList:**
```sql
select *
from whatsfresh.v_prdBtchIngr_Map
where  prd_btch_id = {{tbl_Entity.selectedRow.id}}
order by ingr_ordr
```

**Key Logic:** Shows recipe ingredients for the product batch (drives `ingr_id` selection)

**Sample Data:**
```json
[
  {
    "prd_btch_nbr": "61375",
    "ingr_ordr": 10,
    "ingr_name": "Mustard Seed",
    "ingr_qty_meas": "0.5 Teaspoon",
    "ingrMaps": "MS0034: St.Louis Seasonings",
    "prd_ingr_desc": "1/2 tsp",
    "ingr_id": 14,
    "prd_id": 1,
    "prd_type_id": 3,
    "prd_rcpe_id": 3,
    "prd_btch_id": 2657,
    "btch_qty_meas": "180 Pints"
  },
  {
    "prd_btch_nbr": "61375",
    "ingr_ordr": 20,
    "ingr_name": "Garlic - Bulbs",
    "ingr_qty_meas": "20 Ounce",
    "ingrMaps": "GB0291: Restaurant Depot",
    "prd_ingr_desc": "1 large or  2 Small per jar",
    "ingr_id": 8,
    "prd_id": 1,
    "prd_type_id": 3,
    "prd_rcpe_id": 2,
    "prd_btch_id": 2657,
    "btch_qty_meas": "180 Pints"
  }
]
```

**Key Insight:** The `ingrMaps` field shows current mappings (e.g., "GB0291: Restaurant Depot" for Garlic)

## Complete Data Flow
1. **btchMapRcpeList** - User clicks ingredient row → provides `ingrID` + `prodBtchID`
2. **btchMapAvailable** - Shows unmapped batches for that `ingrID`
3. **btchMapMapped** - Shows mapped batches for that `ingrID` + `prodBtchID`
4. **Drag-and-drop** - Moves `ingrBtchID` between Available ↔ Mapped

**Parameter Convention:** Using WhatsFresh 2.0 naming (`ingrID`, `prodBtchID`, `ingrBtchID`) instead of legacy (`ingr_id`, `prd_btch_id`, `ingr_btch_id`)

**Example Appsmith Parameter Usage:**
```sql
select ingr_name, a.ingr_btch_nbr, a.purch_date, a.vndr_name, a.ingr_btch_id, ingr_id
from   v_ingr_btch_dtl a
where  a.ingr_id = {{tbl_Recipe.selectedRow.ingr_id}}
and    a.ingr_btch_id not in 
(select ingr_btch_id
 from   v_prd_btch_ingr_dtl
 where  prd_btch_id = {{tbl_Entity.selectedRow.id}}
 and    ingr_id = {{tbl_Recipe.selectedRow.ingr_id}})
 order by ingr_btch_id desc
```

**Parameter Flow:**
- `{{tbl_Recipe.selectedRow.ingr_id}}` → `ingrID` parameter
- `{{tbl_Entity.selectedRow.id}}` → `prodBtchID` parameter

## Implementation Impact Analysis

### Impact Summary
- **Files**: 10 (see impact-tracking.json: plan_id="2025-07-15-batch-mapping-sql")
- **Complexity**: Medium (SQL view creation, parameter handling)
- **Packages**: packages/devtools (6), sql/views (4)
- **Blast Radius**: DEVTOOLS (medium), EVENTS (high)

### Impact Tracking Status
- **Predicted**: 8 files
- **Actual**: 10 files (+2 discovered)
- **Accuracy**: 80%
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`

### Plan Dependencies
- **Blocks**: 2025-07-15 Batch Mapping (SQL views must exist first)
- **Blocked by**: None
- **Related**: None currently
- **File Conflicts**: None identified

### Implementation Status Notes
- **EventTypes 100-103**: All configured properly
- **SQL Views**: gridMapped complete, two additional views needed
- **Navigation Flow**: Product-centric workflow implemented
- **Parameter Flow**: :prodBtchID and :ingrID working correctly
- **Naming Convention**: Aligned with Appsmith prototypes

## 🚨 CRITICAL ISSUE DISCOVERED (RESOLVED)

### genDirectives.js Field Categorization Fixed
**Problem:** The `genDirectives.js` was incorrectly marking direct table columns as BI fields, causing them to be hidden from tables.

**Evidence:**
- `ingrList` - `ingrName` and `ingrCode` marked as `BI: true, tableHide: true` (WRONG)
- `prodList` - `prodName` and `prodCode` work correctly (NO BI flags) (CORRECT)

**Root Cause:** DevTools cleanup broke the field categorization logic in FIELD_PATTERNS.

**✅ Resolution Applied:**
- Fixed FIELD_PATTERNS to remove automatic BI flags from Name/Code patterns
- Eliminated inferDirectives fallback function (fail-fast approach)
- Implemented proper sys field cleanup with minimal attributes
- Fixed parent key types from "select" to "number"

**Status:** ✅ RESOLVED - Field categorization now working correctly across all views

## Next Steps
1. **[PRIORITY]** Create remaining SQL views (btchMapAvailable, btchMapRcpe)
2. Test the parameter flow and component interactions
3. Implement drag-and-drop DML operations
4. Update mermaid charts to show component relationships vs navigation
5. Test with real data and iterate on UI/UX

**Key Challenge:** These are components within a single page, not separate navigation targets. Need to represent this correctly in the architecture.

## MVP Context & Business Value

**Current Pain Points:**
- Hand-written batch numbers taped to bushel baskets
- Paper worksheets that can be lost/changed
- No real-time visibility into mapping progress

**MVP Solution:**
- Digital batch mapping entered as work progresses
- Print Product Batch Worksheet when needed (before, during, or after)
- Real-time progress tracking
- Foundation for mobile-friendly production workflow

**Target Users:** Small food production businesses with minimal automation

## Technical Discoveries

### Table Structure
**Target table:** `product_batch_ingredients`
- `id` (auto-increment PK for delete operations)
- `product_batch_id` (FK)
- `ingredient_batch_id` (FK) 
- `product_recipe_id` (FK)
- Other fields: `ingredient_quantity`, `measure_id`, `comments` (mostly optional/derived)

### New Directive Concepts Needed
```json
{
  "helper": true,        // Display-only fields for user recognition
  "display_only": true,  // Don't include in DML operations
  "recognition": true,   // Help users identify batches
  "delete_key": true,    // Use this field for delete operations
  "aggregated": true     // Concatenated display field
}
```

### Grid Widget Implications
- **btchMapMapped**: Individual mapping records (one per batch assignment)
- **Delete operations**: Use `prd_btch_ingr_id` to remove specific mappings
- **Helper fields**: `ingr_btch_nbr`, `purch_date`, `vndr_name` for user recognition

### Complete gridMapped Data Structure
```json
{
  "table": "product_batch_ingredients",
  "rows": [
    {
      "ingrBtchNbr": "D0501",
      "purchDate": "2024-07-23",
      "vndrName": "Midstate Produce",
      "id": 26553,
      "product_recipe_id": 120,
      "ingredient_id": 7,
      "product_batch_id": 2948
    }
  ]
}
```

**Key Fields:**
- `id` - Primary key for delete operations
- `product_recipe_id` - Links to specific recipe step
- `ingredient_id` & `product_batch_id` - Core relationships
- Helper fields - `ingrBtchNbr`, `purchDate`, `vndrName` for recognition

## Implementation Strategy

**Expected Iterations:**
1. Create initial SQL views with proper column aliases
2. Generate directives and test with new directive concepts
3. Configure eventTypes for component parameter flow
4. Iterate based on UI testing and user feedback

**Key Challenge:** These are components within a single page, not separate navigation targets. Need to represent this correctly in the architecture.