---
description: "To get caught up with recent Accomplishments and Next Step at Session Start."
allowed-tools: []
---

# Session Startup (Shared Claude/Kiro)

## Fetch Instructions from Database

```bash
curl -X POST http://localhost:3001/api/execEventType \
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
curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventSQLId": "sessionRecentList"}'

# Get recent plan impacts (last 30 impacts over last 7 days)
curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventSQLId": "recentImpactList"}'

# Get Plan 45 architectural decisions and WhatsFresh page development context
curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventSQLId": "sessionPlan45"}'
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
