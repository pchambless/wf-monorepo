# HTMX Architecture Assessment & Migration Strategy

**Date**: 2026-01-14  
**Status**: DRAFT - Awaiting Review  
**Purpose**: Comprehensive analysis of current architecture vs HTMX-native patterns

---

## Executive Summary

We have a solid foundation (Big 3 architecture, sp_pageStructure, database-driven approach) but are over-engineering the trigger system. HTMX provides native capabilities that can replace much of our custom triggerBuilt complexity. This assessment identifies what stays, what goes, and what changes.

---

## 1. CURRENT ARCHITECTURE ANALYSIS

### 1.1 What We Have Built (The Big 3)

#### ✅ **SOLID - KEEP AS-IS**

**composites** - Component templates/definitions
- Defines reusable component types (Form, Grid, Button, Select, Container)
- Contains: name, renderer, props schema, style
- **Status**: Core concept is solid

**pageComponents** - Page structure/hierarchy  
- Links pages to composites with positioning
- Contains: pageID, composite_id, parent_id, posOrder, title
- **Status**: Core concept is solid

**pageConfig** - Instance-specific configuration
- Overrides/extends composite defaults for specific instances
- Contains: props, triggers, eventSQL, qryName, qryBase, qryClause
- **Status**: Core concept is solid, but columns need rethinking

#### ✅ **SOLID - KEEP AS-IS**

**sp_pageStructure** - Data delivery mechanism
- Returns complete page data as JSON
- Single source of truth for rendering
- **Status**: Excellent pattern, keep it

**Database-driven approach** - Configuration in DB, not code
- All page structure, triggers, queries in database
- **Status**: Core principle, maintain it

**Simplified renderers** - Single parameter interface
- Renderers accept component object from pageStructure
- **Status**: Clean pattern, keep it

---

### 1.2 What We Over-Engineered

#### 🔄 **NEEDS SIMPLIFICATION**

**triggerBuilt** (JSON in pageConfig/composites)
```json
{
  "submit": {
    "actions": [
      {"userLogin": {"params": {...}, "endpoint": "/controller/userLogin", "htmx_verb": "hx-post"}},
      {"setVals": {"params": [...], "endpoint": "/controller/setVals", "htmx_verb": "hx-post"}}
    ],
    "is_dom_event": 1
  }
}
```

**Problem**: Complex nested JSON that duplicates what HTMX attributes can do natively
**HTMX Native**: `hx-post="/controller/userLogin" hx-trigger="submit"`

---

**trigClass** + **trigAction** (JSON in pageConfig/composites)
- Separate columns for trigger classes and actions
- **Problem**: Redundant with triggerBuilt
- **HTMX Native**: Built into hx-trigger attribute

---

**htmxBuilders** (JavaScript in server/utils/htmxBuilders/)
- Complex logic to parse triggerBuilt JSON and generate HTMX attributes
- **Problem**: Over-engineered for what should be simple attribute generation
- **HTMX Native**: Direct attribute strings from database

---

### 1.3 Database Schema Issues

#### composites table - TOO MANY TRIGGER COLUMNS
```
✅ KEEP: id, category, name, renderer, title, props, style, purpose
🔄 RETHINK: components, layout, dependencies (may not be needed)
❌ REMOVE: eventSQL, trigClass, trigAction, triggers, triggerBuilt
```

**Reason**: Composites should be templates only. Instance-specific triggers belong in pageConfig.

---

#### pageConfig table - TRIGGER COLUMNS NEED REDESIGN
```
✅ KEEP: id, name, category, composite_id, props, qryName, qryBase, qryClause, description
🔄 REDESIGN: trigClass, trigAction, triggerBuilt, eventSQL
```

**Current Problem**: Complex JSON structures that duplicate HTMX capabilities

**Proposed Redesign**: Replace with HTMX-native columns
```sql
-- Instead of triggerBuilt JSON, use simple columns:
hx_trigger VARCHAR(255)      -- e.g., "submit", "load", "loginSuccess from:body"
hx_method VARCHAR(10)         -- e.g., "GET", "POST"
hx_endpoint VARCHAR(255)      -- e.g., "/controller/userLogin"
hx_target VARCHAR(100)        -- e.g., "#results", "this", "closest tr"
hx_swap VARCHAR(50)           -- e.g., "innerHTML", "outerHTML", "none"
hx_vals TEXT                  -- JSON string for parameters
hx_headers TEXT               -- JSON string for custom headers
response_trigger VARCHAR(100) -- HX-Trigger header to send on success
```

