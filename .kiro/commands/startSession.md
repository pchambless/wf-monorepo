---
description: "Session startup - see shared documentation"
---

# Session Startup

**Both Claude and Kiro use the same startup process.**

See: `.shared/commands/startSession.md`

## Quick Start

```javascript
// Get startup queries from database
mcp_mysql_sql_query({
  sql: "SELECT qryName, description, qrySQL FROM api_wf.AISql WHERE category = 'startup' AND active = 1 ORDER BY id"
})
```

Execute each qrySQL returned to get session context.
