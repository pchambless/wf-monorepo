# WhatsFresh Development Rules Collection

*Capturing architectural decisions and development standards as they emerge.*

---

## Database Design Rules

### [CRUD-VIEWS] One Entity Per Row
**Rule:** All CRUD views must return exactly one row per entity instance.
- ✅ **Correct:** `prodBtchList` returns one row per product batch
- ❌ **Incorrect:** Including ingredient details that create multiple rows per product batch
- **Reason:** Essential for clean table displays, edit/delete operations, predictable API responses
- **Exception:** Reporting views can have complex relationships (separate from CRUD)

### [LEGACY-FOUNDATION] Use Proven Legacy Views
**Rule:** Leverage existing legacy views as foundation where they exist, don't rebuild proven business logic.
- **Approach:** Create clean API mapping layer on top of legacy views
- **Example:** `rcpeList` uses `v_prd_rcpe_dtl` foundation
- **Benefit:** Proven business logic, complex joins already solved, consistent calculations

### [VIEW-SEPARATION] CRUD vs Reporting Views
**Rule:** Separate CRUD operations from complex reporting requirements.
- **CRUD Views:** Clean, one-entity-per-row, optimized for operations
- **Reporting Views:** Complex relationships, analytics, detailed traceability
- **Implementation:** Use different view names (e.g., `prodBtchList` vs `prodBtchTraceList`)

---

## UI/Frontend Rules

### [TABLE-HIDE] Auto-Hide Patterns
**Rule:** Certain field types are automatically hidden in table views.
- **Always Hidden:** System fields (`sys: true`, `PK: true`, `parentKey: true`)
- **Always Hidden:** Select widgets (`type: 'select'`) - keep tables clean
- **Always Hidden:** Multi-line text (`type: 'multiLine'`) - too large for tables
- **Always Hidden:** BI fields (`BI: true`) - reporting only, not operational

### [SYSTEM-FIELDS] No Groups for Hidden Fields
**Rule:** System and BI fields don't get `grp` assignments since they're hidden.
- **System fields:** `PK`, `sys`, `parentKey` → no `grp` needed
- **BI fields:** `BI: true` → no `grp` needed  
- **Reason:** Hidden fields don't participate in form layout grouping

### [WIDTH-STRATEGY] Smart Table Width Allocation
**Rule:** Optimize table widths for scanning, not data extremes.
- **Reserve space:** ~80px for action buttons (delete, drill-down)
- **Field types:** Text(120px), Number(80px), Decimal(100px), Date(100px), Boolean(60px)
- **Avoid outliers:** Don't size for "Organic Extra Virgin Olive Oil" - use reasonable defaults
- **Long content:** Belongs in `comments/description` fields, not display fields

---

## Directive System Rules

### [WIDGET-SIMPLIFICATION] Direct Widget Mapping
**Rule:** Use `widget` directive directly, eliminate `selList` redundancy.
- ✅ **New way:** `{ type: 'select', widget: 'selVndr' }`
- ❌ **Old way:** `{ type: 'select', selList: 'vndrList', widget: 'selVndr' }`
- **Reason:** Widget registry already has dataSource mappings, no need for both

### [FIELD-AUTO-MAPPING] Type-Based Widget Resolution
**Rule:** Standard field types auto-map to widgets, only specify widget for specialized components.
- **Auto-mapped:** `type: 'text'` → `TextField`, `type: 'date'` → `DateField`
- **Explicit widget:** Only for specialized components (`selVndr`, `crudTbl`, `rcntIngrBtch`)
- **Result:** Less redundancy, system "just works" for 90% of fields

### [MANUAL-OVERRIDES] Preserve User Customizations
**Rule:** Never overwrite manual customizations during directive generation.
- **Protected:** `label`, `width`, `grp`, `required`, `tableHide`, `formHide`
- **Approach:** Generate smart defaults, but preserve existing manual values
- **Reason:** Respect developer judgment and customizations

