---
description: "To get caught up with recent Accomplishments and Next Step at Session Start."
allowed-tools: []
---

# Fetch Recent Summaries  (Shared Claude/Kiro)

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
```

This creates a unified AI coordination system where both Claude and Kiro contribute to a shared knowledge base.
