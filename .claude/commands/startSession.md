---
description: "To get caught up with recent Accomplishments and Next Step at Session Start."
allowed-tools: []
---

# Fetch Recent Summaries

## Fetch Instructions from Database

```bash
curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventSQLId": "AI-startSession"}'
```

**Follow the instructions returned from the database query above.**

This ensures consistent AI coordination across Claude and Kiro sessions.

For complete documentation, see `.shared/commands/startSession.md`
