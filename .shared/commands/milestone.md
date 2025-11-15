---
description: "Create a session checkpoint/milestone for an active plan"
allowed-tools: []
---

# Milestone Checkpoint (Shared Claude/Kiro)

## Fetch Instructions from Database

```bash
curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventSQLId": "AI-Milestone"}'
```

**Follow the instructions returned from the database query above.**

This creates checkpoint communications during active plan work for seamless session continuity and handoffs between Claude and Kiro.
