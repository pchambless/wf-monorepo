---
description: "Generate and store session accomplishments generate a New Plan document"
allowed-tools: []
---

# Session Summary Generator (Shared Claude/Kiro)

1.  Generate a comprehensive session summary and store it in the plan_communications database for persistent AI coordination.
2.  Generate a new entry in the plans table outlining probable Next Steps to be addressed.

## Instructions

### IMPORTANT: Execution Order

1. **First: Create Next Steps Plan** - Generate and store the plan for the NEXT session
2. **Second: Create Session Summary** - Summarize work done in the CURRENT session
3. **Third: Log File Impacts** - Track files changed during the CURRENT session

The summary and impacts should reference the plan you WORKED ON (often plan_id: 0 for adhoc work), NOT the plan you just created for next steps.

### Create a detailed markdown summary outlining the probable next steps and store it in the database:

1. **Generate Plan** - Create markdown with the Plans for the Next Session
2. **Store in Database** - Use execDML to insert into plans table
3. **Capture plan_id** - Save this ID to reference in summary's "Next Steps" section
4. **Output Confirmation** - Show the stored record ID and brief summary

**Table**: `api_wf.plans`
**Fields**:

- `name`: Brief Name for the Plan's Next Steps (< 100 bytes)
- `status`: "pending"
- `priority`: "see steps" - include a priority spiel for each step.  'immediate', 'future', 'short term'
- `description`: .md format of the Planned next steps
- `comments`: ""
- `assigned_to`: ""

### Create a detailed markdown summary of the current session and store it in the database:

1. **Generate Summary** - Create markdown with accomplishments, statistics, next steps, key learnings
2. **Store in Database** - Use execDML to insert into plan_communications table
3. **Output Confirmation** - Show the stored record ID and brief summary

**Table**: `api_wf.plan_communications`
**Fields**:

- `plan_id`: 0 (for adhoc work) or the plan_id of the plan you WORKED ON (not the next steps plan)
- `from_agent`: "claude" | "kiro"
- `to_agent`: "claude" | "kiro" | "any"
- `type`: "summary"
- `subject`: Brief session topic
- `message`: Full markdown summary
- `status`: "" (empty)

**Table**: `api_wf.plans`
**Fields**:

- `name`: Brief Name for the Plan's Next Steps (< 100 bytes)
- `status`: "pending"
- `priority`: "see steps" - include a priority spiel for each step.  'immediate', 'future', 'short term'
- `description`: .md format of the Planned next steps
- `comments`: ""
- `assigned_to`: ""
- `created_by`: AI agent

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

### See Plan: (id of Plan just created)

1. [Next step Plan should be created before the Summary.  Refer to the Plans.id]


## 💡 Key Learnings

### [Concept/Pattern]

- What was learned and why it matters

---

**Status:** [Current state and readiness]

````

## Implementation

### For Both Claude and Kiro:
1. Generate summary markdown following template above
2. Execute curl command to create the Next Steps plan in plans table (Step 1)
3. Capture the returned plan_id from Step 1
4. Execute curl command to store summary in plan_communications table with plan_id (Step 2)
5. Execute curl command to log file impacts
6. Confirm storage and show record IDs

## Step 1: Create Next Steps Plan in Database

```bash
curl -X POST http://localhost:3001/api/execDML \
  -H "Content-Type: application/json" \
  -d '{
    "method": "INSERT",
    "table": "api_wf.plans",
    "data": {
      "name": "Session Next Steps - [Brief Topic]",
      "status": "pending",
      "priority": "medium",
      "description": "# Next Steps\n\n## Immediate (Priority: high)\n- Step 1\n- Step 2\n\n## Short Term (Priority: medium)\n- Step 3\n\n## Future (Priority: low)\n- Step 4",
      "comments": "",
      "assigned_to": "",
      "created_by": "claude"
    }
  }'
```

**Capture the returned `id` from this response to use as `plan_id` in Step 2.**

## Step 2: Store Summary in Database

```bash
curl -X POST http://localhost:3001/api/execDML \
  -H "Content-Type: application/json" \
  -d '{
    "method": "INSERT",
    "table": "api_wf.plan_communications",
    "data": {
      "plan_id": [ID_FROM_STEP_1],
      "from_agent": "claude",
      "to_agent": "any",
      "type": "summary",
      "subject": "Brief session topic here",
      "message": "# Full markdown summary here\n\nUse \\n for newlines in JSON string",
      "created_by": "claude"
    }
  }'
```

**Notes:**
- Replace `from_agent` and `created_by` with "kiro" if Kiro is creating the summary
- Use `plan_id: 0` for general summaries not tied to a specific plan
- Reference the plan_id from Step 1 in the summary's Next Steps section

## Optional: Update Module Dependencies (when applicable)

Run these commands if you created/deleted files or changed imports/exports:

```bash
# Generate dependency graph
npx madge . --json --webpack-config jsconfig.json > analysis-n-document/genDocs/output/monorepo/raw-madge.json

# Enhance with metadata
node analysis-n-document/genDocs/enhance-madge.js

# Create load files
node analysis-n-document/genDocs/create-load-files.js

# Populate database
npm run analyze:populate-db
```

**When to run:**
- Created or deleted files
- Modified imports/exports significantly
- Added/removed npm packages
- Refactored module structure

**When to skip:**
- Only modified config/documentation
- Changes didn't affect module dependencies
- Pure bug fixes without structural changes

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
