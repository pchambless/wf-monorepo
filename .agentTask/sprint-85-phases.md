# Sprint 85: HTMX-Native Architecture Migration

**Epic**: Plan 75 - Composite Architecture Infrastructure  
**Sprint**: 85 - HTMX-Native Migration  
**Status**: Planning  
**Priority**: Critical

---

## Overview

Migrate from custom trigger system to HTMX-native patterns. Simplify architecture by leveraging HTMX's built-in capabilities instead of reinventing them.

**Key Principle**: HTMX is simple. Our architecture should be too.

---

## Phase 1: Database Schema Changes

### 1.1 Simplify Triggers Table
**Goal**: Reduce from 22 columns to 11 columns

**Actions**:
```sql
-- Add new simplified columns
ALTER TABLE api_wf.triggers
ADD COLUMN trigger_category ENUM('event', 'action') AFTER trigType,
ADD COLUMN default_method VARCHAR(10) AFTER hx_trigger,
ADD COLUMN default_endpoint VARCHAR(255) AFTER default_method,
ADD COLUMN default_swap VARCHAR(50) AFTER default_endpoint;

-- Migrate data from old columns to new
UPDATE api_wf.triggers
SET default_method = REPLACE(htmx_verb, 'hx-', ''),
    default_endpoint = endpoint,
    trigger_category = IF(is_dom_event = 1, 'event', 'action');

-- Remove old columns (after validation)
ALTER TABLE api_wf.triggers
DROP COLUMN triggerBuilt,
DROP COLUMN htmx_verb,
DROP COLUMN content_type,
DROP COLUMN config,
DROP COLUMN api_id,
DROP COLUMN wrkFlow_id,
DROP COLUMN controller_id,
DROP COLUMN is_dom_event;
```

**Validation**:
- [ ] Verify all triggers have default_method/default_endpoint populated
- [ ] Test queries against new schema
- [ ] Backup old columns before dropping

**Deliverable**: Simplified triggers table (11 columns)

---

### 1.2 Add HTMX Columns to pageConfig
**Goal**: Replace triggerBuilt JSON with simple HTMX columns

**Actions**:
```sql
-- Add HTMX attribute columns
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

**Migration Script**:
- Parse existing triggerBuilt JSON
- Extract first action's endpoint, method, params
- Populate new HTMX columns
- **Keep old columns temporarily** for safety

**Validation**:
- [ ] Migrate login page (pageConfig id=15, 16, 17)
- [ ] Verify HTMX columns populated correctly
- [ ] Test rendering with new columns

**Deliverable**: pageConfig with HTMX columns populated

---

### 1.3 Remove Trigger Columns from Composites
**Goal**: Composites become templates only, no instance-specific triggers

**Actions**:
```sql
-- After pageConfig migration complete:
ALTER TABLE api_wf.composites
DROP COLUMN eventSQL,
DROP COLUMN trigClass,
DROP COLUMN trigAction,
DROP COLUMN triggers,
DROP COLUMN triggerBuilt;
```

**Validation**:
- [ ] Verify no code references composites trigger columns
- [ ] Verify all triggers moved to pageConfig
- [ ] Backup before dropping

**Deliverable**: Clean composites table (structure only)

---

## Phase 2: n8n Workflow Changes

### 2.1 Create htmx-trigger-build Workflow
**Goal**: Replace studio-validate-build-triggers with simpler workflow

**New Workflow Logic**:
```
Input: pageConfig.id + trigger_action name
Process:
  1. Validate trigger_action exists in triggers table
  2. Fetch defaults (default_method, default_endpoint, default_swap)
  3. Check if pageConfig has overrides
  4. Write to pageConfig HTMX columns
