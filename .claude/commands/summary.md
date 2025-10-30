---
description: "Generate and store session accomplishments and next steps summary"
allowed-tools: []
---

# Session Summary Generator

## Fetch Instructions from Database

```bash
curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventSQLId": "AI-summary"}'
```

**Follow the instructions returned from the database query above.**

For complete documentation, see `.shared/commands/summary.md`