---

#### pageComponents table - MOSTLY SOLID
```
✅ KEEP: id, pageID, comp_name, pageConfig_id, composite_id, parent_id, posOrder, title
🔄 CONSIDER: style column (might be redundant with pageConfig)
```

---

## 2. HTMX-NATIVE PATTERNS (From Communication #344)

### 2.1 Cross-Component Communication

**Current Approach** (Over-engineered):
```json
{
  "success": {
    "actions": [
      {"visible": {"params": [{"userAppsGrid": true}]}},
      {"refresh": {"params": ["userAppsGrid"]}}
    ]
  }
}
```

**HTMX Native** (Simple):
```javascript
// Server controller:
res.setHeader('HX-Trigger', 'loginSuccess');
res.send('');

// Grid HTML:
<div hx-trigger="loginSuccess from:body" 
     hx-get="/apps/list">
```

**Benefit**: No custom JavaScript, no complex JSON, server-driven

---

### 2.2 Form Submission Pattern

**Current**: Complex triggerBuilt with multiple actions chained

**HTMX Native**:
```html
<form hx-post="/controller/userLogin" 
      hx-swap="none">
  <!-- Server responds with HX-Trigger: loginSuccess -->
</form>
```

---

### 2.3 Data Loading Pattern

**Current**: execEvent action with eventSQL

**HTMX Native**:
```html
<div hx-get="/api/data" 
     hx-trigger="load" 
     hx-swap="innerHTML">
```

---

## 3. MIGRATION STRATEGY

### Phase 1: Database Schema Redesign (CRITICAL FIRST STEP)

#### Step 1.1: Add HTMX columns to pageConfig
```sql
ALTER TABLE api_wf.pageConfig
ADD COLUMN hx_trigger VARCHAR(255) AFTER triggerBuilt,
ADD COLUMN hx_method VARCHAR(10) AFTER hx_trigger,
ADD COLUMN hx_endpoint VARCHAR(255) AFTER hx_method,
ADD COLUMN hx_target VARCHAR(100) AFTER hx_endpoint,
ADD COLUMN hx_swap VARCHAR(50) AFTER hx_target,
ADD COLUMN hx_vals TEXT AFTER hx_swap,
ADD COLUMN hx_headers TEXT AFTER hx_vals,
ADD COLUMN response_trigger VARCHAR(100) AFTER hx_headers;
```

#### Step 1.2: Migrate existing triggerBuilt to HTMX columns
- Write migration script to parse triggerBuilt JSON
- Extract first action's endpoint, method, params
- Populate new HTMX columns
- **DO NOT DELETE OLD COLUMNS YET** (safety)

#### Step 1.3: Remove trigger columns from composites
```sql
-- After migration complete and tested:
ALTER TABLE api_wf.composites
DROP COLUMN eventSQL,
DROP COLUMN trigClass,
DROP COLUMN trigAction,
DROP COLUMN triggers,
DROP COLUMN triggerBuilt;
```

---

### Phase 2: Update sp_pageStructure

**Current**: Returns triggerBuilt JSON

**New**: Return HTMX attributes as simple fields
```sql
SELECT
  comp_name AS id,
  composite_name,
  css_style,
  props,
  -- HTMX attributes (simple fields, not nested JSON)
  hx_trigger,
  hx_method,
  hx_endpoint,
  hx_target,
  hx_swap,
  hx_vals,
  hx_headers,
  response_trigger
FROM ...
```

---

### Phase 3: Simplify Renderers

**Current**: Renderers call `buildHTMXAttributesFromObject(triggers)`

**New**: Renderers build simple attribute string
```javascript
function renderForm(component) {
  const { hx_trigger, hx_method, hx_endpoint, hx_swap } = component;
  
  let htmxAttrs = '';
  if (hx_trigger) {
    htmxAttrs = `hx-trigger="${hx_trigger}" ${hx_method}="${hx_endpoint}"`;
    if (hx_swap) htmxAttrs += ` hx-swap="${hx_swap}"`;
    if (component.hx_vals) htmxAttrs += ` hx-vals='${component.hx_vals}'`;
  }
  
  return `<form ${htmxAttrs}>${children}</form>`;
}
```

