---
description: "Create a session checkpoint/milestone for an active plan"
allowed-tools: []
---

# Milestone Checkpoint (Shared Claude/Kiro)

## ⚡ CRITICAL: Always Use MCP for Database Operations

**DO NOT use HTTP endpoints - use MCP MySQL tool directly for all database operations.**

## Create Milestone Communication

When you complete a significant phase of work on an active plan, create a milestone communication:

✅ **Use MCP MySQL tool** (NOT curl/HTTP):

```javascript
mcp__mysql__sql_query({
  sql: "INSERT INTO api_wf.plan_communications (plan_id, from_agent, to_agent, type, subject, message, created_by) VALUES ([PLAN_ID], 'claude', 'any', 'milestone', 'Brief milestone description', '# Milestone: [Title]\n\n## Accomplished\n- Item 1\n- Item 2\n\n## Statistics\n- Metrics here\n\n## Next Steps\n- What remains', 'claude')"
})
```

**Template Fields:**
- `plan_id` - The active plan you're working on
- `type` - Always 'milestone'
- `subject` - Brief 1-line description
- `message` - Markdown summary of accomplishments and next steps

This creates checkpoint communications during active plan work for seamless session continuity and handoffs between Claude and Kiro.
