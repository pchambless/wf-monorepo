# WhatsFresh 2.0 - AI Coding Agent Instructions

## 🏗️ Architecture Overview

WhatsFresh is a **database-driven monorepo** for food production management. Everything is configured through SQL views and stored procedures, not hardcoded logic.

**Core Apps:**
- `apps/server` (Port 3001): Express.js API shared by all frontends  
- `apps/studio` (Port 3004): React development studio for visual page design
- `apps/universal-app`: Template-based React frontend renderer
- `apps/api-gateway`: Authentication and request routing

**Key Package:**
- `packages/shared-imports`: Centralized utilities, configs, and common functions used across all apps

## 🎯 Development Workflow

### Database-First Development
All system behavior is SQL-driven via the `execEvent` API:
```javascript
// Frontend pattern for all data operations
import { execEvent } from '../utils/api';
const result = await execEvent('qryName', { param1: 'value' });
```

**Critical Files:**
- `apps/server/server/controller/execEvent.js`: Core API endpoint
- `AI/sql/api_wf/views/`: SQL views that drive UI configuration  
- `sql/database/`: Database schema and stored procedures

### Monorepo Management
- Uses **Turbo** for task orchestration and workspace management
- Run development: `npm run dev-client`, `npm run dev-studio`, `npm run server`
- Scripts in root `package.json` handle cross-app coordination

## 🧠 AI Collaboration Patterns

### Session Startup Protocol
When starting work, **always** read `CLAUDE.md` first for:
- Current behavior patterns and tone preferences
- Config-driven development standards (never hardcode values)
- Documentation priority and database query examples

### Plan Management System
- All work tracked in `api_wf.plans` database table
- Use `claude-plans/` directory for active plan documentation
- Format: "Plan NNNN" to signal context switches between tasks
- Check `claude-plans/tools/test-events.js` for database interaction patterns

### Agent Responsibilities (per `AI/collaboration-rules.md`):
- **Claude**: Analysis, guidance, architectural decisions
- **Kiro**: Implementation, testing, pattern replication  
- **User**: Plan creation, scope decisions, requirement setting

## ⚙️ Technical Patterns

### Configuration Management
**Never hardcode** - use config files in `packages/shared-imports/src/architecture/config/`:
```javascript
// ❌ Don't do this
const status = "pending";

// ✅ Do this  
import { getStatusOptions } from '@whatsfresh/shared-imports';
const status = getStatusOptions().pending;
```

### Component Rendering System
Pages are dynamically generated via `PageStructureRenderer.jsx`:
1. Calls `sp_pageStructure(pageID)` stored procedure
2. Merges template + page-specific components  
3. Renders via `ComponentRenderer` with database-driven props

### API Communication
All backend calls use unified `execEvent` pattern:
- Replace old `execEventType` with `execEvent` 
- Parameters auto-resolved from context_store
- Event definitions stored in `api_wf.eventSQL` table

## 🚀 Quick Start Commands

```bash
# Development servers
npm run server              # Backend API (port 3001)
npm run dev-studio          # Studio app (port 3004)  
npm run dev-client          # Universal app frontend

# Analysis & documentation
npm run analyze:all         # Dependency analysis
npm run generate:all        # Generate page configs and docs
```

## 🔌 Database Access for AI Agents

### Copilot Database Controller
Use `/api/copilot/query` endpoint for direct database access:

```bash
# Active plans
curl -s -X POST http://localhost:3001/api/copilot/query \
-H "Content-Type: application/json" \
-d '{"sql": "SELECT id, name, status, description FROM api_wf.plans WHERE active = 1", "userEmail": "claude@whatsfresh.ai"}' | jq .

# Investigation tools
curl -s -X POST http://localhost:3001/api/copilot/query \
-H "Content-Type: application/json" \
-d '{"sql": "SELECT category, qryName, description FROM api_wf.AISql WHERE active = 1 AND category = \"investigation\"", "userEmail": "claude@whatsfresh.ai"}' | jq .
```

**Required Pattern:**
- **Controller:** `/apps/server/server/controller/copilotQuery.js`
- **Email Required:** Always include `"userEmail": "claude@whatsfresh.ai"` in request body
- **Safety:** Read-only queries, auto-adds LIMIT clause
- **Audit:** All queries logged with user email for tracking

## 🔍 Investigation Starting Points

**For Component Changes:** Start with `apps/universal-app/src/rendering/`  
**For API Changes:** Start with `apps/server/server/controller/execEvent.js`  
**For Database Schema:** Check `AI/sql/api_wf/` for views and procedures  
**For Shared Logic:** Explore `packages/shared-imports/src/`

**Emergency Recovery:** Database is source of truth - query `api_wf.plans`, `api_wf.eventSQL`, and `api_wf.AISql` for investigation queries when context is lost.