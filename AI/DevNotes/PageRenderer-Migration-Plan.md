# PageRenderer Migration Plan
**Goal**: Apply DirectRenderer fixes to PageRenderer, make it modular, integrate into Studio

## Critical Changes to Port (From vw_module_impact_dtl)

### 🔴 Priority 1: Form Data Binding (Core CRUD Functionality)

#### 1. DirectRenderer.jsx
- **Impact 574**: Pass `setFormData` to buildEventHandlers and renderRow
- **Impact 552**: Modal comp_type handler (lines 200-207)
- **Impact 535**: Removed auto form population (prevents Grid data bleeding into Form)
- **Impact 528**: Pass dataStore to textRenderer context

#### 2. eventHandlerBuilder.js
- **Impact 572**: Add setFormData parameter, include in trigger context

#### 3. rowRenderer.js (GridRenderer.js in PageRenderer)
- **Impact 573**: Thread setFormData through createActionsCell and renderRow
- **Impact 508**: Fixed confirmation popup (action.confirmMessage at top level)

#### 4. refresh.js (Action Trigger)
- **Impact 575, 566**: Component-type-aware data handling
  - Grid data → dataStore (array)
  - Form data → formData (first row from array)
  - This is THE key fix that made edit work!

#### 5. execEvent.js (Action Trigger)
- **Impact 565**: Simplified to just return data, let caller decide handling

### 🟡 Priority 2: Modal & UI Fixes

#### 6. layoutUtils.js
- **Impact 551**: Fixed mutation bug in removeModals (immutable copies)
- **Impact 536**: Recursive Modal extraction from component tree

#### 7. useTemplateLoader.js (Hook)
- **Impact 567**: Load from IndexedDB, JSON.parse style strings

#### 8. textRenderer.js
- **Impact 533, 527**: Template token resolution
  - {{dataStore.X.Y}}
  - {{contextStore.X}}
  - {{formData.X}}

### 🟢 Priority 3: DML & Context Store

#### 9. buildDMLData.js + Builders
- **Impact 478-481**: Method-specific builders (INSERT/UPDATE/DELETE)

#### 10. execDML.js
- **Impact 507**: Simplified DELETE (only primary key)

#### 11. getVal.js
- **Impact 532, 522**: Return {componentId, data} format

#### 12. Various API Replacements
- **Impacts 485-492**: Replace shared-imports with local API
  - Already done in PageRenderer template (uses local utils/api.js)

---

## Modularity Strategy

### Keep Small & Focused
✅ **These are already well-scoped:**
- Individual trigger actions (refresh.js, execEvent.js, setVals.js, etc.)
- Utility functions (layoutUtils.js, styleUtils.js, eventHandlerBuilder.js)
- Hooks (useModalManager.js, useTemplateLoader.js)
- Renderers (Grid.js, Modal.js, Text.js, Container.js)

❌ **Do NOT copy into each app:**
- TriggerEngine.js (orchestrator - can be larger)
- DirectRenderer.jsx (orchestrator - can be larger)
- PageRenderer.jsx (orchestrator - can be larger)

### Sync Strategy: Template → Apps
**On app startup (npm start):**
```bash
# In each app's package.json
"prestart": "node scripts/sync-rendering.js --quiet"
```

**Script checks:**
1. Compare template timestamp vs app's rendering/ folder timestamp
2. If template newer → copy entire rendering/ folder
3. No npm install needed, no cache issues

### Files to Copy (from app-boilerplate/src/)
```
rendering/
├── PageRenderer.jsx (main orchestrator)
├── WorkflowEngine/
│   ├── TriggerEngine.js
│   └── triggers/ (all action & class triggers)
├── hooks/ (useModalManager, useTemplateLoader)
├── renderers/ (Grid, Modal, Text, Container, AppLayout)
└── utils/ (layoutUtils, styleUtils, eventHandlerBuilder)

layouts/
├── AppLayout.jsx
├── Appbar.jsx
├── Sidebar.jsx
└── Footer.jsx

utils/
├── api.js
└── fetchConfig.js
```

**Do NOT copy:**
- ❌ package.json (each app has its own)
- ❌ App.jsx (each app has its own)
- ❌ craco.config.js (each app has its own)
- ❌ DirectRenderer.jsx (Studio-only, not for production apps)

---

## Division of Labor: Claude & Kiro

### Phase 1: Preparation (Claude - 30 min)
**Strategic planning & file mapping**

1. ✅ Document all DirectRenderer changes (DONE - see above)
2. Create detailed checklist for each file
3. Identify which changes apply to PageRenderer vs Studio-only
4. Flag any conflicts or simplification opportunities

**Deliverable**: Detailed migration checklist for Kiro

---

### Phase 2: Implementation (Kiro - 2-3 hours)
**Apply changes to PageRenderer modules**

