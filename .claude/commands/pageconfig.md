---
description: "Generate pageConfig.json for WhatsFresh apps using database-driven architecture"
allowed-tools: ["Bash"]
---

# PageConfig Generation

Generate complete pageConfig.json and pageMermaid.mmd files for any app/page combination.

## Usage:
- `/pageconfig [app] [page]` - Generate pageConfig for specific app/page
- `/pageconfig` - Generate for current context (uses context_store app/page values)

## Implementation:

```bash
if [ -n "$1" ] && [ -n "$2" ]; then
  echo "🏗️ Generating pageConfig for app: $1, page: $2"
  curl -s "http://localhost:3001/api/studio/genPageConfig?app=$1&page=$2"
else
  echo "🏗️ Generating pageConfig using current context..."
  curl -s "http://localhost:3001/api/studio/genPageConfig"
fi

echo "\n📁 Files created in: /apps/wf-studio/src/apps/[app]/[page]/"
echo "   - pageConfig.json"
echo "   - pageMermaid.mmd"
```

Leverages the sp_hier_page stored procedure and auto-context resolution system.