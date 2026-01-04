# n8n-nodes-whatsfresh

**All WhatsFresh custom nodes in one package!**

## Current Nodes

- **WF Database Query** - Execute SQL via adhoc-query workflow (single node, no feeder!)

## Adding New Nodes

Simply add a new folder under `nodes/`:

```
nodes/
├── WfDbQuery/
│   └── WfDbQuery.node.ts
├── WfGenGridFields/        ← New node
│   └── WfGenGridFields.node.ts
└── WfLogImpact/            ← New node
    └── WfLogImpact.node.ts
```

Then update `package.json` to include the new node:

```json
"n8n": {
  "nodes": [
    "dist/nodes/WfDbQuery/WfDbQuery.node.js",
    "dist/nodes/WfGenGridFields/WfGenGridFields.node.js",
    "dist/nodes/WfLogImpact/WfLogImpact.node.js"
  ]
}
```

Rebuild and restart n8n:

```bash
npm run build
# Restart n8n
```

## Installation

```bash
cd /home/paul/Projects/wf-monorepo/.n8n/custom-nodes/n8n-nodes-whatsfresh
npm install
npm run build
```

Install in n8n:

```bash
cd /home/paul/Projects/wf-monorepo/.n8n/nodes
npm install --save ../custom-nodes/n8n-nodes-whatsfresh
```

Restart n8n to see all WhatsFresh nodes!
