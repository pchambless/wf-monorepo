# React Flow Studio - Visual Page Builder Implementation

**Date:** 2025-10-04
**Context:** Building hard-coded Studio app to visually edit database-driven pages

---

## 🎉 Key Decisions Made

### 1. **Two-Tier Architecture - CRITICAL**
**Studio is hard-coded React, NOT database-driven**

**Why:**
- Avoids meta-circular problem (building the tool with itself)
- Keeps Studio stable and debuggable
- Database system proves itself by building user apps

**What goes where:**
```
HARD-CODED (Studio app):
✅ /apps/studio/src/ - All Studio UI components
✅ React Flow canvas, properties panel, sidebar
✅ But USES eventSQL queries for data

DATABASE-DRIVEN (User apps):
✅ whatsfresh, admin, planner, login
✅ Built WITH Studio, stored in eventType_xref
✅ Proves the system works
```

### 2. **React Flow Integration**
**Replaced Mermaid charts with React Flow for interactive editing**

**Why React Flow:**
- Built for visual node editors
- Click to select components
- Drag to reorder (future)
- Custom node styles
- Mini-map, pan/zoom built-in

**Installed:** `reactflow@11.11.0` in studio package

### 3. **Data Loading Pattern**
**Load individually at component level, NOT shared context**

**Why:**
- Self-contained components
- No prop drilling
- HTTP caching prevents duplicates
- Simpler mental model
- Aligns with React Query best practices

---

## 📦 Components Created

### Core Infrastructure
```
/apps/studio/src/
├── components/
│   ├── StudioLayout.jsx ✅          # Main 3-column layout
│   ├── StudioSidebar.jsx ⏳         # (blocked - waiting to create)
│   ├── PageFlowCanvas.jsx ✅        # React Flow visual editor
│   ├── ComponentPropertiesPanel.jsx ✅  # Properties sidebar
│   ├── StudioCanvasWrapper.jsx ✅   # (may not need anymore)
│   └── FlowNodes/
│       ├── GridNode.jsx ✅          # Blue grid icon
│       ├── FormNode.jsx ✅          # Green form icon
│       ├── ContainerNode.jsx ✅     # Orange container icon
│       └── PageNode.jsx ✅          # Purple page icon
│
├── utils/
│   └── pageConfigToFlow.js ✅       # Transforms pageConfig → React Flow nodes
│
└── pages/
    └── Studio/
        ├── index.jsx ⏳             # Needs update to use StudioLayout
        └── pageConfig.json          # (deprecated - hard-coded UI now)
```

### Preview Structure (Auto-generated)
```
/apps/studio/src/preview/
├── login/
│   └── loginPage/                   # ✅ Generated via genPageConfig
│       ├── index.jsx
│       ├── pageConfig.json
│       └── pageMermaid.mmd
│
└── whatsfresh/
    └── ingrTypePage/                # ✅ Generated via genPageConfig
        ├── index.jsx
        ├── pageConfig.json
        └── pageMermaid.mmd
```

---

## 🗑️ Cleanup Done

**Deleted from database (eventType_xref):**
❌ studio (App)
❌ studioPage (Page)
❌ studioSidebar, selectApp, selectPage, previewPage
❌ studioComponent, studioWorkArea
❌ pagePreview modal, previewFrame

**Why:** Studio's own UI shouldn't be in the database it's editing (meta-circular problem)

**Deleted from codebase:**
❌ `/apps/studio/src/preview/studio/` - Studio previewing itself

---

## 🔧 Existing eventSQL Queries (Reuse these!)

```sql
-- id: 1
appList:
  SELECT id, comp_name
  FROM api_wf.vw_hier_components
  WHERE parent_id = 1 AND comp_type = 'App' AND id <> parent_id

-- id: 2
pageList:
  SELECT id, comp_name
  FROM api_wf.vw_hier_components
  WHERE parent_id = :appID AND comp_type = 'Page'

-- id: 9
eventTypeList:
  SELECT id, name, category, title, style
  FROM api_wf.eventType
  ORDER BY Hier, name
```

**Usage in Studio:**
```jsx
const { execEvent } = await import('@whatsfresh/shared-imports');
const result = await execEvent('appList', {});
```

---

## 🚧 Current Status

### Working ✅
- React Flow installed and integrated
- Custom node components (Grid, Form, Container, Page)
- pageConfig → React Flow transformer
- Properties panel with tabs (Component, Props, Triggers)
- Preview folder structure
- DirectRenderer custom component support

### Blocked ⏸️
- **DEV_MODE = false** in Studio index.jsx (using static pageConfig.json)
- StudioSidebar creation was interrupted
- Studio not using new StudioLayout yet

### Issues Fixed
- Added `triggerEngine.getContext()` method
- Fixed DirectRenderer import path
- Removed contextStore confusion (use database context_store via getVal/setVals)

---

## 📋 Next Steps (In Order)

### Immediate (30 min to working UI)
1. **Create StudioSidebar.jsx** with:
   - App dropdown using `execEvent('appList')`
   - Page dropdown using `execEvent('pageList', {appID})`
   - Calls `onPageConfigLoaded(config)` when page selected