#### Step 1: Core Form Binding (60 min)
- [ ] Update refresh.js (component-type-aware data handling)
- [ ] Update eventHandlerBuilder.js (add setFormData param)
- [ ] Update GridRenderer.js (thread setFormData through rowActions)
- [ ] Update PageRenderer.jsx (pass setFormData to handlers)
- [ ] Update execEvent.js (simplify return value)

**Test checkpoint**: INSERT/UPDATE should work

#### Step 2: Modal & Layout (45 min)
- [ ] Update layoutUtils.js (fix removeModals mutation bug)
- [ ] Update useTemplateLoader.js (IndexedDB + JSON.parse styles)
- [ ] Update textRenderer.js (template token resolution)

**Test checkpoint**: Modal should open/close, text templates work

#### Step 3: DML & Polish (45 min)
- [ ] Update buildDMLData.js and builders
- [ ] Update execDML.js (simplify DELETE)
- [ ] Update getVal.js (return format)
- [ ] Remove any Studio-specific debug logging

**Test checkpoint**: Full CRUD workflow in Admin app

**Deliverables**:
- Updated PageRenderer modules in app-boilerplate/src/rendering/
- Test results from Admin app
- List of any issues encountered

---

### Phase 3: Studio Integration (Claude - 1 hour)
**Make Studio use PageRenderer**

1. Update Studio to import PageRenderer instead of DirectRenderer
2. Create pageConfig builder (from IndexedDB → JSON)
3. Test Studio preview matches production
4. Remove DirectRenderer (or keep as legacy fallback)

**Deliverable**: Studio using PageRenderer, preview working

---

### Phase 4: Cleanup & Documentation (Claude - 30 min)
1. Create app sync script (sync-rendering.js)
2. Update each app's package.json with prestart hook
3. Test sync mechanism works
4. Document the architecture in README

**Deliverable**: Apps auto-sync rendering modules on startup

---

## Success Metrics

### Must Work:
- ✅ CRUD template INSERT in Admin app
- ✅ CRUD template UPDATE (edit button populates form)
- ✅ CRUD template DELETE with confirmation
- ✅ Modal opens/closes correctly
- ✅ Studio preview matches Admin app exactly

### Should Work:
- ✅ Text templates resolve {{dataStore.X.Y}}
- ✅ Grid rowActions work (edit, delete)
- ✅ Form validation (if applicable)

### Nice to Have:
- ✅ No console errors
- ✅ Clean, minimal logging
- ✅ Fast sync on app startup

---

## Simplification Opportunities

### During Porting to PageRenderer, REMOVE:
1. **Debug console.logs** - Keep only critical error logging
2. **Studio-specific hacks** - Anything with "Studio" in comment
3. **Dead code** - Unused functions/variables
4. **Duplicate logic** - Consolidate where possible

### Consider Consolidating:
- GridRenderer.js is complex - might benefit from sub-modules
- TriggerEngine might not need full orchestration (simpler dispatch?)
- Template loader could be simpler if we always use JSON styles

---

## Timeline Estimate

| Phase | Who | Time | Cumulative |
|-------|-----|------|------------|
| 1. Preparation | Claude | 30m | 30m |
| 2. Implementation | Kiro | 2-3h | 3.5h |
| 3. Studio Integration | Claude | 1h | 4.5h |
| 4. Cleanup | Claude | 30m | 5h |

**Total: ~5 hours of focused work**

Realistically with breaks, testing, debugging: **1-2 dev days**

---

## Risk Mitigation

### What Could Go Wrong?
1. **Context chain breaks** - Missing setFormData somewhere
   - Mitigation: Test at each step, console.log context objects

2. **Modal rendering different** - PageRenderer uses different DOM structure
   - Mitigation: Compare rendered HTML between Studio and Admin

3. **Template sync fails** - Apps don't pick up changes
   - Mitigation: Manual copy as backup, test sync script early

4. **Performance regression** - Slower than DirectRenderer
   - Mitigation: Profile before/after, optimize if needed

---

## Open Questions

1. **Should Studio completely remove DirectRenderer?**
   - Pro: Single code path, easier maintenance
   - Con: Lose Studio-specific preview features (if any exist)
   - **Recommendation**: Remove it, PageRenderer should handle everything

2. **Do we need Form.js and Select.js renderers?**
   - Check if generic React.createElement works
   - If complex validation needed, create dedicated renderers
   - **Recommendation**: Start without, add if needed

3. **Global CSS vs eventType styles - keep both?**
   - Yes - global.css for app theme, eventType.styles for overrides
   - **Recommendation**: Keep both, document when to use each

4. **Should sync-rendering.js be smart (timestamp check) or dumb (always copy)?**
   - Smart = faster startup when no changes
   - Dumb = simpler, more reliable
   - **Recommendation**: Start dumb, optimize later if needed

---

## Next Steps (Tomorrow)

1. **Paul**: Review this plan, adjust priorities
2. **Claude**: Create detailed checklist for each file
3. **Kiro**: Start Phase 2 implementation
4. **All**: Test frequently, communicate blockers

Ready to rock! 🚀
