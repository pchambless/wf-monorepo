# Composite Architecture Evaluation

**Request for GitHub Copilot Analysis**

## Context

We're transitioning from a complex 4-table component system to a unified composite architecture. We need to determine:

1. What should `sp_pageStructure` return to minimize PageRenderer complexity?
2. What does universal-app need at startup vs. per-page navigation?
3. Where should data transformation happen (database, server, client)?

---

## Current Architecture (Pain Points)

### Database Schema - 4 Tables Creating Complexity

```sql
-- Current system requires joining 4 tables:
eventComp_xref         -- Component placement on pages
  ↓
eventType              -- Component type definitions
  ↓
eventProps             -- Component properties (key-value pairs)
  ↓
eventTriggers          -- Component behaviors (onClick, onLoad, etc.)
```

**Pain Point:** Multiple joins, scattered data, complex queries

### sp_pageStructure Current Output

Returns flat list of components with JSON strings:

```json
[
  {
    "xref_id": 123,
    "pageID": 5,
    "comp_name": "Grid",
    "comp_type": "Grid",
    "posOrder": "01,01,00,left",
    "props": "{\"qryName\":\"brndGrid\"}",     // ← JSON string
    "triggers": "[{\"class\":\"onClick\"}]"   // ← JSON string
  }
]
```

**Client-Side Transformation** (fetchConfig.js lines 76-183):
- Parse JSON strings → objects
- Parse posOrder string → position object
- Group triggers by class → workflow format
- Build flat list → hierarchical tree
- Match parents/children using xref_id lookups

**Pain Point:** 200+ lines of client-side data transformation logic

### PageRenderer Complexity (PageRenderer.jsx)

**Current responsibilities:**
- State management (dataStore, contextStore, formData, selectedRows)
- Component mapping/lookup (componentMap, findComponentById)
- Layout separation (appBar, sidebar, modals, regular components)
- Row grouping and alignment
- Recursive component rendering
- Modal rendering
- Trigger execution context

**Pain Point:** 172 lines doing too much work

---

## Proposed Composite Architecture

### New Schema - 3 Tables

```sql
eventComposite         -- Reusable component templates with embedded props/triggers/queries
  ↓
pageComponents         -- Page instances referencing composites + positioning
  ↓
eventPageConfig        -- Page-specific overrides (optional)
```

### Composite Structure Decision

**Components array moves from simple strings to structured objects:**

```json
{
  "name": "AppNavigation",
  "components": [
    {
      "type": "Select",
      "name": "SelApp",
      "position": "01,01,00,left",
      "props": {
        "qryName": "SelApps",
        "labelKey": "name",
        "valueKey": "id"
      },
      "triggers": [
        {
          "class": "onChange",
          "action": "setVals",
          "params": ["appID", "{{this.value}}"]
        }
      ],
      "eventSQL": {
        "SelApps": "SELECT id, name FROM app WHERE active=1"
      }
    }
  ]
}
```

**Two-Level Configuration:**

1. **Composite Level** (Reusable) - Complete components like AppNavigation
2. **Page Level** (Instance-Specific) - Overrides for CRUD grids/forms per page

---

## Universal-App Startup Flow

### Current Startup (App.jsx lines 86-149)

```javascript
1. Health checks
2. Session validation
3. SessionCache initialization (user data)
4. Set appName in context_store (one-time)
5. Load page_registry cache (all pages)
6. Fetch eventTypeConfig (component type definitions)
```

### Per-Page Navigation (App.jsx lines 17-59)

```javascript
1. navigateToPage(pageID) - Sets pageID in context
2. fetchPageStructure(pageID) - Calls sp_pageStructure
3. fetchPageByID - Gets page metadata
4. buildComponentHierarchy - Transforms flat → tree
5. validatePageStructure - Checks integrity
6. Render PageRenderer with config
```

---

## Key Questions for Evaluation

### Question 1: sp_pageStructure Output Structure

**Option A - Return Flat JSON Strings (Current)**
- Minimal database processing
- Heavy client-side transformation
- 200+ lines of parsing logic in fetchConfig.js

**Option B - Return Hierarchical JSON Objects**
- Database does the work (JSON_OBJECT, JSON_ARRAYAGG)
- Client receives ready-to-use structure
- Reduced client-side code

**Option C - Hybrid Approach**
- Database handles composite merging (template + overrides)
- Returns structured components array
- Client does minimal assembly

**Which approach minimizes overall complexity?**

### Question 2: Data Transformation Location

Where should these transformations happen?

