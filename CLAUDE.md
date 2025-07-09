# CLAUDE.md

## 🧠 Claude Behavior Preferences

- **Tone**: Concise, technical, respectful
- **Verbosity**: Minimal — suppress flavor text, analogies, or commentary
- **Output Style**: Diffs, config deltas, direct edits preferred over discussion
- **Response Length**: Cap at 2048 tokens unless specified
- **Explanations**: Avoid unless explicitly requested

---

## 🏗️ Project Context: WhatsFresh Monorepo

- **Apps**:
  - `wf-client`: Ingredient tracking, recipe workflows
  - `wf-admin`: User management, system configuration - exclude until actively developing
  - `wf-server`: Node.js API for both apps
- **Packages**:
  - `db-connect`: Connection info for the Mysql database.
  - `shared-imports`: Monorepo-wide dependencies
  - `devtools`: Code generation + documentation
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

## 🧭 Session Priming Prompt (Recommended)

> You are working inside the WhatsFresh monorepo. Stay concise but friendly.  Use diffs or direct edits. Do not touch legacy views unless explicitly told. All config flows are driven by SQL views and EventType logic.

---
