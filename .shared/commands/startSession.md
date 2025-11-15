---
description: "To get caught up with recent Accomplishments and Next Step at Session Start."
allowed-tools: []
---

# Session Startup (Shared Claude/Kiro)

## Step 1: Login (Required)

```bash
# Claude agents:
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "claude.ai-agent@test.com", "password": "aiagent123"}'

# Kiro agents:
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "kiro.ai-agent@test.com", "password": "aiagent123"}'
```

## Step 2: Fetch Instructions from Database

```bash
curl -X POST http://localhost:3002/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventSQLId": "AI-startSession"}'
```

**Follow the instructions returned from the database query above.**

---

# Instructions (Stored in Database - Reference Only)

Fetch the recent summaries and module impacts from AI sessions.

## Instructions

Run curl commands to fetch recent session context:

```bash
# Get last 2 AI summaries
curl -X POST http://localhost:3002/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventSQLId": "AI-RecentList"}'

# Get recent plan impacts (last 30 impacts over last 7 days)
curl -X POST http://localhost:3002/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventSQLId": "recentImpactList"}'
```

## Context Notes

**Plan 45** is the living architecture document for WhatsFresh development:
- Architecture decisions (form layouts, navigation patterns, {pageName} template cloning)
- Design patterns and component templates
- Appsmith prototypes and UI mockups (AI/reference/ui-mockups/whatsfresh/)
- Studio updates for page generation workflows
- Data model updates and schema changes

All WhatsFresh page development work either:
1. Tracks impacts directly to Plan 45 (architectural changes)
2. Creates separate plans but cross-references Plan 45 via plan_communications

This creates a unified AI coordination system where both Claude and Kiro contribute to a shared knowledge base.

## AI-analysis Queries (Dead Code & Dependencies)

**Available queries for module analysis (updated daily at 2am):**

- **deadCodeList** - Files with no imports (dead code candidates)
- **moduleDependencies** - What does file X import?
- **moduleUsedBy** - What files depend on X? (blast radius check)
- **moduleBlastRadius** - High-impact modules (many dependents)
- **moduleImpactHistory** - Recently modified modules

**When to use:**
- User asks "what files are unused?" or "can we delete X?"
- Before refactoring: check moduleUsedBy for blast radius
- Planning cleanup: query deadCodeList or moduleBlastRadius

**Example:**
```bash
# Set parameter first
curl -X POST http://localhost:3002/api/setVals \
  -d '{"values": [{"paramName": "filePath", "paramVal": "apps/server/server/controller/userLogin.js"}]}'

# Execute query
curl -X POST http://localhost:3002/api/execEventType \
  -d '{"eventSQLId": "moduleUsedBy"}'
```

**Data refreshes:** Daily at 2am via cron (481 files, 205 dead code candidates)
