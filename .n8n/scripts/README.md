# n8n Workflow Helper Scripts

Simple command-line wrappers for n8n workflows. Agents can call these directly instead of crafting curl commands.

## Available Scripts

### session-startup
Get session context (active plans, communications, system health)

```bash
/home/paul/Projects/wf-monorepo/.n8n/scripts/session-startup
```

### adhoc-query
Execute SQL queries via n8n

```bash
/home/paul/Projects/wf-monorepo/.n8n/scripts/adhoc-query "SELECT * FROM api_wf.plans LIMIT 5" claude
```

**Parameters:**
- `$1` - SQL query (required)
- `$2` - Agent name (optional, default: claude)

### log-impact
Log file changes to plan_impacts table

```bash
/home/paul/Projects/wf-monorepo/.n8n/scripts/log-impact 75 "src/file.js" "CREATE" "Added new feature"
```

**Parameters:**
- `$1` - Plan ID (required)
- `$2` - File path (required)
- `$3` - Change type: CREATE, MODIFY, DELETE, ANALYZE, etc. (required)
- `$4` - Description (required)

### create-communication
Create plan communications

```bash
/home/paul/Projects/wf-monorepo/.n8n/scripts/create-communication 75 "milestone" "Phase 2 Complete" "All triggers implemented successfully" claude any
```

**Parameters:**
- `$1` - Plan ID (required)
- `$2` - Type: guidance, question, response, decision, status, analysis, technique, milestone (required)
- `$3` - Subject (required)
- `$4` - Message (required)
- `$5` - From agent (optional, default: claude)
- `$6` - To agent (optional, default: any)

## Usage in Agent Commands

Agents can call these directly:

```bash
# Session startup
bash /home/paul/Projects/wf-monorepo/.n8n/scripts/session-startup | jq .

# Query database
bash /home/paul/Projects/wf-monorepo/.n8n/scripts/adhoc-query "SELECT COUNT(*) FROM api_wf.plans" | jq .

# Log impact
bash /home/paul/Projects/wf-monorepo/.n8n/scripts/log-impact 75 "db/triggers/epic.sql" "CREATE" "Added epic validation trigger"

# Create communication
bash /home/paul/Projects/wf-monorepo/.n8n/scripts/create-communication 1 "technique" "Simple n8n Wrappers" "Created shell scripts for easy workflow access"
```

## Requirements

- n8n running on http://localhost:5678
- Workflows must be active
- MySQL credential "MySQL api_wf" must be configured
- `jq` installed for JSON handling (in scripts)
