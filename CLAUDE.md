# CLAUDE.md

## 🧠 Claude Behavior Preferences

- **Tone**: Concise, technical, respectful, a little fun
- **Verbosity**: Minimal — suppress analogies or commentary
- **Output Style**: Diffs, config deltas, direct edits preferred over discussion
- **Response Length**: Cap at 1800 tokens unless specified
- **Explanations**: Encouraged but concise.

---

## 🏗️ Project Context: WhatsFresh Monorepo

- **Apps**:
  - `wf-client`: Ingredient tracking, recipe workflows
  - `wf-admin`: User management, system configuration - exclude until actively developing
  - `wf-server`: Node.js API for both apps
## 📦 Packages

- `db-connect`  
  Connection information for the MySQL database used by all services.

- `shared-imports`  
  Monorepo-wide dependencies, including both React and non-React utilities.

  ### 🧩 Component Types

  - **React (.jsx)** components  
    Defined in `src/jsx.js` and imported via:
    ```js
    import { CrudLayout } from '@whatsfresh/shared-imports/jsx';
    ```

  - **Standard (.js)** utilities  
    Imported directly from root or scoped entry points:
    ```js
    import { createLogger } from '@whatsfresh/shared-imports';
    import { getSafeEventTypes } from '@whatsfresh/shared-imports/events';
    ```

  This modular structure enables clean separation between UI and logic layers across apps. React components stay isolated from utility logic, while sub-path imports allow fine-grained control.

- `devtools`  
  Core generation tools and documentation assets.  
  - Powers config regeneration, page previews, and architectural documentation.
- **sql/ Folder Summary**
  - `legacy`: Snapshot of production DB artifacts — the real, existing schema (but incomplete).
    - `tables`: Core relational data — ingredients, batches, recipes, users, etc.
    - `functions & procedures`: Business logic (e.g. account activation, unit conversion)
    - `views`: Read-only aggregations and joins used by legacy apps.  
        - Includes batch summaries, trace views, recipe maps, and event logs