| Transformation | Database | Server API | Client |
|---|---|---|---|
| Merge composite + page overrides | ? | ? | ? |
| Parse posOrder → position object | ? | ? | ? |
| Group triggers by class | ? | ? | ? |
| Build component hierarchy | ? | ? | ? |
| Resolve eventSQL queries | ? | ? | ? |

**Considerations:**
- Database is fastest for data operations
- Server can cache and reuse transformations
- Client flexibility vs. performance trade-off

### Question 3: PageRenderer Simplification

Given composite architecture, can PageRenderer be simplified?

**Current PageRenderer does:**
1. Component mapping (componentMap)
2. Layout separation (appBar/sidebar/modals)
3. Row grouping and alignment
4. Recursive rendering
5. State management

**Could sp_pageStructure provide:**
- Pre-separated components by type (appBar, sidebar, modals, content)?
- Pre-grouped rows with alignment metadata?
- Flattened render order vs. hierarchical structure?

**What's the right division of labor?**

### Question 4: Composite Position Management

**Two position levels exist:**

1. **Composite internal positioning** - How components arrange WITHIN composite
2. **Page-level positioning** - Where composite appears ON page

**Example:**
```sql
-- AppNavigation composite has internal layout:
"components": [
  {"type": "Select", "position": "01,01,00,left"},   -- First select
  {"type": "Select", "position": "01,02,00,left"}    -- Second select, same row
]

-- Page instance positions the whole composite:
INSERT INTO pageComponents (pageID, comp_name, composite_id, position)
VALUES (5, 'MyNav', 1, '01,01,00,left');  -- Top of page
```

**Should sp_pageStructure:**
- Return composites as single units with nested components?
- Flatten composite components into page structure?
- Provide both (composite metadata + flattened render list)?

---

## Sample Data for Testing

### eventComposite Examples

**1. AppNavigation (Multi-Component)**
```json
{
  "id": 1,
  "name": "AppNavigation",
  "components": [
    {
      "type": "Select",
      "name": "SelApp",
      "position": "01,01,00,left",
      "props": {"qryName": "SelApps"},
      "triggers": [{"class": "onChange", "action": "setVals"}],
      "eventSQL": {"SelApps": "SELECT id, name FROM app"}
    },
    {
      "type": "Select",
      "name": "SelAppPage",
      "position": "01,02,00,left",
      "props": {"qryName": "SelAppPages"},
      "triggers": [{"class": "onChange", "action": "setVals"}],
      "eventSQL": {"SelAppPages": "SELECT pageID, label FROM page_registry"}
    }
  ]
}
```

**2. CRUDGrid (Template with Page Overrides)**
```json
// Composite (generic template):
{
  "id": 5,
  "name": "CRUDGrid",
  "components": [
    {
      "type": "Grid",
      "name": "GridComponent",
      "position": "01,01,00,left",
      "props": {"qryName": null},  // Will be overridden
      "triggers": [{"class": "onRowClick", "action": "setVals"}],
      "eventSQL": null  // Will be overridden
    }
  ]
}

// Page-specific override (brands page):
{
  "pageID": 5,
  "comp_name": "brndGrid",
  "composite_id": 5,
  "props": {"qryName": "brndGrid"},
  "eventSQL": {"brndGrid": "SELECT * FROM brands"}
}
```

---

## Current Code Stats

- **sp_pageStructure**: ~80 lines SQL
- **vw_pageComponents**: Joins eventComp_xref + eventPageConfig
- **fetchConfig.js**: 313 lines (200+ for transformation)
- **PageRenderer.jsx**: 172 lines
- **Total complexity**: ~600 lines handling component assembly/rendering

---

## Success Criteria

**Goal:** Minimize total system complexity while maintaining flexibility

**Metrics:**
- Reduced client-side transformation code (current: 200+ lines)
- Simplified PageRenderer (target: <100 lines?)
- Faster page load (fewer transformations)
- Maintainable sp_pageStructure (readable SQL)
- Clear separation of concerns

---

## Request for GitHub Copilot

Please analyze this architecture and recommend:

1. **Optimal sp_pageStructure output format** - What structure minimizes overall complexity?
2. **Data transformation strategy** - Which layer (DB/Server/Client) should handle each transformation?
3. **PageRenderer simplification opportunities** - What can be pre-computed vs. runtime?
4. **Composite flattening approach** - Should composites stay nested or flatten for rendering?
5. **Potential gotchas** - What edge cases or performance issues should we anticipate?

Consider the full system holistically - the "best" database approach might create client-side complexity, and vice versa.