**Benefit**: No complex htmxBuilders logic, just string concatenation

---

### Phase 4: Update Controllers to Use HX-Trigger Headers

**Pattern**: Controllers return HX-Trigger headers for cross-component communication

```javascript
// userLogin.js
if (isHTMX) {
  res.setHeader('HX-Trigger', 'loginSuccess');
  res.send('');
}

// setVals.js
if (isHTMX) {
  res.setHeader('HX-Trigger', 'contextUpdated');
  res.json({ success: true });
}
```

---

### Phase 5: Eliminate htmxBuilders (or Drastically Simplify)

**Current**: 300+ lines of complex logic

**New**: Simple helper functions
```javascript
export function buildHTMXAttributes(component) {
  const parts = [];
  if (component.hx_trigger) parts.push(`hx-trigger="${component.hx_trigger}"`);
  if (component.hx_method && component.hx_endpoint) {
    parts.push(`${component.hx_method}="${component.hx_endpoint}"`);
  }
  if (component.hx_target) parts.push(`hx-target="${component.hx_target}"`);
  if (component.hx_swap) parts.push(`hx-swap="${component.hx_swap}"`);
  if (component.hx_vals) parts.push(`hx-vals='${component.hx_vals}'`);
  return parts.join(' ');
}
```

**Benefit**: 20 lines instead of 300+

---

## 4. WHAT STAYS, WHAT GOES, WHAT CHANGES

### ✅ STAYS (No Changes)

1. **Big 3 Tables** (composites, pageConfig, pageComponents) - Core structure
2. **sp_pageStructure** - Data delivery mechanism
3. **Database-driven approach** - Configuration in DB
4. **Renderer pattern** - Single parameter interface
5. **vw_routePath** - URL routing
6. **qryName, qryBase, qryClause** - Query management

---

### ❌ ELIMINATE

1. **triggerBuilt JSON** - Replace with HTMX columns
2. **trigClass JSON** - Replace with hx_trigger column
3. **trigAction JSON** - Replace with hx_method + hx_endpoint
4. **Complex htmxBuilders logic** - Replace with simple string builder
5. **Trigger columns in composites** - Move all to pageConfig
6. **studio-validate-build-triggers workflow** - Replace with simpler HTMX attribute builder

---

### 🔄 CHANGES

1. **pageConfig schema** - Add HTMX columns, deprecate trigger JSON columns
2. **sp_pageStructure** - Return HTMX fields instead of triggerBuilt JSON
3. **Renderers** - Use simple HTMX attribute strings
4. **Controllers** - Add HX-Trigger response headers
5. **composites table** - Remove trigger-related columns

---

## 5. EXAMPLE: Login Page (Before & After)

### BEFORE (Current Over-Engineered Approach)

**pageConfig.triggerBuilt**:
```json
{
  "submit": {
    "actions": [
      {"userLogin": {"endpoint": "/controller/userLogin", "htmx_verb": "hx-post"}},
      {"setVals": {"endpoint": "/controller/setVals", "htmx_verb": "hx-post"}}
    ]
  },
  "success": {
    "actions": [
      {"visible": {"params": [{"userAppsGrid": true}]}},
      {"refresh": {"params": ["userAppsGrid"]}}
    ]
  }
}
```

**Renderer**:
```javascript
const htmxAttrs = buildHTMXAttributesFromObject(triggers); // 300+ lines of logic
```

**Controller**:
```javascript
res.status(200).json({ success: true }); // No cross-component communication
```

---

### AFTER (HTMX-Native Approach)

**pageConfig columns**:
```
hx_trigger: "submit"
hx_method: "POST"
hx_endpoint: "/controller/userLogin"
hx_swap: "none"
```

**Renderer**:
```javascript
const htmxAttrs = `hx-trigger="submit" hx-post="/controller/userLogin" hx-swap="none"`;
```

**Controller**:
```javascript
res.setHeader('HX-Trigger', 'loginSuccess');
res.send('');
```

**Grid pageConfig**:
```
hx_trigger: "loginSuccess from:body"
hx_method: "GET"
hx_endpoint: "/apps/list"
hx_swap: "innerHTML"
```