Output: Success/failure + populated HTMX columns
```

**Workflow Steps**:
1. **L01**: Webhook trigger (receives pageConfig_id, trigger_action)
2. **L02**: Query triggers table for trigger_action
3. **L03**: If not found, return error
4. **L04**: Query pageConfig for existing HTMX columns
5. **L05**: Merge defaults with overrides (pageConfig wins)
6. **L06**: Update pageConfig HTMX columns
7. **L07**: Return success

**Validation**:
- [ ] Test with login form (trigger_action: "userLogin")
- [ ] Test with grid (trigger_action: "execEvent")
- [ ] Test with invalid trigger name (should error)
- [ ] Test with pageConfig overrides

**Deliverable**: Working htmx-trigger-build workflow

---

### 2.2 Deprecate studio-validate-build-triggers
**Goal**: Mark old workflow as deprecated, redirect to new one

**Actions**:
- Add deprecation notice to workflow description
- Update any callers to use htmx-trigger-build instead
- Keep old workflow for reference (don't delete yet)

**Deliverable**: Old workflow deprecated, new workflow in use

---

## Phase 3: Database Procedures & Views

### 3.1 Update sp_pageStructure
**Goal**: Return HTMX columns instead of triggerBuilt JSON

**Current Output**:
```json
{
  "triggers": {
    "submit": {
      "actions": [...]
    }
  }
}
```

**New Output**:
```json
{
  "hx_trigger": "submit",
  "hx_method": "POST",
  "hx_endpoint": "/controller/userLogin",
  "hx_swap": "none"
}
```

**Actions**:
```sql
-- Modify sp_pageStructure to select HTMX columns
SELECT
  comp_name AS id,
  composite_name,
  css_style,
  props,
  -- HTMX attributes (simple fields)
  hx_trigger,
  hx_method,
  hx_endpoint,
  hx_target,
  hx_swap,
  hx_vals,
  response_trigger
