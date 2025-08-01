# CLAUDE.md - WhatsFresh Working Guide

_Working documentation - stays current because Claude depends on it daily_

## 🧠 Core Behavior

- **Tone**: Concise, technical, respectful, minimally verbose
- **Code Style**: NO comments unless explicitly requested
- **Philosophy**: MVP development - break and fix over backward compatibility
- **Modularization**: Always try to modularize code if a module gets complicated or large.

## 📖 Documentation Priority

1. **`.kiro/steering.yaml`** - Live project patterns and file paths
2. **`CLAUDE.md`** - This file - behavioral preferences
3. **`AI/planning-standards.md`** - Plan phases, impact types, and agent roles
4. **`AI/collaboration-rules.md`** - Role boundaries
5. **`AI/session-startup.md`** - Context recovery

 ## Config-Driven Development Standards

  ### Philosophy: Configuration files drive process logic, not hardcoded values

  Established Config System

  - Location: /packages/shared-imports/src/architecture/config/
  - Pattern: JSON configs with centralized loaders in index.js
  - Existing: clusters.json, communication-types.json, priorities.json, complexities.json

  Mandatory Externalization

  Never hardcode these values - use config files:

  1. Database Schema: table: "api_wf.plans" → getSchemaMapping('plans')
  3. Status Values: "pending", "completed" → getStatusOptions()
  4. Agent Names: ["claude", "kiro", "user"] → getAgentOptions()
  5. Retry Policies: maxAttempts: 3 → getRetryPolicy(type)
  6. Error Messages: Hardcoded strings → error-messages.json
  7. URLs/Endpoints: localhost:3001 → environment-based config

  Extension Pattern

  // GOOD: Extend existing config system
  import { getStatusOptions, getAgentOptions } from '../config';

  // BAD: Create new hardcoded arrays
  const validTypes = ["strategic-input", "priority-change"];

  Config Organization

  config/
  ├── workflows/
  │   ├── agents.json          # Agent routing rules
  │   ├── statuses.json        # All valid status values
  │   ├── retry-policies.json  # Timeout configurations
  │   ├── schemas.json         # Database mappings
  │   └── paths.json           # File path templates

  Rule: If it's a magic string, business rule, or varies by environment - externalize it to config.

## 🎛️ Investigation Efficiency

- **Check steering.yaml first** for frequent_paths before searching
- **Reference established_patterns** to avoid re-investigation
- **Focus on deep_investigation areas** where decisions are needed

### Common paths to search in
  #### shared-imports
  - **Components**: `/packages/shared-imports/src/components/` (forms, crud, navigation)
  - **Architecture**: `/packages/shared-imports/src/architecture/` (workflows, components)
  - **Events**: `/packages/shared-imports/src/events/` (eventTypes, pageMaps)
  - **Utils**: `/packages/shared-imports/src/utils/` (fileOperations, helpers)
  - **Navigation**: `/home/paul/wf-monorepo-new/packages/shared-imports/src/components/navigation` (sidebar, appbar)
  - **EventTypes**: `/home/paul/wf-monorepo-new/packages/shared-imports/src/events` (admin, client, plans)
  - **Workflows**: `/home/paul/wf-monorepo-new/packages/shared-imports/src/architecture/workflows` (Planning workflows)

  ### wf-server
  - **Controllers**: `/apps/wf-server/server/controller/` (business logic)
  - **Utils**: `/apps/wf-server/server/utils/` (dml, queryResolver)
  - **Workflows**: `/home/paul/wf-monorepo-new/apps/wf-server/server/workflows` (plans, communications, impact-tracking)
  - **Routes**: `/home/paul/wf-monorepo-new/apps/wf-server/server/routes/registerRoutes.js` (controllers, routes)
  - **app.js**: `/home/paul/wf-monorepo-new/apps/wf-server/server/app.js` (app.js, app start)
  - **server.js**: `/home/paul/wf-monorepo-new/apps/wf-server/server` (instead of src folder)
  - **utils/dml**: `\\wsl$\Ubuntu-22.04\home\paul\wf-monorepo-new\apps\wf-server\server\utils\dml` (dml modules)

  #### wf-client
  - **Pages**: `/apps/wf-client/src/pages/` (UI components)
  - **Config**: `/apps/wf-client/src/config/` (navigation, routes)
  - **App.jsx**: `/home/paul/wf-monorepo-new/apps/wf-client/src/App.jsx` (App.jsx)

  #### .kiro (plans)

## 🔧 Workflow Helpers

- **createDoc.js** - Shared document creation with impact tracking
- **createPlanImpact.js** - Impact tracking for all file changes
- **Co-located templates** - Templates live with workflows (Template.js)
- **Document Creation**: Use createDoc.js workflow instead of direct file writing - maintains impact tracking and template consistency. This will help conserve token usage
- **Always use createGuidance.js workflow for implementation guidance documents** - ensures proper parameter substitution and impact tracking
- **Always use createAnalysis.js workflow for architectural analysis documents** - maintains consistent structure and automated workflows

## 📋 Quick Fix Impact Tracking

When making spontaneous edits:

1. **Make changes** using appropriate tools
2. **Track impact immediately**:

```bash
curl -X POST http://localhost:3001/api/execDML -H "Content-Type: application/json" \
-d '{"method": "INSERT", "table": "api_wf.plan_impacts", "data": {"plan_id": 0, "file_path": "[PATH]", "change_type": "[TYPE]", "phase": "adhoc", "description": "[DESC]", "status": "completed", "userID": "claude"}}'
```

3. **Plan 0000 "Adhoc-Operations"** for all quick fixes

## 💬 Plan Communications

**Create guidance communications for agents:**

```bash
curl -X POST http://localhost:3001/api/execDML -H "Content-Type: application/json" \
-d '{"method": "INSERT", "table": "api_wf.plan_communications", "data": {"plan_id": [PLAN_ID], "from_agent": "claude", "to_agent": "[AGENT]", "type": "guidance", "subject": "[SUBJECT]", "message": "[MESSAGE]", "userID": "claude"}}'
```

**Note**: AgentCoordinationModal should trigger after communication creation but may not work for programmatic inserts.

## 🤝 Collaboration

- **Claude**: Architecture, analysis, investigation support
- **Kiro**: Implementation, testing, impact tracking
- **Communication**: Via `.kiro/communication/coordination-log.json`

## 🚀 Session Management

- **Startup**: Check session-startup.md and coordination-log.json
- **Plan Context**: Wait for "Plan NNNN" signal
- **Token Conservation**: Batch calls, reference docs, use TodoWrite

## 📝 Plan Impact Standards

**See `AI/planning-standards.md` for complete specifications:**

- Change types (CREATE, MODIFY, DELETE, ANALYZE, DISCOVER, COMMUNICATE, PLAN)
- Phase definitions (idea, analysis, guidance, development, adhoc)
- Agent role assignments and responsibilities
- Communication protocols and process quality metrics

_Updated: 2025-07-27_
