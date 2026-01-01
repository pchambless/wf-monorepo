# n8n Workflow Export Strategies

## Overview

We have **3 export strategies** for managing n8n workflows in the filesystem, all based on querying the SQLite `workflow_entity` table directly instead of using the n8n CLI.

## Why Query the Database Directly?

**Benefits:**
- ✅ Filter by `active = 1` - only export active workflows
- ✅ Filter by `isArchived = 0` - exclude archived workflows  
- ✅ Compare `updatedAt` timestamp - incremental exports
- ✅ Export specific workflows by ID
- ✅ No duplicate exports of hidden/inactive workflows
- ✅ Complete control over export format and naming

**Database Location:**
- Container: `/home/node/.n8n/database.sqlite`
- Host: `/home/paul/Projects/wf-monorepo/.n8n/database.sqlite`

---

## Strategy 1: Full Active Export

**Script:** `export-active-workflows.js`

**When to use:**
- Initial setup
- After major cleanup (archiving/deleting workflows)
- When you want to ensure all active workflows are exported

**What it does:**
```sql
SELECT * FROM workflow_entity 
WHERE active = 1 AND isArchived = 0
```

**Usage:**
```bash
docker exec n8n-whatsfresh node /home/node/export-active.js
```

**Output:** Exports all 10 active workflows

---

## Strategy 2: Incremental Export (Only Changed)

**Script:** `export-changed-workflows.js`  
**Best for:** Scheduled/automated exports

**What it does:**
1. Queries all active workflows
2. Compares `updatedAt` (DB) vs file modification time
3. Only exports if DB timestamp is newer

**Usage:**
```bash
docker exec n8n-whatsfresh node /home/node/export-changed.js
```

**Output:**
```
✅ EXPORTED: Adhoc Query (updated 2025-12-28 14:30:12)
⏭️  SKIPPED: Module Dependency Analysis (no changes)
```

---

## Strategy 3: Single Workflow Export

**Script:** `export-single-workflow.js`  
**Best for:** Self-exporting workflows (add to end of each workflow)

**Usage:**
```bash
# Export specific workflow by ID
docker exec n8n-whatsfresh node /home/node/export-single.js <workflow-id>
```

**Self-Export Node Template:**
Add this HTTP Request node to any workflow to auto-export after execution:

```json
{
  "name": "Export This Workflow",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "http://host.docker.internal:3010/api/execute",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "command",
          "value": "docker exec n8n-whatsfresh node /home/node/export-single.js {{ $workflow.id }}"
        }
      ]
    }
  }
}
```

---

## Recommendation

**Hybrid Approach:**
1. **Scheduled:** Run incremental export every hour/day via cron
2. **Self-Export:** Add export node to critical workflows for immediate backup
3. **Full Export:** Run manually after major changes

## Database Schema Reference

```sql
workflow_entity table:
- id (varchar)          - Workflow unique ID
- name (varchar)        - Human-readable name
- active (boolean)      - Is workflow active?
- isArchived (boolean)  - Is workflow archived?
- updatedAt (datetime)  - Last modification time
- nodes (TEXT/JSON)     - Workflow nodes
- connections (TEXT/JSON) - Node connections
- settings (TEXT/JSON)  - Workflow settings
```