**Benefit**: 
- 90% less code
- No JSON parsing
- Server-driven events
- Native HTMX patterns

---

## 6. RISKS & MITIGATION

### Risk 1: Breaking Existing Pages
**Mitigation**: Keep old columns during migration, test thoroughly, migrate incrementally

### Risk 2: Complex Multi-Step Actions
**Mitigation**: Handle on server side (single endpoint does multiple operations), or use HX-Trigger to chain

### Risk 3: Dynamic Parameters ({{value}})
**Mitigation**: Use hx-vals with JavaScript expressions: `hx-vals="js:{value: this.value}"`

### Risk 4: Conditional Logic
**Mitigation**: Multiple components with different triggers, or server-side logic

---

## 7. IMPLEMENTATION PLAN

### Week 1: Schema & Migration
- [ ] Add HTMX columns to pageConfig
- [ ] Write migration script (triggerBuilt → HTMX columns)
- [ ] Test migration on login page
- [ ] Update sp_pageStructure to return HTMX fields

### Week 2: Renderers & Controllers
- [ ] Simplify htmxBuilders to simple string builder
- [ ] Update all renderers to use HTMX fields
- [ ] Add HX-Trigger headers to controllers
- [ ] Test login page end-to-end

### Week 3: Cleanup & Documentation
- [ ] Remove trigger columns from composites
- [ ] Delete old triggerBuilt columns from pageConfig
- [ ] Update studio workflows
- [ ] Document HTMX patterns for team

---

## 8. SUCCESS CRITERIA

✅ Login page works with HTMX-native approach  
✅ Grid loads after successful login via HX-Trigger header  
✅ No triggerBuilt JSON in database  
✅ htmxBuilders reduced from 300+ lines to <50 lines  
✅ All renderers use simple HTMX attribute strings  
✅ Controllers use HX-Trigger headers for cross-component communication  

---

## 9. TRIGGERS TABLE ANALYSIS

### 9.1 Current Structure
```sql
id, trigType, is_dom_event, name, hx_trigger, htmx_verb, content_type, 
endpoint, triggerBuilt, config, example, api_id, wrkFlow_id, controller_id, 
description, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by, active
```

### 9.2 Current Purpose
**Primary Use**: Reference data for `studio-validate-build-triggers` n8n workflow
- Workflow reads triggers table to enhance/validate triggerBuilt column in pageConfig
- Acts as a "trigger registry" or "trigger catalog"
- Two types: `class` (DOM events) and `action` (server operations)

**Example Entries**:
```
CLASS triggers (is_dom_event=1):
- submit → hx_trigger: "submit"
- click → hx_trigger: "click"
- load → hx_trigger: "load"
- change → hx_trigger: "change"

ACTION triggers (is_dom_event=0):
- userLogin → endpoint: "/controller/userLogin", htmx_verb: "hx-post"
- setVals → endpoint: "/controller/setVals", htmx_verb: "hx-post"
- execEvent → endpoint: "/controller/execEvent", htmx_verb: "hx-get"
- refresh → no endpoint (client-side action)
```

### 9.3 Value Assessment

#### ✅ **VALUABLE - KEEP AND ENHANCE**

**Why It's Valuable**:
1. **Single Source of Truth** - All available triggers/actions defined in one place
2. **Validation** - Ensures pageConfig only uses valid triggers
3. **Documentation** - config, example, description fields document usage
4. **Metadata** - Links to api_id, wrkFlow_id, controller_id for traceability
5. **Studio Integration** - Powers the validation workflow

**Current Problem**: Table structure is designed for old triggerBuilt JSON approach

### 9.4 Proposed Redesign for HTMX-Native Architecture

#### Keep These Columns:
```sql
✅ id, trigType, is_dom_event, name, description
✅ api_id, wrkFlow_id, controller_id (traceability)
✅ config, example (documentation)
✅ created_at, created_by, updated_at, updated_by, deleted_at, deleted_by, active
```

#### Redesign These Columns:
```sql
🔄 hx_trigger → Keep but clarify purpose
   - For CLASS triggers: HTMX trigger name (submit, click, load)
   - For ACTION triggers: null (not applicable)

🔄 htmx_verb → Keep but rename to hx_method
   - For ACTION triggers: GET, POST, PUT, DELETE
   - For CLASS triggers: null

🔄 endpoint → Keep
   - For ACTION triggers: controller endpoint
   - For CLASS triggers: null

❌ triggerBuilt → REMOVE (old JSON approach)
   - Replace with simpler structure

🔄 content_type → Keep but clarify
   - Describes expected parameter format
```

