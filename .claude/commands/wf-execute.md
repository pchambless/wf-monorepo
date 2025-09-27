---
description: "WhatsFresh eventType executor - execute eventTypes with auto-context resolution"
allowed-tools: ["Bash"]
---

# WhatsFresh EventType Executor

Execute eventTypes using auto-context resolution from context_store.

## Usage:
- `/wf:execute [eventTypeID]` - Execute eventType with auto-context
- `/wf:execute [eventTypeID] [param=value]` - Execute with additional parameters

## Implementation:

```bash
if [ -z "$1" ]; then
  echo "❌ EventType ID required"
  echo "Usage: /wf:execute [eventTypeID] [param=value]"
  echo "💡 Use /wf:eventtype [id] to inspect before executing"
  exit 1
fi

echo "⚡ Executing eventType $1 with auto-context resolution..."

if [ -n "$2" ]; then
  # Parse additional parameters (simple key=value format)
  EXTRA_PARAMS=$(echo "$2" | sed 's/=/": "/g' | sed 's/^/"/' | sed 's/$/"/')
  curl -s "http://localhost:3001/api/execEventType" \
    -H "Content-Type: application/json" \
    -d "{\"eventTypeID\": $1, $EXTRA_PARAMS}" | jq '.'
else
  curl -s "http://localhost:3001/api/execEventType" \
    -H "Content-Type: application/json" \
    -d "{\"eventTypeID\": $1}" | jq '.'
fi
```

Executes eventTypes with automatic :paramName resolution from context_store.