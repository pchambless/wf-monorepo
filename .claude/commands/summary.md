---
description: "Generate and store session accomplishments and next steps summary"
allowed-tools: []
---

# Session Summary Generator

## Fetch Instructions from Database

```javascript
mcp_mysql_sql_query({
  sql: "SELECT qrySQL FROM api_wf.AISql WHERE id = 42"
})
// Then execute the returned qrySQL to get the full instructions
```

**Follow the instructions returned from the database query above.**

For complete documentation, see `.shared/commands/summary.md`