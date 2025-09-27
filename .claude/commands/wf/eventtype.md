---
description: "Execute WhatsFresh eventTypes with auto-context resolution"
allowed-tools: ["Bash"]
---

# EventType Execution

Execute any eventType using the auto-context resolution system.

## Usage:
- `/wf/eventtype [id]` - Execute eventType with auto-context
- `/wf/eventtype [id] [param=value]` - Execute with additional parameters

## Implementation:

```bash
if [ -z "$1" ]; then
  echo "❌ EventType ID required"
  echo "Usage: /wf/eventtype [id] [param=value]"
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

Uses the enhanced execEventType controller with automatic :paramName resolution from context_store.