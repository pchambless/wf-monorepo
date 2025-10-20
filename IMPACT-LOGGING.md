# Impact Logging System

Coordination system for tracking file changes made by Claude, Kiro, and human developers.

## 🎯 Quick Start

### For AI Agents (Claude/Kiro) - Use Direct API Endpoint

**Most efficient approach - single API call to batch multiple impacts:**

```bash
curl -X POST http://localhost:3001/api/logImpact \
  -H "Content-Type: application/json" \
  -d '{
    "impacts": [
      {
        "filePath": "apps/server/new.js",
        "changeType": "create",
        "description": "Created new endpoint",
        "affectedApps": ["server"],
        "createdBy": "claude"
      },
      {
        "filePath": "apps/client/old.js",
        "changeType": "modify",
        "description": "Fixed bug",
        "affectedApps": ["client"],
        "createdBy": "kiro"
      }
    ],
    "planId": 1
  }'
```

### For Human Developers - Use CLI Tool

```bash
# Add impacts as you work
node impact-cli.mjs add create "apps/server/new.js" "Created new endpoint" "server"
node impact-cli.mjs add modify "apps/client/old.js" "Fixed bug" "client"

# Submit all impacts when done
node impact-cli.mjs submit

# List pending sessions
node impact-cli.mjs list

# Clean up without submitting
node impact-cli.mjs cleanup
```

## 🏗️ How It Works

### Direct API Endpoint (Recommended for AIs)
- Single POST to `/api/logImpact` with array of impacts
- Immediately persisted to `api_wf.plan_impacts` table
- Batch ID auto-generated as virtual column: `{createdBy}-{timestamp}` (e.g., `claude-20251018-1430`)

### CLI Tool (For Humans)
1. **Create Session**: Generates readable session name in `.impact-logs/`
2. **Add Impacts**: Accumulates changes in temporary JSON file
3. **Submit**: Sends all impacts to API in one batch
4. **Cleanup**: Deletes temporary file on success

## 🎭 Benefits

- **Efficient Batching**: Log multiple related changes in one call
- **Coordination**: See who changed what and when
- **Cross-app Analysis**: Track which apps are affected by changes
- **Readable IDs**: No UUIDs - batch IDs are human/AI readable

## 🔧 Change Types

- `create` - New files
- `modify` - Changed files
- `delete` - Removed files
- `rename` - Moved/renamed files

## 📊 Database Schema

Impacts are stored in `api_wf.plan_impacts` table with:

- **Readable batch IDs** - Virtual column: `{createdBy}-{YYYYMMDD-HHMM}` (e.g., `claude-20251018-1430`)
- **File paths** - Auto-generated fileName/fileFolder from path
- **Affected apps** - Array for cross-app analysis
- **Created by** - `claude`, `kiro`, or `user`
- **Timestamps** - When changes were made
- **Descriptions** - What was changed and why

**Note:** The `batch_id` column is a virtual generated column - you don't need to provide it. It's automatically created from `created_by` + `created_at`.

## 🔍 Checking Recent Impacts

### Recent Changes (Last 7 Days)

Check what's been changed recently (last 7 days, up to 30 records):

```bash
# All agents - see everyone's changes
curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventType": "planImpactList", "eventSQLId": 24, "params": {"created_by": null}}'

# Specific agent - filter by created_by
curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventType": "planImpactList", "eventSQLId": 24, "params": {"created_by": "kiro"}}'
```

Returns: `plan_id, fileName, fileFolder, change_type, description, batch_id, created_at, created_by`

### File-Specific History

Check all changes to a specific file:

```bash
curl -X POST http://localhost:3001/api/execEventType \
  -H "Content-Type: application/json" \
  -d '{"eventType": "planImpactFile", "eventSQLId": 26, "params": {"fileName": "impactLogger.js"}}'
```

Returns: `plan_id, fileName, fileFolder, change_type, description, batch_id` (ordered by most recent first)

**Use cases:**
- Before modifying a file, see who changed it last
- Track evolution of a specific component
- Coordinate on files being actively developed

## 🚀 Workflow

### For Claude/Kiro (during session):
1. **Check recent impacts** - Review `planImpactList` query before starting
2. **Make changes** - Edit/create/delete files as needed
3. **Log impacts** - Single API call with all changes when done (don't include `batch_id` - it's auto-generated)
4. **Readable batch ID** - Virtual column creates it from `created_by` + timestamp

### For Human Developers:
1. Use CLI tool to accumulate changes as you work
2. Review pending impacts with `node impact-cli.mjs list`
3. Submit when ready with `node impact-cli.mjs submit`