2. **Update Studio/index.jsx**:
   ```jsx
   import StudioLayout from '../../components/StudioLayout';
   const Studio = () => <StudioLayout />;
   ```

3. **Test the flow**:
   - Select app → loads pages
   - Select page → React Flow shows structure
   - Click node → properties panel populates

### Short Term (Component Palette)
4. **Create ComponentPalette.jsx**:
   - Use `execEvent('eventTypeList')` to load components
   - Filter into Widgets (Grid, Form, Button, Select, Chart)
   - Filter into Containers (Column, Section, Modal, Tabs)
   - Draggable items (future: drop to add to page)

### Medium Term (Save Functionality)
5. **Wire up Save button**:
   ```jsx
   // In ComponentPropertiesPanel
   const handleSave = async () => {
     const response = await fetch('http://localhost:3001/api/execDML', {
       method: 'POST',
       body: JSON.stringify({
         method: 'UPDATE',
         table: 'api_wf.eventType_xref',
         primaryKey: selectedComponent.xref_id,
         data: {
           title: updatedTitle,
           override_styles: updatedStyles,
           // etc.
         }
       })
     });
   };
   ```

6. **Trigger Editor**:
   - Load triggers for selected component
   - Add/edit/delete workflow steps
   - Save to database

### Future Enhancements
7. **Drag to reorder** - React Flow onNodeDragStop → update posOrder
8. **Add component** - Drag from palette → INSERT into eventType_xref
9. **Delete component** - Keyboard shortcut → soft delete (set deleted_at)
10. **Undo/Redo** - Track change history
11. **Live preview refresh** - Auto-reload preview after saves

---

## 🎨 Studio UI Vision

```
┌─────────────────────────────────────────────────────────────────┐
│  STUDIO                                    [Save] [Deploy]       │
├──────────┬──────────────────────────────────────────┬───────────┤
│          │                                           │           │
│ SELECT   │         REACT FLOW CANVAS                 │   PROPS   │
│          │                                           │           │
│ App:     │    ┌─────────────────┐                   │ ID: 23    │
│ [▼]      │    │  📄 loginPage   │                   │           │
│          │    └────────┬────────┘                   │ Title     │
│ Page:    │             │                            │ [─────]   │
│ [▼]      │             ▼                            │           │
│          │    ┌────────────────┐                    │ Type      │
│ PALETTE  │    │  📦 Container  │                    │ Grid      │
│          │    └─┬──────────┬──┘                     │           │
│ Widgets  │      │          │                        │ [SQL]     │
│ ┌──────┐ │      ▼          ▼                        │           │
│ │ Grid │ │  ┌──────┐  ┌────────┐                   │ [⚡]      │
│ │ Form │ │  │ Grid │  │  Form  │                   │           │
│ │ Btn  │ │  └──────┘  └────────┘                   │ [Save]    │
│ └──────┘ │                                           │           │
└──────────┴──────────────────────────────────────────┴───────────┘
```

**Layout:**
- **Left (280px):** App/Page selectors, Component Palette
- **Center (Fluid):** React Flow canvas with nodes
- **Right (360px):** Component properties editor

---

## 🔑 Key Files Reference

**Studio Entry:**
- `/apps/studio/src/pages/Studio/index.jsx` - Router entry point

**Main Components:**
- `/apps/studio/src/components/StudioLayout.jsx` - 3-column layout
- `/apps/studio/src/components/StudioSidebar.jsx` - Left sidebar (TO CREATE)
- `/apps/studio/src/components/PageFlowCanvas.jsx` - React Flow canvas
- `/apps/studio/src/components/ComponentPropertiesPanel.jsx` - Right sidebar

**DirectRenderer:**
- `/apps/studio/src/rendering/DirectRenderer.jsx` - Renders database pages
- Custom component support added for StudioCanvasWrapper (may remove)

**API Endpoints:**
- `POST /api/genPageConfig` - Generate preview files
- `POST /api/execDML` - Database operations
- `GET /api/execEventType?eventType={name}` - Execute eventSQL queries

---

## 💡 Lessons Learned

1. **Meta-circular is impractical** - Don't build the builder with itself
2. **Ship → See → Critique → Refine** - User's best workflow
3. **Requirements docs outdated fast** - Build small, pivot fast
4. **Individual loading > shared context** - Simpler, more maintainable
5. **Database for data, hard-code for tools** - Right abstraction level

---

## 🚀 Resume Instructions

**To continue building Studio:**

1. **Check current state:**
   ```bash
   cat /home/paul/wf-monorepo-new/apps/studio/src/pages/Studio/index.jsx
   # Should be using StudioLayout or needs update
   ```

2. **Create StudioSidebar.jsx** (see Next Steps #1 above)

3. **Test flow:**
   - Start studio: `cd apps/studio && npm start`
   - Open http://localhost:3004
   - Select app → select page → see React Flow diagram

4. **Iterate based on what you see** - User will say "change this"

**Key principle: Build something visible FIRST, then refine based on visual feedback!**

---

**Token usage at save:** ~94K/200K (106K remaining)
