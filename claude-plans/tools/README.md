# Claude Plans Tools

Tools for managing development plans in the WhatsFresh monorepo.

## create-plan.js

Creates new development plans with sequential IDs and consistent structure.

### Usage

```bash
cd claude-plans/tools
node create-plan.js CLUSTER "Plan Name"
```

### Examples

```bash
# Create a new mapping feature plan
node create-plan.js MAPPING "Enhanced Batch Sorting"

# Create a shared component plan  
node create-plan.js SHARED "Universal Search Widget"

# Create an API enhancement plan
node create-plan.js API "Bulk Operations Endpoint"
```

### Valid Clusters

**High Blast Radius (Tread Carefully!):**
- `EVENTS` - Cross-app functionality
- `API` - Server endpoints  
- `SHARED` - Shared-imports components

**Medium Blast Radius:**
- `DEVTOOLS` - Generation tools
- `AUTH` - Authentication
- `NAVIGATION` - Routing/sidebar

**Low Blast Radius (Safer Changes):**
- `MAPPING` - Batch mapping functionality
- `CRUD` - Standard list/form operations
- `RECIPES` - Recipe-specific workflow

### What It Does

1. **Generates Sequential ID**: Reads impact-tracking.json to find next available ID (0001, 0002, etc.)
2. **Creates Plan File**: Uses cluster-first naming convention in `a-pending/`
3. **Updates JSON**: Adds initial entry to impact-tracking.json
4. **Applies Template**: Consistent plan structure with all required sections

### Output

```
✅ Plan created successfully!
📁 File: 0012-MAPPING-Enhanced-Batch-Sorting.md
🔢 Plan ID: 0012
🎯 Cluster: MAPPING (low blast radius)
📊 JSON updated: impact-tracking.json
```

### File Structure Created

```
a-pending/
└── 0012-MAPPING-Enhanced-Batch-Sorting.md

impact-tracking.json (updated with new entry)
```

### Next Steps After Creation

1. Edit the plan file to add specific details
2. Add detailed impacts to impact-tracking.json
3. Update predicted file counts and complexity
4. Review dependencies and relationships

## complete-plan.js

Updates plan status and renames files with status prefixes for visual organization.

### Usage

```bash
cd claude-plans/tools
node complete-plan.js PLAN_ID [STATUS]
```

### Examples

```bash
# Mark plan as completed (default)
node complete-plan.js 0003

# Mark with specific status
node complete-plan.js 0005 archived
node complete-plan.js 0007 on-hold

# Reactivate a plan (removes prefix)
node complete-plan.js 0003 active
```

### Valid Statuses

- `completed` → `DONE-0003-DEVTOOLS-Plan-Name.md`
- `archived` → `ARCHIVED-0005-API-Plan-Name.md`  
- `on-hold` → `HOLD-0007-SHARED-Plan-Name.md`
- `active` → `0001-CLUSTER-Plan-Name.md` (removes prefix)

### What It Does

1. **Renames File**: Adds status prefix for visual sorting
2. **Updates Registry**: Changes status and adds completion date
3. **Updates Impacts**: Marks all plan impacts as completed
4. **File Sorting**: Status prefixes sort below numeric files

### Global Access Setup

```bash
# Add alias to ~/.bashrc for global access
alias new-plan="cd /home/paul/wf-monorepo-new/claude-plans && node tools/create-plan.js"
alias complete-plan="cd /home/paul/wf-monorepo-new/claude-plans && node tools/complete-plan.js"

# Then from anywhere:
new-plan DEVTOOLS "New Feature"
complete-plan 0003
```

## Workflow Summary

1. **Create Plan**: `new-plan CLUSTER "Plan Name"`
2. **Work on Plan**: Edit plan file, add impacts to JSON
3. **Complete Plan**: `complete-plan PLAN_ID` when done
4. **Query Plans**: Use jq commands for status and impact analysis

## Future Enhancements

- Template selection for different plan types
- Impact estimation wizard
- Plan validation and conflict detection
- Integration with Admin UI for web-based plan creation
- Auto-sync between file status and registry status