FROM ...
```

**Validation**:
- [ ] Test sp_pageStructure(12) - login page
- [ ] Verify HTMX fields returned
- [ ] Verify no triggerBuilt JSON

**Deliverable**: Updated sp_pageStructure returning HTMX fields

---

### 3.2 Update vw_pageConfig (if needed)
**Goal**: Include HTMX columns in view

**Actions**:
- Add hx_trigger, hx_method, hx_endpoint, etc. to SELECT
- Test view queries

**Deliverable**: Updated view with HTMX columns

---

## Phase 4: Server & Renderer Changes

### 4.1 Simplify htmxBuilders
**Goal**: Reduce from 300+ lines to ~50 lines

**Current**: Complex logic parsing triggerBuilt JSON

**New**: Simple string builder
```javascript
export function buildHTMXAttributes(component) {
  const parts = [];
  if (component.hx_trigger) parts.push(`hx-trigger="${component.hx_trigger}"`);
  if (component.hx_method && component.hx_endpoint) {
    parts.push(`${component.hx_method.toLowerCase()}="${component.hx_endpoint}"`);
  }
  if (component.hx_target) parts.push(`hx-target="${component.hx_target}"`);
  if (component.hx_swap) parts.push(`hx-swap="${component.hx_swap}"`);
  if (component.hx_vals) parts.push(`hx-vals='${component.hx_vals}'`);
  return parts.join(' ');
}
```

**Actions**:
- Create new simplified buildHTMXAttributes function
- Update all renderers to use it
- Remove old complex htmxBuilders logic
- Test with login page

**Validation**:
- [ ] Login form renders with correct HTMX attributes
- [ ] Grid renders with correct HTMX attributes
- [ ] No JavaScript errors

**Deliverable**: Simplified htmxBuilders (~50 lines)

---

### 4.2 Update Renderers
**Goal**: Use simple HTMX attribute strings

**Renderers to Update**:
- renderForm.js
- renderGrid.js
- renderButton.js
- renderSelect.js
- renderContainer.js

**Pattern**:
```javascript
function renderForm(component) {
  const htmxAttrs = buildHTMXAttributes(component);
  return `<form ${htmxAttrs}>${children}</form>`;
}
```

**Validation**:
- [ ] Each renderer tested individually
- [ ] Login page renders correctly
- [ ] HTMX attributes in HTML match pageConfig

**Deliverable**: All renderers using simplified approach

---

## Phase 5: Controller Changes

### 5.1 Add HX-Trigger Response Headers
**Goal**: Controllers send HX-Trigger headers for cross-component communication

**Pattern**:
```javascript
// userLogin.js
if (isHTMX) {
  res.setHeader('HX-Trigger', 'loginSuccess');
  res.send('');
}
```

**Controllers to Update**:
- userLogin.js → sends 'loginSuccess'
- setVals.js → sends 'contextUpdated'
- execEvent.js → sends 'dataLoaded'
- execDML.js → sends 'dataChanged'

**Validation**:
- [ ] Login triggers grid refresh via HX-Trigger header
- [ ] Form submission triggers table update
- [ ] Browser dev tools show HX-Trigger headers

**Deliverable**: Controllers using HX-Trigger headers

---

### 5.2 Simplify Controller Logic
**Goal**: Remove complex trigger chain handling

**Current**: Controllers try to handle multiple actions

**New**: Controllers do one thing, send HX-Trigger for next action

**Actions**:
- Remove multi-action handling
- Simplify to single responsibility
- Let HTMX handle chaining via HX-Trigger

**Deliverable**: Simplified controllers

---

## Phase 6: Testing & Validation

### 6.1 Login Page End-to-End Test
**Goal**: Verify complete flow works

**Test Steps**:
1. Navigate to /login/login
2. Enter credentials
3. Submit form
4. Verify userLogin controller called
5. Verify HX-Trigger: loginSuccess sent
6. Verify grid becomes visible
7. Verify grid loads data

**Success Criteria**:
- [ ] Form submits via HTMX
- [ ] Login succeeds
- [ ] Grid appears
- [ ] Grid loads apps
- [ ] No JavaScript errors
- [ ] No console warnings

**Deliverable**: Working login page with HTMX-native approach

---

### 6.2 Additional Page Tests
**Goal**: Verify approach works for other pages

**Pages to Test**:
- Ingredient types page
- Any other existing pages

**Deliverable**: All pages working with new approach

---

## Phase 7: Cleanup & Documentation

### 7.1 Remove Old Columns
**Goal**: Clean up deprecated columns

**Actions**:
```sql
-- After all pages migrated and tested:
ALTER TABLE api_wf.pageConfig
DROP COLUMN trigClass,
DROP COLUMN trigAction,
DROP COLUMN triggerBuilt;
```

**Validation**:
- [ ] No code references old columns
- [ ] All pages tested
- [ ] Backup before dropping

**Deliverable**: Clean schema

---

### 7.2 Update Documentation
**Goal**: Document new HTMX-native patterns

**Documents to Create/Update**:
- HTMX patterns guide (for developers)
- Triggers table reference
- pageConfig schema documentation
- Renderer documentation
- Controller patterns

**Deliverable**: Complete documentation

---

### 7.3 Create Plan 1 Knowledge Base Entry
**Goal**: Document this migration for future reference

**Content**:
- What we learned
- Why we simplified
- How to use new approach
- Common patterns
- Troubleshooting

**Deliverable**: Plan 1 communication with migration knowledge

---

## Success Criteria

### Technical
- [ ] Triggers table: 11 columns (down from 22)
- [ ] pageConfig: HTMX columns populated
- [ ] Composites: No trigger columns
- [ ] htmxBuilders: ~50 lines (down from 300+)
- [ ] Controllers: Using HX-Trigger headers
- [ ] Login page: Working end-to-end

### Architectural
- [ ] HTMX-native patterns throughout
- [ ] No complex JSON parsing
- [ ] Simple, maintainable code
- [ ] Database-driven approach maintained

### Documentation
- [ ] All patterns documented
- [ ] Developer guide created
- [ ] Plan 1 entry created

---

## Risks & Mitigation

### Risk 1: Breaking Existing Pages
**Mitigation**: 
- Keep old columns during migration
- Test thoroughly before dropping
- Migrate one page at a time

### Risk 2: Complex Multi-Step Actions
**Mitigation**:
- Use HX-Trigger headers for chaining
- Or handle multiple operations server-side
- Document patterns

### Risk 3: Dynamic Parameters
**Mitigation**:
- Use hx-vals with JavaScript expressions
- Document common patterns

---

## Timeline Estimate

- **Phase 1** (Database): 2-3 days
- **Phase 2** (Workflows): 1-2 days
- **Phase 3** (Procedures): 1 day
- **Phase 4** (Renderers): 2-3 days
- **Phase 5** (Controllers): 1-2 days
- **Phase 6** (Testing): 2-3 days
- **Phase 7** (Cleanup): 1-2 days

**Total**: 10-16 days (2-3 weeks)

---

## Next Steps

1. **Review this plan** - Get feedback from all agents
2. **Approve Phase 1** - Start with database changes
3. **Create migration scripts** - SQL scripts for schema changes
4. **Test on login page** - Prove the concept
5. **Roll out incrementally** - One phase at a time

---

**Status**: DRAFT - Awaiting approval to proceed
