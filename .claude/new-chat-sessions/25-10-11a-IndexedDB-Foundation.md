# IndexedDB Foundation & Studio Workflows

**Date:** 2025-10-11
**Focus:** IndexedDB schema design, lifecycle management, dropdown references, preview workflow

---

## ✅ Major Accomplishments

### 1. IndexedDB v01 Schema - Clean Development Pattern

**Modular Structure:**
- `/db/versions/` - Schema migrations (v01 during dev, increment for production)
- `/db/operations/` - CRUD operations organized by purpose
- `/db/studioDb.js` - Database instance

**Working Tables** (page-specific, editable):
```javascript
eventComp_xref: '++idbID, id, pageID, comp_name, parent_id, _dmlMethod'
eventTriggers: '++idbID, id, xref_id, class, action, _dmlMethod'
eventProps: '++idbID, id, xref_id, paramName, _dmlMethod'
```

**Master Data Tables** (templates, less frequent edits):
```javascript
eventTypes: '++idbID, id, name, category, _dmlMethod'
eventSQL: '++idbID, id, &qryName, _dmlMethod'
triggers: '++idbID, id, &name, trigType, is_dom_event, _dmlMethod'
```

**Reference Tables** (determined these are unnecessary):
```javascript
// DECISION: Remove ref* tables
// Instead: Query master tables directly with filters
// Example: db.eventTypes.where('category').equals('container')
```

**Key Pattern:**
- `++idbID` - Auto-increment IndexedDB primary key (local operations)
- `id` - MySQL primary key (null until synced)
- `_dmlMethod` - Tracks pending changes: 'INSERT', 'UPDATE', 'DELETE', null

### 2. Lifecycle Operations

**Created modular operations in `/db/operations/`:**

**lifecycleOps.js:**
- `initializeApp()` - Load master data once on startup
- `clearWorkingData()` - Clear page-specific data
- `navigateToPage()` - Safe navigation with unsaved change warnings
- `hasPendingChanges()` - Checks all tables for `_dmlMethod !== null`
- `warnBeforeNavigation()` - Confirms before losing unsaved changes

**componentOps.js, propOps.js, triggerOps.js:**
- CRUD operations for working tables
- Automatic `_dmlMethod` tracking

**masterDataOps.js:**
- CRUD for eventTypes, triggers, eventSQL
- Auto-refresh dependent dropdowns after changes

**syncOps.js:**
- `syncToMySQL()` - Batch sync all pending changes
- `getPendingChanges()` - Summary of unsaved changes
- Per-record sync with error handling

### 3. Data Lifecycle Workflows

**Page Building Workflow:**
```
1. Select app/page → Load from MySQL to IndexedDB
2. Edit components/props/triggers → Set _dmlMethod
3. Preview Changes → Build virtual pageConfig from IndexedDB
4. Save to MySQL → Sync changes, clear _dmlMethod flags
5. Generate PageConfig File → Write physical file from MySQL
```

**Navigation Workflow:**
```
1. User changes page/app
2. Check hasPendingChanges()
3. If changes exist → Confirm dialog
4. If cancelled → Reset dropdown, stay on page
5. If confirmed → clearWorkingData(), load new page
```

**Change Detection:**
- Polls every 1 second: `setInterval(hasPendingChanges, 1000)`
- Updates "Save Changes" button (green when pending, gray when clean)
- Prevents data loss on accidental navigation

### 4. Component Tab Enhancements

**Layout Improvements:**
- ID + Title on same line (ID smaller, 80px width)
- Editable Title field
- Type dropdown (populated from refComponents)
- Container dropdown (populated from refContainers)

**Identified Issues for Future:**
- Type dropdown should combine containers + components
- Container dropdown may not be needed (parent_id determines container)
- Need: Parent dropdown (from current page components)
- Need: posOrder field
- Need: Description textarea

### 5. Query Tab Dropdown

**Query Name Dropdown:**
- Populated from `refSQL` (loaded from MySQL)
- 21 queries available
- Editable when no query detected
- Disabled when query detected from onRefresh trigger

### 6. Virtual Preview Implementation

