## User Input
Restructure DevTools documentation architecture. Implement the new folder structure (automation/, documentation/, configuration/, utils/), move files to appropriate locations, and create unified HTML generation system. Focus on separating code generation from documentation generation.

**Key folder restructure:**
- Move sample data files to `/automation/data/samples/` 
- Consolidate automation tools in `/automation/generators/`
- Separate documentation generation to `/documentation/`
- Create `/configuration/` for registries and events.json

---

## Claude Analysis & Implementation Strategy

### 🎯 Current State Analysis

**Existing Structure Issues:**
- **Mixed concerns**: Code generation mixed with documentation in `/src/`
- **Scattered samples**: Sample data in both `/samples/` and `/automation/data/`
- **Duplicate docs**: Widget docs in both `/docs/Docs/widgets/` and `/docs/generated/widgets/`
- **Complex nesting**: Deep folder hierarchies like `/docs/sections/eventTypes/source/genCode/`

### 📁 Proposed Target Structure

```
packages/devtools/
├── src/
│   ├── automation/           # Code generation tools
│   │   ├── core/            # Operational (always-run) generators
│   │   │   ├── genPageMaps.js      # UI configuration
│   │   │   └── genEventTypes.js    # Mermaid chart data
│   │   ├── triggered/       # Supporting (run when views change)
│   │   │   ├── genDirectives.js    # When SQL views change
│   │   │   └── genSampleData.js    # When directives change
│   │   ├── static/          # Architectural (run only on major changes)
│   │   │   └── genPageIndex.js     # React components/scaffolding
│   │   ├── data/            # Persistent data & manual customizations
│   │   │   ├── directives/         # Manual UI tuning preserved
│   │   │   └── samples/            # Generated when needed
│   │   └── templates/       # Code templates
│   ├── documentation/       # Doc generation (separate from code gen)
│   │   ├── generators/      # HTML/doc generators
│   │   ├── templates/       # HTML templates
│   │   └── assets/         # Styles, scripts
│   ├── configuration/       # Config files & registries
│   │   ├── registries/     # Entity registries
│   │   └── events.json     # Event definitions
│   └── utils/              # Shared utilities
├── generated/              # All generated output
└── docs/                   # Static documentation
```

### 🎯 Operational vs Supporting Automation

**Core Operational (Always Run):**
- **genPageMaps.js** - Creates UI configuration from directives
- **genEventTypes.js** - Mermaid chart data generation

**Supporting/Triggered (Run When Views Change):**
- **genDirectives.js** - Only when SQL views are modified
- **genSampleData.js** - Triggered by directive changes to reflect structure

**Static/Architectural (Run Only on Major Changes):**
- **genPageIndex.js** - Only when eventTypes added/removed or page architecture changes

### 🎯 Incremental Change Strategy

**Single View/EventType Changes:**
When only one SQL view changes (e.g., `ingrList` or `ingrBtchList`):
- Run `genDirectives.js` **only for that specific view**
- Run `genSampleData.js` **only for that specific view**  
- Run `genPageMaps.js` **only for that specific eventType**
- Skip regeneration of unchanged views/eventTypes

**Architectural Changes:**
Only regenerate ALL views/eventTypes when:
- New eventTypes added/removed
- EventTypes structure changes (new attributes, relationships)
- Major UI layout pattern changes
- Database schema overhauls

**Manual Customization Preservation:**
- Directive `grp` attributes (form organization)
- Directive `width` attributes (table layout)  
- Other UI-specific fine-tuning preserved during regeneration
- **Key**: Preserve customizations during incremental regeneration

### 🔄 Migration Mapping

#### **1. Automation Consolidation**
**Move to `/automation/core/` (Operational):**
- ✅ `src/automation/page/genPageMaps.js` → `/automation/core/genPageMaps.js`
- ✅ `src/docs/sections/eventTypes/source/genCode/genEventTypes.js` → `/automation/core/genEventTypes.js`

**Move to `/automation/triggered/` (Supporting):**
- ✅ `src/automation/page/genDirectives.js` → `/automation/triggered/genDirectives.js`
- ✅ `src/automation/data/genSampleData.js` → `/automation/triggered/genSampleData.js`

**Move to `/automation/static/` (Architectural):**
- ✅ `src/automation/page/genPageIndex.js` → `/automation/static/genPageIndex.js`

**Move to `/automation/data/`:**
- ✅ `src/samples/` → `/automation/data/samples/`
- ✅ `src/automation/page/directives/` → `/automation/data/directives/`

**Delete (Obsolete per Phase 2):**
- ❌ `src/generators/` (obsolete route generators)
- ❌ `src/automation/routes/` (obsolete route generators)

#### **2. Documentation Separation**  
**Move to `/documentation/generators/`:**
- ✅ `src/docs/sections/*/source/` → `/documentation/generators/`
- ✅ `src/docs/automation/genMasterDocs.js`
- ✅ `src/docs/genDocs.js`

**Move to `/documentation/templates/`:**
- ✅ `src/docs/templates/`
- ✅ `src/docs/sections/*/templates/` (if any)

#### **3. Configuration Centralization**
**Move to `/configuration/`:**
- ✅ `src/registries/` → `/configuration/registries/`
- ✅ `src/docs/generated/events/events.json` → `/configuration/events.json`

#### **4. Utils Consolidation**
**Move to `/utils/`:**
- ✅ `src/utils/` (already properly located)
- ✅ Any shared utilities from other folders

### 🔧 Implementation Steps

#### **Phase 3A: Create New Structure**
- [ ] Create new folder hierarchy (`/core/`, `/triggered/`, `/static/`, `/data/`)
- [ ] Move operational generators to `/automation/core/`
- [ ] Move triggered generators to `/automation/triggered/`
- [ ] Move architectural generator to `/automation/static/`
- [ ] Move data files to `/automation/data/`
- [ ] Update all import paths

#### **Phase 3B: Cleanup & Validation**  
- [ ] Delete obsolete route generators (Phase 2 integration)
- [ ] Remove duplicate documentation folders
- [ ] Test core operational generators work from new locations
- [ ] Validate triggered generators preserve manual customizations

#### **Phase 3C: Workflow Foundation (Phase 5 Prep)**
- [ ] Create unified entry points for core vs triggered
- [ ] Document preservation logic for directive customizations
- [ ] Establish change detection patterns
- [ ] Update CLAUDE.md with new automation workflow

### 🚀 Phase 5 Foundation Established

This structure sets up the framework for Phase 5's "update and change flow":
- **Change Detection**: Which specific SQL views have been modified?
- **Incremental Processing**: Only regenerate changed views/eventTypes
- **Preservation Logic**: Protect manual `grp`, `width`, and other customizations
- **Dependency Triggers**: Directive changes → sample regeneration (per view)
- **Workflow Validation**: Test operational vs triggered vs static automation patterns
- **Efficiency**: Avoid full regeneration when only single views change

### 📊 Files to Delete (Phase 2 Cleanup Integration)

**Obsolete Route Generators:**
- `src/automation/routes/` (entire folder)
- `src/generators/routeGenerator.js`
- `src/generators/navigationGenerator.js` 
- `src/generators/generateAppConfig.js`

**Backup Files:**
- `src/docs/README.md.backup`

**Duplicate Documentation:**
- `src/docs/Docs/` (vs `/generated/` - keep one)

### 🎯 Success Criteria

- ✅ Clear separation: automation vs documentation
- ✅ Single source for samples and directives
- ✅ Centralized configuration management
- ✅ All generators working from new locations
- ✅ Unified HTML generation system
- ✅ Updated import paths throughout monorepo