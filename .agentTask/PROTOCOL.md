# Agent Protocol - MANDATORY for ALL Agents

**ALL agents (Claude, Kiro, VSCode Copilot, GitHub Copilot) MUST follow this protocol.**

**DevNote:** While we want to follow this protocol, the protocol is subject to ammendments.
Ideas for improvements, new n8n workflows, changes because a protocol is not effective, are always welcome for discussion... We are a team and everyone has ideas.  Everyone can identify painpoints and inefficiencies.  Feel free to chime in, but otherwise, **follow the protocol**.

Last Updated: 2025-12-19

---

## 🎯 Core Principles

1. **Use n8n workflows for ALL database operations** (saves tokens, maintains consistency)
2. **Only ONE 'current' plan at a time** (Plan 75 as of 2025-12-19)
3. **Log EVERYTHING** via n8n (impacts, communications, milestones)
4. **Update currentPlanUpdates.md** at session end or milestones

**DevNote**: Before creating new processes, n8n workflows, or any other significant infrastructure, be sure and run it by the Dev before proceeding.  We don't want to jump the gun and run wild, as sometimes agents do.  

---

## 📋 Available n8n Workflows

**Reference:** `.agentTask/n8n-workflows/workflows.json` (auto-updated)

### Session Management
- **session-startup**: `http://localhost:5678/webhook/session-startup`
  - Get pre-aggregated session context (75% token savings vs MCP)
  - Returns: active plans, recent communications, system health

### Database Operations
- **adhoc-query**: `http://localhost:5678/webhook/adhoc-query`
  - Execute any SQL with parameter substitution
  - POST: `{"query": "SELECT...", "params": {...}, "agent": "claude"}`

### Logging & Tracking
- **log-impact**: `http://localhost:5678/webhook/log-impact`
  - Track file changes to plan_impacts
  - POST: `{"plan_id": 0, "file_path": "...", "change_type": "MODIFY", "description": "..."}`
  - Change types: CREATE, MODIFY, DELETE, ANALYZE, DISCOVER, COMMUNICATE, PLAN

- **create-communication**: `http://localhost:5678/webhook/create-communication`
  - Log agent coordination messages
  - POST: `{"plan_id": 1, "type": "guidance", "subject": "...", "message": "..."}`
  - Types: guidance, question, response, decision, status, analysis, technique

---

## 🔄 Session Startup Protocol

**At the start of EVERY session:**

```bash
curl -s http://localhost:5678/webhook/session-startup | jq .
```

This replaces individual MCP queries. Returns current plan, communications, and system health.

---

## 📊 Plan Management Rules

### Status Values (Standardized)
- `current` - ONE active plan only (currently Plan 75)
- `pending` - Backlog, not started (max 5)
- `blocked` - Temporarily stopped, needs unblocking
- `complete` - Finished (auto-sets deleted_at)
- `ongoing` - Special status for Plan 0 (adhoc) and Plan 1 (knowledge base)

### Rules
1. **Only ONE 'current' plan** at any time
2. **Completing a plan** automatically sets `deleted_at = NOW()`
3. **All work** goes to the current plan unless it's an emergency (Plan 0)
4. **Plan 0** (Adhoc Operations) - for quick fixes, always `ongoing`
5. **Plan 1** (Agent System Knowledge) - living documentation, always `ongoing`
6. **Plan Epics** Plans will now have Epic - Sprint alignment.

---

**DevNote:** before proceeding, look at the /home/paul/Projects/wf-monorepo/.agentTask/discussion.md to see if this is something new to be discussed.  

## 📝 Logging Requirements

### ALWAYS Log Impacts
After ANY file modification:

```bash
curl -X POST http://localhost:5678/webhook/log-impact \
  -H "Content-Type: application/json" \
  -d '{"plan_id": 75, "file_path": "/path/to/file", "change_type": "MODIFY", "description": "What changed"}'
```

### Log Coordination
When agents communicate decisions, guidance, or status:

```bash
curl -X POST http://localhost:5678/webhook/create-communication \
  -H "Content-Type: application/json" \
  -d '{"plan_id": 75, "type": "guidance", "subject": "...", "message": "..."}'
```
**DevNote:** n8n question:  Is it possible to encapsulate multiple workflows into a 
single workflow.  
1.  create-communication
2.  log all impacts:  log-impact
3.  update currentPlanUpdates.md? 
But instead of a big workflow, it orchestrates several workflows together... If this is 
possible, we might create a create-milestone workflow (name of workflow up for discussion.)
---

## 🏁 Session End Protocol

**BEFORE ending a session or hitting token limits:**

1. **Log all impacts** (batch via n8n)
2. **Create summary communication** (what was accomplished)
3. **Update** `.agentTask/currentPlanUpdates.md`
4. **Commit changes** (if applicable)

### Example Communication:
```json
{
  "plan_id": 75,
  "type": "status",
  "subject": "Session Summary: n8n Workflow Infrastructure",
  "message": "Built 4 n8n workflows (session-startup, adhoc-query, log-impact, create-communication). Auto-sync system operational. 75% token savings achieved."
}
```

---

## 🎯 Milestone Protocol

**When significant progress is made:**

1. Log impacts for all changes
2. Create guidance communication documenting the milestone
3. Update currentPlanUpdates.md
4. Consider if plan status should change

### What Constitutes a Milestone?
- Major feature completed
- Architecture decision finalized
- Significant refactoring done
- New system/workflow operational

---

## 🚫 What NOT to Do

❌ Use MCP queries directly (use n8n workflows instead)
❌ Work on multiple plans simultaneously
❌ Skip logging impacts
❌ Leave session without updating currentPlanUpdates.md
❌ Create communications without plan_id
❌ Mark plans complete without setting deleted_at

---

## 📖 Additional Documentation

- **Plan Management Discussion**: `.agentTask/plan-management.md`
- **n8n Workflow Registry**: `.agentTask/n8n-workflows/workflows.json`
- **Current Plan Updates**: `.agentTask/currentPlanUpdates.md`
- **Claude Preferences**: `CLAUDE.md`
- **Architecture Guidance**: `.kiro/steering.yaml`

---

## 🔄 Protocol Updates

This file is the **single source of truth**. All other agent configuration files point here.

When this protocol changes, all agents are notified via plan_communications.

---

**Questions or conflicts?** Create a communication with type="question" to discuss with team.