**Preview Button Workflow:**
```javascript
// OLD: Called server genPageConfig (MySQL data)
const response = await fetch('/api/genPageConfig', {...});

// NEW: Builds from IndexedDB (unsaved changes visible)
const pageConfig = await buildPageConfig(selectedPage);
setPreviewConfig(pageConfig);
```

**Button Order (Top to Bottom):**
1. 👁️ Preview Changes - Virtual preview from IndexedDB
2. 💾 Save to MySQL - Syncs changes (green when pending)
3. 📄 Generate PageConfig File - Writes file from MySQL

**Known Issue:**
- Preview renders but shows colored stripes instead of proper components
- DirectRenderer needs hierarchy tree, getting flat array
- React warnings: PORT, routePath, allowedRoles passed as DOM props
- **Decision:** Fix rendering in future session

### 7. Development vs Production Schema Strategy

**During Development:**
- Use only `v01.js`
- Edit directly when schema changes
- Delete IndexedDB in DevTools + refresh
- Fast iteration, no migration complexity

**Before Production:**
- Copy v01.js → v02.js (preserve history)
- Make breaking changes in v03.js
- Never delete old versions
- Proper migration path for users

### 8. Key Decisions Made

**Reference Tables Are Redundant:**
- Originally: Load refContainers, refComponents, refTriggerActions, refTriggerClasses from MySQL
- Decision: Query master tables directly with filters
- Benefits: No duplication, always current, less code

**Two Distinct Workflows:**

**Page Builder** (Current focus):
- Edit with preview
- Batch save to MySQL
- Uses: eventComp_xref, eventTriggers, eventProps

**Template Manager** (Future):
- Manage master data
- Immediate MySQL sync
- Uses: eventTypes, triggers, eventSQL
- Separate UI section/tab

**Why Separate:**
- Different workflows (preview vs immediate save)
- Different data lifecycle
- Cleaner UX
- Template changes affect all pages

### 9. Bug Fixes

**propUpdater.js - idbID vs id:**
- Was updating by `existing.id` (MySQL key)
- Fixed to `existing.idbID` (IndexedDB key)
- Now properly tracks changes

**clearPageData - Execution Order:**
- Was deleting components before props/triggers
- Fixed to delete children first, then parents
- Proper cleanup on page navigation

**Dropdown Resets on Navigation:**
- Warning dialog triggered on app selection
- Was resetting before reading new value
- Fixed: Read value first, then check warnings

---

## 📊 Statistics

- **Schema versions created:** v01-v08 → Consolidated to v01
- **Files created:** 15
  - 9 schema version files (consolidated)
  - 6 operation modules
  - 2 README files
- **Tables designed:** 9
  - 3 working tables
  - 3 master data tables
  - 3 reference tables (to be removed)
- **Operations created:** 20+
  - Lifecycle: 7
  - Component CRUD: 6
  - Prop CRUD: 5
  - Trigger CRUD: 5
  - Master data: 9
  - Sync: 3

---

## 🚀 Next Steps

### Immediate (Next Session)

1. **Remove Reference Tables**
   - Delete `refContainers`, `refComponents`, `refTriggerActions`, `refTriggerClasses`, `refSQL` from v01
   - Update dropdowns to query master tables directly
   - Remove `referenceLoaders.js`

2. **Component Tab Refactor**
   - Type dropdown: Combine eventTypes (containers + components)
   - Parent dropdown: From current page's eventComp_xref
   - Add posOrder text input
   - Add description textarea
   - Remove container dropdown (redundant)

3. **Connect Component Tab to IndexedDB**
   - Title/Type/Parent/posOrder changes update eventComp_xref
   - Set `_dmlMethod: "UPDATE"` on change
   - Save button syncs to MySQL

4. **Add Discard Button**
   - Clear working data
   - Reload from MySQL
   - Reset UI to clean state

### Short Term

5. **Fix Preview Rendering**
   - DirectRenderer expects nested tree
   - buildPageConfig returns flat array
   - Need hierarchy builder
   - Fix React prop warnings (PORT, routePath, etc.)

6. **Template Manager Section**
   - New "Templates" tab in sidebar
   - Manage eventTypes, triggers, eventSQL
   - Immediate MySQL sync (no preview)
   - CRUD interface for master data

