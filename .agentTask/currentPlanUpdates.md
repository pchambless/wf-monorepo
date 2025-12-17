# Plan 75: Composite Architecture Infrastructure

**Status**: pending | **Priority**: critical | **Last Updated**: 2025-12-17

---

## =Ë Plan Overview

# Composite Architecture Infrastructure - Foundation for Database-Driven UI

## Goal
Replace eventComp_xref ’ eventType ’ eventProps ’ eventTriggers (4-table complexity) with eventComposite ’ pageComponents ’ eventPageConfig (3-table unified system).

## Success Criteria
- Universal login loads from eventComposite
- User can route to admin/studio2/whatsfresh app shells
- All renders trace to pageComponents ’ eventComposite chain
- Zero legacy eventComp_xref references
- PageRenderer simplified (target <100 lines)

## Phase 0: Login & App Routing (Infrastructure First)
**Deliverable**: Working login ’ app selection ’ app shell rendering

### Tasks:
1. **Database Setup**
   - Create login form composite (reuse/enhance authAppList)
   - Create admin/studio2/whatsfresh shell composites
   - Wire pageComponents entries in page_registry

2. **sp_pageStructure Redesign**
   - Output hierarchical JSON (not flat strings)
   - Merge composite + page overrides
   - Pre-group components by type (appBar/sidebar/modals/content)

3. **Universal Router Updates**
   - /login ’ login composite
   - Post-login ’ app selection
   - /admin, /studio2, /whatsfresh ’ shell composites

4. **PageRenderer Simplification**
   - Receive structured data from sp_pageStructure
   - Remove 200+ lines of client-side transformation
   - Use ComponentFactory for stable rendering

### Validation Checklist:
- [ ] Login form loads from eventComposite (verify DB logs)
- [ ] Session + context_store set on login success
- [ ] App selection shows 3 app options
- [ ] Each app route renders shell composite
- [ ] sp_pageStructure called with correct pageID
- [ ] No 404s, no hardcoded fallbacks
- [ ] All renders from pageComponents ’ eventComposite

## Phase 1: Studio2 Navigation (Next)
App/Page selector dropdowns using composite system

## Phase 2: CRUD Templates (After That)
Grid/Form composites with page-specific overrides

## Blocks
- Plan 72: shared-imports Elimination (needs working universal-app)
- Plan 73: Whatsfresh Build Out (needs composite infrastructure)
- Plan 74: Studio Management Hub (needs composite infrastructure)

## Architecture Decisions
See Plan 1 communications for composite structure design and learnings.

---

## =¬ Recent Communications

### milestone: Phase 0: Login & App Routing - Infrastructure Setup - claude (2025-12-17)

# Phase 0 Milestone: Universal Login & Routing via Composites

## Objective
Establish universal login and allow users to route to admin, studio2, and whatsfresh app shellsall built from eventComposite/pageComponents. No legacy eventComp_xref.

## Why Phase 0 First?
- Proves composite system works end-to-end
- Testable milestone: "Can I login and see 3 app shells?"
- Blocks feature creep: No Studio2 dropdowns until infrastructure works
- Clean foundation: Each app starts from composites, not migration

## Database Changes Required

### 1. Login Composite
```sql
-- Option A: Enhance existing authAppList (id=38)
-- Option B: Create new login composite with complete flow
```

### 2. App Shell Composites
```sql
-- Create 3 minimal composites:
INSERT INTO eventComposite (name, title, components)
VALUES
  ('AdminShell', 'Admin Application', '[{"type":"Container","name":"AdminRoot","position":"01,01,00,left","props":{"title":"Admin App - Coming Soon"}}]'),
  ('Studio2Shell', 'Studio2 Application', '[{"type":"Container","name":"Studio2Root","position":"01,01,00,left","props":{"title":"Studio2 - Under Construction"}}]'),
  ('WhatsFreshShell', 'WhatsFresh Application', '[{"type":"Container","name":"WFRoot","position":"01,01,00,left","props":{"title":"WhatsFresh - Launching Soon"}}]');
```

### 3. Page Registry Entries
```sql
-- Wire composites to routes
INSERT INTO pageComponents (pageID, comp_name, composite_id, position)
SELECT pr.id, 'ShellRoot', ec.id, '01,01,00,left'
FROM page_registry pr
JOIN eventComposite ec ON ec.name IN ('AdminShell', 'Studio2Shell', 'WhatsFreshShell')
WHERE pr.appName IN ('admin', 'studio2', 'whatsfresh');
```

## Frontend Changes Required

### 1. sp_pageStructure Output Format
**Decision needed**: Return hierarchical JSON vs flat strings?

Current:
```json
{"props": "{\"qryName\":\"value\"}", "triggers": "[...]"}
```

Proposed:
```json
{"props": {"qryName":"value"}, "triggers": {"onClick": [...]}}
```

### 2. Router Updates (universal-app)
```javascript
// App.jsx routes
/login ’ pageID for login composite
/admin ’ pageID for AdminShell
/studio2 ’ pageID for Studio2Shell
/whatsfresh ’ pageID for WhatsFreshShell
```

### 3. PageRenderer Simplification
Remove from fetchConfig.js:
- buildComponentHierarchy (if DB returns hierarchical)
- parseTriggersToWorkflowFormat (if DB groups triggers)
- parsePosOrder (if DB returns position object)

Target: <100 lines in fetchConfig.js (currently 313)

## Validation Steps

### Manual Testing:
1. Navigate to http://localhost:3000/login
2. Login with valid credentials
3. Select admin/studio2/whatsfresh
4. Verify shell page renders with "Coming Soon" message
5. Check browser DevTools ’ Network ’ sp_pageStructure called
6. Check response contains composite data (not eventComp_xref)

### Database Verification:
```sql
-- Verify composites exist
SELECT id, name FROM eventComposite WHERE name LIKE '%Shell';

-- Verify pageComponents wired
SELECT pc.*, pr.appName, pr.pageName
FROM pageComponents pc
JOIN page_registry pr ON pc.pageID = pr.id
WHERE pr.appName IN ('admin', 'studio2', 'whatsfresh');

-- Verify no legacy xref usage
SELECT COUNT(*) FROM eventComp_xref WHERE active = 1; -- Should be 0 or very low
```

## Out of Scope for Phase 0
- L Studio2 navigation dropdowns
- L CRUD grids/forms
- L Working modals
- L Data editing/saving
- L EventSQL execution beyond login
- L AppBar/Sidebar functionality (just placeholders)

**If someone requests these features, redirect to Phase 1+**

## Next Steps After Phase 0
1. **Phase 1**: Studio2 App/Page navigation dropdowns
2. **Phase 2**: CRUD template composites with page overrides
3. **Phase 3**: Full Studio2 component editing UI

## Dependencies
- Blocks Plan 72 (shared-imports elimination)
- Blocks Plan 73 (Whatsfresh build out)
- Blocks Plan 74 (Studio Management Hub)

All downstream work depends on composite infrastructure being stable and proven.

---

## =Á File Changes

_No file changes recorded yet for Plan 75_

---

_Last synced: 2025-12-17T05:52:00Z_
_This file is auto-generated for GitHub Copilot context - do not edit manually_
