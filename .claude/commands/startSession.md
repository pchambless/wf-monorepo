---
description: "Session startup - optimized via n8n workflow"
---

# Session Startup

**Claude, Kiro and Copilot use the same startup process.**

Call the n8n session startup webhook to get pre-aggregated session context:

```bash
curl -s http://localhost:5678/webhook/session-startup | jq .
```

This returns:
- Active plans (top 5)
- Recent communications (top 5)
- System health metrics
- Investigation tools count

**Token savings: ~75% vs individual MCP queries**

## What's Included

The n8n workflow queries and formats:
- `api_wf.plans` - Active development plans
- `api_wf.plan_communications` - Recent agent coordination
- `api_wf.plan_impacts` - Recent file changes
- System health counters (plans, queries, composites, pages)
- Available investigation tools count

## Evolution

Modify the n8n workflow (Agent Session Startup) to add/remove queries as needed. The workflow handles aggregation and formatting automatically.