7. **Trigger Tab Enhancements**
   - Class dropdown (from triggers WHERE trigType='class')
   - Action dropdown (from triggers WHERE trigType='action')
   - Content editor (JSON or text)
   - Order field

### Future Enhancements

8. **Component Operations**
   - Add new component to page
   - Delete component
   - Move component (change parent)
   - Reorder components (posOrder)

9. **Bulk Operations**
   - Select multiple components
   - Delete multiple
   - Move multiple

10. **Advanced Features**
    - Copy/paste components
    - Undo/redo
    - Component search/filter
    - Validation (broken references, missing queries)

---

## 💡 Key Learnings

### IndexedDB Concepts

**Schema-less for Data:**
- Schema only defines keys and indexes
- Can store any JavaScript object
- Like MongoDB, not SQL

**Index Prefixes:**
- `++field` - Auto-increment primary key
- `&field` - Unique index
- `[field1+field2]` - Compound index
- `field` - Regular index (duplicates allowed)

**Update Operations:**
- Always reference by primary key (`idbID`)
- `.update(idbID, { changes })`
- NOT by MySQL `id` field

**Filtering:**
- `.where('field').equals(value)` - Indexed query
- `.filter(record => condition)` - Client-side filter
- Chain both for complex queries

### Local-First Pattern

**The Problem:**
- MySQL auto-increment IDs
- Can't reference records before INSERT
- Need local operations before sync

**The Solution:**
```javascript
// Local key (always exists)
++idbID: 1, 2, 3...

// MySQL key (null until synced)
id: null → 123 (after INSERT)

// Track pending changes
_dmlMethod: 'INSERT' | 'UPDATE' | 'DELETE' | null
```

**Workflow:**
1. Create locally: `{ idbID: 1, id: null, _dmlMethod: 'INSERT' }`
2. Reference locally: `db.eventProps.get(idbID)`
3. Sync to MySQL: `execDml({ method: 'INSERT', ... })`
4. Update local: `db.eventProps.update(idbID, { id: 123, _dmlMethod: null })`

### Development Philosophy

**MVP Iteration:**
- Build working foundation first
- Identify issues through use
- Refactor when patterns emerge
- Example: Discovered ref* tables redundant after building

**Modular Extraction:**
- Start in component
- Extract to utils when reused
- Extract to operations when patterns clear
- Result: Clean, maintainable architecture

---

## 📝 Code Snippets for Reference

### Query Master Tables Directly

```javascript
// Instead of refContainers table:
const containers = await db.eventTypes
  .where('category').equals('container')
  .toArray();

// Instead of refComponents table:
const components = await db.eventTypes
  .where('category').equals('component')
  .toArray();

// Instead of refTriggerActions:
const actions = await db.triggers
  .where('trigType').equals('action')
  .toArray();

// Instead of refSQL:
const queries = await db.eventSQL.toArray();
```

### Check for Pending Changes

```javascript
const hasPending = async () => {
  const components = await db.eventComp_xref
    .filter(c => c._dmlMethod !== null)
    .count();

  const triggers = await db.eventTriggers
    .filter(t => t._dmlMethod !== null)
    .count();

  const props = await db.eventProps
    .filter(p => p._dmlMethod !== null)
    .count();

  return components > 0 || triggers > 0 || props > 0;
};
```

### Update with Change Tracking

```javascript
// Option 1: Update existing
await db.eventProps.update(idbID, {
  paramVal: newValue,
  _dmlMethod: existing._dmlMethod || 'UPDATE'
});

// Option 2: Add new
await db.eventProps.add({
  id: null,  // MySQL id (not yet assigned)
  xref_id,
  paramName,
  paramVal,
  _dmlMethod: 'INSERT'
});
```

---

## 🔗 Related Files

- `/apps/studio/src/db/` - Database layer
- `/apps/studio/src/db/versions/` - Schema migrations
- `/apps/studio/src/db/operations/` - CRUD operations
- `/apps/studio/src/utils/pageLoader.js` - Load page data
- `/apps/studio/src/utils/propUpdater.js` - Update props
- `/apps/studio/src/components/StudioSidebar.jsx` - Main UI
- `/apps/studio/src/components/ComponentPropertiesPanel.jsx` - Component editor

---

**Status:** ✅ Foundation complete, ready for iteration