### [BI-EXCLUSION] Business Intelligence Field Handling
**Rule:** BI fields are automatically excluded from CRUD operations.
- **Streamlined:** `BI: true` automatically implies exclusion from tables, forms, and DML
- **No redundancy:** Don't specify `tableHide: true`, `formHide: true`, `excludeFromDML: true` when `BI: true`
- **Purpose:** Reporting/analytics only, not for user interaction
- **Examples:** Calculated totals, status summaries, derived analytics

### [POSITIVE-ATTRIBUTES] Only Specify True Values
**Rule:** Only include boolean attributes when they are true, omit when false.
- ✅ **Clean:** `{ "required": true, "tableHide": true }`
- ❌ **Verbose:** `{ "required": true, "tableHide": true, "formHide": false, "searchable": false }`
- **Logic:** Absence implies false for boolean attributes
- **Exception:** Document any cases where `attribute: false` is explicitly needed

### [REQUIRED-DETECTION] Auto-Detect from Database Schema
**Rule:** Use database schema as source of truth for required field detection.
- **Method:** `NOT NULL` columns → `required: true`
- **Override:** Manual override still possible for business logic requirements  
- **Benefit:** Stays in sync with database, reduces manual directive maintenance

---

## API/Integration Rules

### [FIELD-NAMING] Consistent API Conventions
**Rule:** Maintain consistent field naming patterns across views.
- **Primary Keys:** Follow entity-specific patterns (see PRIMARY-KEY-PATTERNS)
- **Names:** `btchNbr`, `ingrName`, `prodName`, `vndrName`
- **Abbreviations:** Follow established patterns (`btch`, `ingr`, `prod`, `vndr`, `brnd`, `meas`)

### [PRIMARY-KEY-PATTERNS] Primary Key Naming Rules
**Rule:** Primary key field names follow predictable patterns to eliminate hardcoding.

#### **CRUD View Primary Keys:**
- **`ingrBtchList`** → `ingrBtchID` (ingredient batch primary key)
- **`prodBtchList`** → `prodBtchID` (product batch primary key)  
- **`ingrList`** → `ingrID` (ingredient master primary key)
- **`prodList`** → `prodID` (product master primary key)
- **`vndrList`** → `vndrID` (vendor primary key)
- **`brndList`** → `brndID` (brand primary key)
- **`measList`** → `measID` (measure primary key)
- **`wrkrList`** → `wrkrID` (worker primary key)
- **`taskList`** → `taskID` (task primary key)
- **`rcpeList`** → `rcpeID` (recipe primary key)
- **`ingrTypeList`** → `ingrTypeID` (ingredient type primary key)
- **`prodTypeList`** → `prodTypeID` (product type primary key)

#### **Admin View Primary Keys:**
- **`acctList`** → `acctID` (account primary key)
- **`userList`** → `userID` (user primary key)

#### **Pattern Rules:**
1. **Entity-specific prefixes:** Batch entities use full context (`ingrBtch`, `prodBtch`)
2. **Master entity keys:** Use entity abbreviation (`ingr`, `prod`, `vndr`, `brnd`)
3. **Type classifications:** Include "Type" in name (`ingrType`, `prodType`)
4. **Consistent suffix:** Always end with `ID`

#### **Implementation Benefits:**
- **Auto-detection:** System can determine primary key from view name
- **DML operations:** Automatic field mapping without hardcoding
- **Form generation:** Automatic hidden field handling
- **API consistency:** Predictable field names across all endpoints

---

## Development Process Rules

### [SIMPLIFICATION-PRIORITY] Eliminate Redundancy
**Rule:** Always look for opportunities to simplify and eliminate redundant patterns.
- **Question:** "Do we need both X and Y, or can one handle both cases?"
- **Examples:** Eliminated `selList` + `widget` redundancy
- **Benefit:** Less cognitive load, fewer moving parts, easier maintenance

### [RULE-CAPTURE] Document Decisions as They Emerge
**Rule:** Capture architectural decisions immediately when agreed upon.
- **Why:** Prevents inconsistency as system grows
- **When:** During code reviews, architecture discussions, problem-solving
- **Format:** Rule name, description, examples, reasoning

---

*This document will be reorganized into proper sections once development patterns stabilize.*