#### Add New Columns for HTMX Patterns:
```sql
ADD COLUMN hx_target VARCHAR(100)      -- Default target for this action
ADD COLUMN hx_swap VARCHAR(50)         -- Default swap strategy
ADD COLUMN response_trigger VARCHAR(100) -- HX-Trigger header to send
ADD COLUMN trigger_category VARCHAR(50) -- 'dom', 'custom', 'server-response'
```

### 9.5 Redesigned Triggers Table Schema

```sql
CREATE TABLE triggers (
  -- Identity
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  trigType ENUM('class', 'action') NOT NULL,
  trigger_category ENUM('dom', 'custom', 'server-response') NOT NULL,
  
  -- HTMX Attributes (for building HTML)
  hx_trigger VARCHAR(100),        -- e.g., "submit", "click", "loginSuccess from:body"
  hx_method VARCHAR(10),           -- e.g., "GET", "POST" (for actions only)
  hx_endpoint VARCHAR(255),        -- e.g., "/controller/userLogin"
  hx_target VARCHAR(100),          -- e.g., "this", "#results", "closest tr"
  hx_swap VARCHAR(50),             -- e.g., "innerHTML", "outerHTML", "none"
  
  -- Server Response (for controllers)
  response_trigger VARCHAR(100),   -- HX-Trigger header to send on success
  
  -- Parameter Configuration
  content_type ENUM('string','object','array','number'),
  config JSON,                     -- JSON schema for parameters
  example TEXT,                    -- Example usage
  
  -- Traceability
  api_id INT,
  wrkFlow_id INT,
  controller_id INT,
  description TEXT,
  
  -- Metadata
  is_dom_event TINYINT(1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(50),
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(50),
  active TINYINT(1) GENERATED ALWAYS AS (IF(deleted_at IS NULL, 1, 0)) STORED,
  
  INDEX idx_trigType (trigType),
  INDEX idx_active (active)
);
```

### 9.6 Example Entries (Redesigned)

#### CLASS Trigger (DOM Event):
```sql
INSERT INTO triggers (name, trigType, trigger_category, hx_trigger, is_dom_event, description)
VALUES ('submit', 'class', 'dom', 'submit', 1, 'Form submission event');
```

#### ACTION Trigger (Server Operation):
```sql
INSERT INTO triggers (
  name, trigType, trigger_category, 
  hx_method, hx_endpoint, hx_target, hx_swap,
  response_trigger, content_type, config, example,
  controller_id, is_dom_event, description
)
VALUES (
  'userLogin', 'action', 'dom',
  'POST', '/controller/userLogin', 'this', 'none',
  'loginSuccess',  -- Server sends this HX-Trigger header
  'object',
  '{"type":"object","properties":{"userEmail":{"type":"string"},"enteredPassword":{"type":"string"}}}',
  '{"userEmail": "user@example.com", "enteredPassword": "password123"}',
  26, 0,
  'Authenticate user and trigger loginSuccess event'
);
```

#### CUSTOM Trigger (Server-Sent Event):
```sql
INSERT INTO triggers (
  name, trigType, trigger_category,
  hx_trigger, hx_method, hx_endpoint, hx_swap,
  is_dom_event, description
)
VALUES (
  'loginSuccess', 'class', 'server-response',
  'loginSuccess from:body', 'GET', '/apps/list', 'innerHTML',
  0, 'Triggered by server HX-Trigger header after successful login'
);
```

### 9.7 Role in HTMX-Native Architecture

#### Primary Purpose: **Trigger Registry & Validation**

**For Studio (studio-validate-build-triggers workflow)**:
1. Validate that pageConfig references valid triggers
2. Provide default HTMX attributes for each trigger
3. Generate HTMX attribute strings for rendering
4. Document available triggers for developers

**For Renderers**:
1. Look up default hx_target, hx_swap for actions
2. Build HTMX attribute strings from trigger metadata

**For Controllers**:
1. Look up response_trigger to know what HX-Trigger header to send
2. Document expected parameters via config/example

