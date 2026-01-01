# n8n Workflow Management

## 🎯 Problem Solved

**Before:** Export created 31 files with 9 duplicate "Module Dependency Analysis" workflows
**After:** Clean export of exactly 10 active workflows with human-readable filenames

## 📁 Directory Structure

```
.n8n/
├── workflows/           # Exported workflow files (human-readable names)
├── scripts/            # Database-driven export scripts
├── templates/          # Workflow templates with auto-export
└── docs/              # Documentation
```

## 🚀 Quick Start

### Export All Active Workflows
```bash
docker exec n8n-whatsfresh node /home/node/export-webhook-names.js
```
Result: `adhoc-query.json`, `create-communication.json`, etc.

### Export Only Changed Workflows (Incremental)
```bash
docker exec n8n-whatsfresh node /home/node/export-changed.js
```

### Export Single Workflow
```bash
docker exec n8n-whatsfresh node /home/node/export-single.js <workflow-id>
```

## 📝 Creating New Workflows

Use the template: `.n8n/templates/workflow-with-auto-export.json`

**Setup:**
1. Import template into n8n
2. Change webhook `path` to your workflow name (e.g., `"create-user"`)
3. Change `webhookId` to match
4. Add your business logic
5. Activate workflow

**Auto-Export:** Workflow exports itself after every execution!

## 🔧 Available Scripts

| Script | Purpose | Output |
|--------|---------|--------|
| `export-webhook-names.js` | Export all active with readable names | `create-communication.json` |
| `export-changed.js` | Incremental export (only changed) | Fast, efficient updates |
| `export-single.js` | Export specific workflow by ID | One file |
| `query-workflows.js` | Inspect workflow database | Database info |
| `inspect-workflow-table.js` | View table schema | Schema details |

## 📚 Documentation

- **Export Strategies:** `docs/workflow-export-strategies.md`
- **Template Guide:** `templates/README.md`

## 🎨 Filename Convention

Workflows export using their webhook `path` or `webhookId`:

```javascript
{
  "parameters": {
    "path": "create-communication",  // ← becomes filename
    "webhookId": "create-communication"
  }
}
```

Output: `create-communication.json`

## 🗄️ Database Access

**Container:** `/home/node/.n8n/database.sqlite`  
**Host:** `/home/paul/Projects/wf-monorepo/.n8n/database.sqlite`

**Query active workflows:**
```sql
SELECT id, name, active FROM workflow_entity 
WHERE active = 1 AND isArchived = 0
```

## ✨ Key Features

✅ Only exports `active = 1` workflows  
✅ Filters out `isArchived = true` workflows  
✅ Human-readable filenames from webhook paths  
✅ Incremental export (compares timestamps)  
✅ Self-exporting workflows (auto-backup)  
✅ No more duplicate exports!

---

**Updated:** 2025-12-28