- ❗️ Guidance: Treat as reference only unless explicitly modifying; may contain hardwired business logic.
- **⚙️ views/**  
  App-facing EventType-driven views segmented by runtime context.  These are the heart of the client-server architecture, the bridge between the database -> server -> clients and back.

  - **📁 client/**  
    UI-facing SQL lists and helpers for the `wf-client` React app  
    - Includes: `btchMapRcpeList.sql`, `prodBtchList.sql`, `userAcctList.sql`, etc.  
    - 🗂️ Organized around ingredients, batches, recipes, and user-linked data  
    - `.vscode/`: Contains local editor settings _(safe to ignore for Claude config)_

  - **📁 admin/**  
    Supports account and user management in `wf-admin`  
    - 🧠 Interpretation:  
      - Clean, declarative wrappers around core entities  
      - Exposes EventType-friendly shapes for dynamic UI generation

  - **🚀 domain/**  
    Forward-looking / AI-suggested views for FDA compliance and traceability  
    - Driven by architecture goals more than current production data  
    - Organized by concept folders: `ingredient/`, `product/`, `mapping/`, `compliance/`  
    - Patterned into layers:
      - `foundation/`: Raw entity aggregates  
      - `crud/`: List-style views for UI rendering  
      - `analytics/`: Placeholder for metrics and insights  
      - `compliance/`: Regulatory reports and traceability outputs

---

## ⚙️ Generation Workflow & Commands

- Config generation powered by SQL → UI config → App-specific code
- Use `EventType` for UI routing decisions
- Use devtools CLI:
  - `npm run generate-client` → Regenerate client configs
  - `npm run generate-admin` → Regenerate admin configs
  - `npm run generate-docs` → Refresh architectural documentation

---

## 🚦 Repo Safety & Permissions

- Do **not** modify:
  - Anything under `legacy/` unless prompted
  - This `CLAUDE.md` file unless approved
  - Generated configs unless regeneration is disabled
- Claude is granted permission to:
  - Edit configs
  - Read and write in `/domain/`, `shared-*`, `devtools`
  - Run safe bash commands inside the repo

---

## 📋 Development Plans

Active development plans and issue tracking are maintained in `/claude-plans/`, organized with date-prefixed filenames for chronological sorting.

- **Naming Convention:**  
  `yyyy-mm-dd descriptive-plan-name.md`

- **Purpose:**  
  Track implementation proposals, config fixes, and architectural decisions.

- **Usage:**  
  Reference these files to understand current development priorities and context.

---

### 📁 claude-plans/ Workflow Rules

- **Folder Structure:**
  - `a-pending/`: Contains active or in-progress development plans.
  - `b-completed/`: Contains finalized or fully implemented plans with updated internal status.

- **Claude Behavior:**
  - When a plan is explicitly approved or tagged as complete, Claude is permitted to:
    - Move the file from `a-pending/` to `b-completed/`
    - Update its internal plan status (e.g. summarize what was fixed or implemented)
    - Suggest optional follow-up steps or enhancements
    - Reference the finalized plan in future proposals for continuity

- **Filename Guidance:**
  - Claude may rely on filename cues such as:
    - `2025-07-08 client-navigation-fix.md`
    - `2025-07-07 sql-refactor-plan.md`

- **Manual Override:**
  - For audit control, add a metadata tag to mark a plan as finalized:
    ```md
    <!-- status:FIX_COMPLETE -->
    ```

---

### 🗺️ Current Plan Map

#### 📝 a-pending/ (Active Plans)
- **`2025-.07-08 Widget params.md`** - Selector widgets auto-parameter lookup (widget encapsulation)
- **`2025-07-07 NAVIGATION_FIX_PLAN.md`** - Navigation redirect issues and TurboRepo optimization

#### ✅ b-completed/ (Implemented Plans)
- **`2025-07-07 pageMap config issues.md`** - Table component pageMap format update (columnMap → tableConfig)
- **`2025-07-08-NAVIGATION_FIX_COMPLETE.md`** - Account state management and navigation loop fixes
- **`2025-07-09-crud-system-navigation-fixes.md`** - CRUD system navigation and form configuration fixes (COMPLETED)

#### 🎯 Current Priorities
1. **High**: Fix directive generation process (genDirectives.js field visibility issues)
2. **Medium**: Widget parameter auto-lookup implementation
3. **Low**: Navigation performance optimization with TurboRepo


---

## 🧭 Session Priming Prompt (Recommended)

> You are working inside the WhatsFresh monorepo. Stay concise but friendly.  Use diffs or direct edits. Do not touch legacy views unless explicitly told. All config flows are driven by SQL views and EventType logic.  Try to limit token usage to 1500 or less unless directed to proceed.  

> the user is always concerned about cleaning up artifacts (unused or obsolete files).  Whenever 

---

## 🔧 DevTools Generator Commands

### Common Generation Tasks
- `node genDirectives.js [viewName]` - Generate directive files from SQL views
- `node genPageMaps.js [viewName]` - Generate pageMap configurations 
- `node genPageIndex.js client --all` - Generate React component wrappers
- `npm run generate-client` - Full client regeneration pipeline

### Generator File Locations
- **Directive Generation**: `packages/devtools/src/automation/page/genDirectives.js`
- **PageMap Generation**: `packages/devtools/src/automation/page/genPageMaps.js`
- **Component Generation**: `packages/devtools/src/automation/page/genPageIndex.js`
- **Configuration Sources**: 
  - SQL Views: `sql/views/client/`
  - Events Config: `packages/devtools/src/docs/generated/events/events.json`
  - Directive Output: `packages/devtools/src/automation/page/directives/`

### 🔍 Common Debugging Patterns

#### Unified Naming Convention
**Key Rule**: `viewName` = `pageName` = `eventType` = `listEvent`
- Example: `measList` is the SQL view name, page name, event type, and list event
- Server processes use the same `eventType` name
- This pattern eliminates naming confusion across the stack

#### Quick File Locations (using [viewName] variable)
- **SQL View**: `sql/views/client/[viewName].sql`
- **Directive**: `packages/devtools/src/automation/page/directives/[viewName].json` 
- **Generated PageMap**: `apps/wf-client/src/pages/[viewName]/pageMap.js`
- **React Component**: `apps/wf-client/src/pages/[viewName]/index.jsx`

#### Common Issues → Solutions
- **MUI DataGrid "id" error** → Check pageMap `primaryKey` configuration in events.json
- **Fields hidden incorrectly** → Check directive generation preservation logic in genDirectives.js
- **Select widgets not working** → Check FIELD_PATTERNS in genDirectives.js
- **Widget warnings during generation** → Missing widget definitions in registry

---

## 💡 Claude Code CLI Tips

- **`#`** - Quick shortcut to add content to CLAUDE.md during session
- **`/help`** - Get help with Claude Code usage
- **`--resume`** - Resume previous session context

---
