---
description: "Database-driven session startup for both Claude and Kiro"
allowed-tools: []
---

# Session Startup - Database-Driven (Both Agents)

## 🚀 Philosophy: Database as Source of Truth

Both Claude and Kiro execute the same startup queries from `api_wf.AISql` table.

## ⚡ CRITICAL: Always Use MCP for Database Operations

**DO NOT use HTTP endpoints (execDML, execEvent, setVals) - use MCP directly:**

✅ **Correct** - MCP MySQL tool:
```javascript
mcp__mysql__sql_query({ sql: "SELECT * FROM api_wf.plans WHERE id = 45" })
```

❌ **Wrong** - HTTP endpoints (requires login, adds complexity):
```bash
curl -X POST http://localhost:3001/api/execDML ...
```

**Why MCP?**
- No login required
- Direct database access
- Faster (no HTTP overhead)
- Simpler (no session management)
- Use SELECT * without guessing columns (see Plan 1 guidance id=151)

## Quick Start: Execute Startup Queries

```javascript
// Get all startup queries
mcp_mysql_sql_query({
  sql: "SELECT qryName, description, qrySQL FROM api_wf.AISql WHERE category = 'startup' AND active = 1 ORDER BY id"
})

// Then execute each qrySQL returned above
```

## Standard Startup Queries

The `startup` category in AISql includes:

1. **startup_active_plans** - Current development work
2. **startup_investigation_tools** - Available investigation queries
3. **startup_recent_impacts** - Latest file changes
4. **startup_system_health** - Key metrics
5. **startup_recent_communications** - Agent coordination messages

## Example Startup Flow

```javascript
// 1. Active Plans
mcp_mysql_sql_query({
  sql: "SELECT id, name, status, description FROM api_wf.plans WHERE active = 1 ORDER BY id DESC LIMIT 10"
})

// 2. Investigation Tools
mcp_mysql_sql_query({
  sql: "SELECT category, qryName, description FROM api_wf.AISql WHERE active = 1 AND category = 'investigation' ORDER BY usage_count DESC"
})

// 3. Recent Impacts
mcp_mysql_sql_query({
  sql: "SELECT plan_id, file_path, change_type, description, created_at FROM api_wf.plan_impacts ORDER BY created_at DESC LIMIT 20"
})

// 4. System Health
mcp_mysql_sql_query({
  sql: "SELECT (SELECT COUNT(*) FROM api_wf.plans WHERE active = 1) as active_plans, (SELECT COUNT(*) FROM api_wf.eventSQL WHERE active = 1) as active_queries"
})
```

## Using AISql Queries with Parameters

AISql queries use `:paramName` placeholders. **Agents should copy the SQL and replace parameters directly:**

```javascript
// 1. Get the query template
mcp_mysql_sql_query({
  sql: "SELECT qrySQL FROM api_wf.AISql WHERE qryName = 'investigate_component_props'"
})
// Returns: "SELECT prop_id, xref_id, prop_name, prop_val, source FROM eventProps WHERE xref_id = :xref_id ORDER BY prop_name"

// 2. Replace :xref_id with actual value and execute
mcp_mysql_sql_query({
  sql: "SELECT prop_id, xref_id, prop_name, prop_val, source FROM eventProps WHERE xref_id = 81 ORDER BY prop_name"
})
```

**Pattern:**
1. Query AISql for the template SQL
2. Copy the qrySQL text
3. Replace `:paramName` with your value
4. Execute the modified SQL

**Note:** The `execEvent` API handles context_store lookups for apps, but agents with MCP access substitute parameters directly.

## Key Investigation Tables

- `api_wf.AISql` - Pre-built investigation queries by category
- `api_wf.plans` - Active development plans
- `api_wf.plan_impacts` - File changes and impacts
- `api_wf.plan_communications` - Agent coordination
- `api_wf.eventSQL` - All system queries (qryName, qrySQL)
- `api_wf.eventType` - Event type definitions
- `api_wf.page_registry` - Page configurations

## Available MCP Tools (Both Agents)

- `mcp_mysql_sql_query({ sql: "..." })` - Execute any SQL query
- `mcp_mysql_get_database_info()` - List databases and tables
- `mcp_mysql_check_permissions()` - Check permissions
- `mcp_mysql_get_operation_logs()` - View query history

## MCP Setup (One-Time Configuration)

**See `.shared/SECURITY-SETUP.md` for complete setup instructions**

Both agents need MCP MySQL access configured once. After setup, verify with:
```bash
claude mcp list  # Should show: mysql: ✓ Connected
```

## Login (ONLY for UI Testing - NOT for Database Operations)

**For database operations, ALWAYS use MCP. Only login when manually testing the UI in a browser.**

## Adding New Startup Queries

To add a new query to session startup:

```sql
INSERT INTO api_wf.AISql (category, qryName, qrySQL, description, created_by)
VALUES (
  'startup',
  'startup_your_query_name',
  'SELECT ... FROM ... WHERE ...',
  'Description of what this query provides at startup',
  'your_name'
);
```

## Benefits of Database-Driven Startup

✅ **Single source of truth** - Update startup in database, not files
✅ **Version controlled** - Startup queries tracked with usage_count
✅ **Dynamic** - Change startup process without code changes
✅ **Consistent** - Both agents get identical instructions
✅ **Discoverable** - Startup queries visible in AISql table
✅ **Flexible** - Add/remove startup queries easily

## Related Documentation

- `.shared/commands/aisql-queries.md` - AISql query reference
- `.shared/SECURITY-SETUP.md` - Complete MCP setup guide
- `AI/session-startup.md` - Detailed session startup protocol
- `CLAUDE.md` - Core behavior and patterns
