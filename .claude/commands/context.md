---
description: "WhatsFresh context management - view and set context_store values"
allowed-tools: ["Bash"]
---

# Context Management

Display current context or set context variables using the unified context system.

## Usage:
- `/context` - Show all current context_store values
- `/context [key]` - Show specific context value
- `/context [key] [value]` - Set context variable

## Implementation:

```bash
if [ -z "$1" ]; then
  echo "🔍 Current Context Store:"
  curl -s "http://localhost:3001/api/getVal?paramName=*&format=raw" | jq '.'
elif [ -z "$2" ]; then
  echo "🔍 Context value for '$1':"
  curl -s "http://localhost:3001/api/getVal?paramName=$1&format=raw"
else
  echo "✅ Setting context: $1 = $2"
  curl -X POST "http://localhost:3001/api/setVals" \
    -H "Content-Type: application/json" \
    -d "{\"$1\": \"$2\"}"
  echo "\n🔍 Updated value:"
  curl -s "http://localhost:3001/api/getVal?paramName=$1&format=raw"
fi
```

Uses auto-context resolution - no manual parameters needed!