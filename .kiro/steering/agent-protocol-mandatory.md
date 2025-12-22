# MANDATORY: Agent Protocol Compliance

**CRITICAL: Read .agentTask/PROTOCOL.md at the start of EVERY session**

## Session Startup Checklist:
1. ✅ Run session-startup workflow: `curl -s http://localhost:5678/webhook/session-startup`
2. ✅ Focus on current plan only (Plan 75 as of 2025-12-19)
3. ✅ Use n8n workflows instead of direct MCP queries
4. ✅ Log all impacts after file modifications
5. ✅ Update currentPlanUpdates.md at session end

## Available n8n Workflows:
- `session-startup` - Get session context (75% token savings)
- `adhoc-query` - Execute SQL with parameters
- `log-impact` - Track file changes
- `create-communication` - Log agent coordination

## Protocol Location:
**Full details**: `.agentTask/PROTOCOL.md`

---
**This steering file ensures protocol compliance across all sessions.**