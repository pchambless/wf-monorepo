---
description: "Generate and store session accomplishments and next steps summary"
allowed-tools: []
---

# Session Summary Generator (Shared Claude/Kiro)

Generate a comprehensive session summary and store it in the plan_communications database for persistent AI coordination.

## Instructions

Create a detailed markdown summary of the current session and store it in the database:

1. **Generate Summary** - Create markdown with accomplishments, statistics, next steps, key learnings
2. **Store in Database** - Use execDML to insert into plan_communications table
3. **Output Confirmation** - Show the stored record ID and brief summary

## Database Storage

**Table**: `api_wf.plan_communications`
**Fields**:

- `plan_id`: 0 (for general AI coordination summaries)
- `from_agent`: "claude" | "kiro"
- `to_agent`: "claude" | "kiro" | "any"
- `type`: "summary"
- `subject`: Brief session topic
- `message`: Full markdown summary
- `status`: "" (empty)

## Summary Template

````markdown
# [AI Name] Session Summary - [Date YYYY-MM-DD]

**Focus:** [One-line summary]
**Primary AI:** Claude | Kiro

---

## 🤝 AI Coordination Check

**Recent Summaries Query:**

```sql
SELECT id, from_agent, subject, created_at
FROM api_wf.plan_communications
WHERE type = 'summary' AND plan_id = 0
ORDER BY created_at DESC LIMIT 2
```
````

**Session Handoff:**

- [ ] **For Claude:** [Architecture/analysis tasks]
- [ ] **For Kiro:** [Implementation tasks]

---

## ✅ Major Accomplishments

### 1. [Category]

- Specific achievements with file paths/function names

---

## 📊 Statistics

- Files created/modified: X
- Functions added: Y
- Bugs fixed: Z

---

## 🚀 Next Steps

### Immediate (Next Session)

1. [Specific actionable task]

### Short Term

2. [Task]

---

## 💡 Key Learnings

### [Concept/Pattern]

- What was learned and why it matters

---

**Status:** [Current state and readiness]

````

## Implementation

### For Both Claude and Kiro:
1. Generate summary markdown following template above
2. Execute curl command to store summary in plan_communications
3. Execute curl command to log file impacts
4. Confirm storage and show record IDs

## Storing Summary in Database

```bash
curl -X POST http://localhost:3001/api/execDML \
  -H "Content-Type: application/json" \
  -d '{
    "method": "INSERT",
    "table": "api_wf.plan_communications",
    "data": {
      "plan_id": 0,
      "from_agent": "claude",
      "to_agent": "any",
      "type": "summary",
      "subject": "Brief session topic here",
      "message": "# Full markdown summary here\n\nUse \\n for newlines in JSON string",
      "userID": "claude"
    }
  }'
```

**Note:** Replace `from_agent` with "kiro" if Kiro is creating the summary.

## Logging File Impacts

After completing work, log all file changes to `plan_impacts`:

```bash
# Template for multiple file modified/created/removed
curl -X POST http://localhost:3001/api/logImpact \
  -H "Content-Type: application/json" \
  -d '{
    "impacts": [
      {
        "filePath": "file_path.js",
        "changeType": "MODIFY", 
        "description": "modifications description",
        "affectedApps": ["appName"],
        "createdBy": "AI agent"
      },
      {
        "filePath": "file_path.js",
        "changeType": "CREATE",
        "description": "New module description",
        "affectedApps": ["appName"],
        "createdBy": "AI agent"
      },
	  {
        "filePath": "file_path.js",
        "changeType": "DELETE", 
        "description": "Reason for removal of module", 
        "affectedApps": ["appName"],
        "createdBy": "AI agent"
      }
    ],
    "planId": 0
  }'
```

**Important:**
- DO NOT include `batch_id` - it's a generated column
- Valid `changeType`: CREATE, MODIFY, DELETE, ANALYZE, DISCOVER
- Use `planId: 0` for adhoc operations
- Field names are camelCase: `filePath`, `changeType`, `affectedApps`, `createdBy`, `planId`

## Benefits

- **Persistent History**: All AI sessions stored and searchable
- **Seamless Handoffs**: Next AI can query recent summaries
- **No Manual Work**: Eliminates document creation overhead
- **Coordination**: Prevents duplicate work between AIs
- **Context Continuity**: Maintains session context across AI switches

````

This creates a unified AI coordination system where both Claude and Kiro contribute to a shared knowledge base.