**For Developers**:
1. Browse available triggers
2. See examples and configuration
3. Understand trigger chains (action → response_trigger → next action)

### 9.8 studio-validate-build-triggers Workflow Evolution

#### Current Workflow (Old Approach):
```
Input: pageConfig.trigClass + pageConfig.trigAction
Process: Build complex triggerBuilt JSON
Output: pageConfig.triggerBuilt (nested JSON)
```

#### New Workflow (HTMX-Native Approach):
```
Input: pageConfig trigger references (simplified)
Process: 
  1. Validate trigger names exist in triggers table
  2. Look up HTMX attributes from triggers table
  3. Merge with pageConfig overrides
  4. Generate simple HTMX attribute strings
Output: pageConfig HTMX columns (hx_trigger, hx_method, hx_endpoint, etc.)
```

**Example**:
```javascript
// Input (pageConfig):
{
  "trigger_class": "submit",
  "trigger_action": "userLogin"
}

// Lookup in triggers table:
// - submit: hx_trigger="submit"
// - userLogin: hx_method="POST", hx_endpoint="/controller/userLogin", hx_swap="none"

// Output (pageConfig columns):
hx_trigger: "submit"
hx_method: "POST"
hx_endpoint: "/controller/userLogin"
hx_swap: "none"
```

### 9.9 Migration Strategy for Triggers Table

#### Phase 1: Add New Columns
```sql
ALTER TABLE api_wf.triggers
ADD COLUMN trigger_category ENUM('dom', 'custom', 'server-response') AFTER trigType,
ADD COLUMN hx_method VARCHAR(10) AFTER hx_trigger,
ADD COLUMN hx_endpoint VARCHAR(255) AFTER hx_method,
ADD COLUMN hx_target VARCHAR(100) AFTER hx_endpoint,
ADD COLUMN hx_swap VARCHAR(50) AFTER hx_target,
ADD COLUMN response_trigger VARCHAR(100) AFTER hx_swap;
```

#### Phase 2: Populate New Columns
```sql
-- Update CLASS triggers
UPDATE api_wf.triggers 
SET trigger_category = 'dom'
WHERE trigType = 'class' AND is_dom_event = 1;

-- Update ACTION triggers
UPDATE api_wf.triggers
SET trigger_category = 'dom',
    hx_method = REPLACE(htmx_verb, 'hx-', ''),
    hx_endpoint = endpoint
WHERE trigType = 'action';

-- Set response triggers for specific actions
UPDATE api_wf.triggers
SET response_trigger = 'loginSuccess'
WHERE name = 'userLogin';
```

#### Phase 3: Remove Old Columns
```sql
-- After migration complete:
ALTER TABLE api_wf.triggers
DROP COLUMN triggerBuilt,
DROP COLUMN htmx_verb;  -- Replaced by hx_method
```

### 9.10 Benefits of Enhanced Triggers Table

1. **Cleaner Architecture** - Triggers table becomes true registry
2. **Better Validation** - Studio workflow validates against known triggers
3. **Easier Development** - Developers browse triggers table to see options
4. **Documentation** - config, example, description document each trigger
5. **Traceability** - Links to controllers, workflows, APIs
6. **HTMX-Native** - Stores HTMX attributes directly, no JSON parsing
7. **Server-Driven Events** - response_trigger documents HX-Trigger headers

---

## 10. QUESTIONS FOR PAUL

1. **Approve schema changes?** Add HTMX columns to pageConfig, remove from composites?
2. **Triggers table redesign?** Add new columns (hx_method, hx_endpoint, hx_target, hx_swap, response_trigger)?
3. **Migration timing?** All at once or page-by-page?
4. **Backward compatibility?** Keep old columns temporarily or clean break?
5. **Studio workflow?** Update studio-validate-build-triggers to use new HTMX columns?
6. **Multi-step actions?** Server-side chaining or client-side HX-Trigger chains?
7. **Trigger categories?** Use 'dom', 'custom', 'server-response' or different categories?

---

## 11. NEXT STEPS (AWAITING APPROVAL)

1. Review this assessment
2. Approve/modify migration strategy
3. Create database migration script
4. Test on login page
5. Roll out to other pages

---

**Status**: DRAFT - Awaiting Paul's review and approval before proceeding
