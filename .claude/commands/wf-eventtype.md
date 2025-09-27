---
description: "WhatsFresh eventType inspector - display eventType structure and components"
allowed-tools: ["Bash"]
---

# WhatsFresh EventType Inspector

Display eventType structure showing all components and their details.

## Usage:
- `/wf:eventtype [eventTypeID]` - Show eventType component structure and parameters

## Implementation:

```bash
if [ -z "$1" ]; then
  echo "❌ EventType ID required"
  echo "Usage: /wf:eventtype [eventTypeID]"
  echo "Example: /wf:eventtype 23"
  exit 1
fi

echo "📋 EventType Structure for ID: $1"
echo ""

# Query the eventType components
RESULT=$(curl -s "http://localhost:3001/api/execDML" \
  -H "Content-Type: application/json" \
  -d "{\"method\": \"SELECT\", \"query\": \"SELECT * FROM api_wf.vw_hier_components WHERE eventType_id = $1 ORDER BY posOrder\"}")

# Check if we got results
if echo "$RESULT" | grep -q "error"; then
  echo "❌ Error fetching eventType:"
  echo "$RESULT" | jq '.error // .message // .'
  exit 1
fi

# Check if eventType exists
COMPONENT_COUNT=$(echo "$RESULT" | jq '.vw_hier_components | length')
if [ "$COMPONENT_COUNT" -eq 0 ]; then
  echo "❌ No components found for eventType $1"
  echo "💡 Use /wf:hierarchy [componentID] to view component trees"
  exit 1
fi

echo "EventType: $1"

# Display each component
echo "$RESULT" | jq -r '
  .vw_hier_components[] |
  "├── Component: " + .comp_name + " (ID: " + (.id | tostring) + ")" +
  "\n│   ├── Template: " + .template +
  (if .props != "{}" and .props != "" and .props != null then
    "\n│   ├── Props: " + (.props | if length > 100 then .[:100] + "..." else . end)
  else "" end) +
  (if .parent_id != null then
    "\n│   └── Parent: " + (.parent_id | tostring)
  else
    "\n│   └── Root Component"
  end) +
  "\n"
'

# Extract and show parameters from props
echo ""
echo "🔍 Parameters Found:"
echo "$RESULT" | jq -r '
  .vw_hier_components[] |
  select(.props != null and .props != "" and .props != "{}") |
  .props
' | grep -oE ':[a-zA-Z_][a-zA-Z0-9_]*' | sort -u | sed 's/^:/  • /' || echo "  No parameters found"

echo ""
echo "🎯 Use /wf:hierarchy [componentID] to see complete component tree"
echo "⚡ Use /wf:execute $1 to run this eventType"
```

Shows eventType structure, components, templates, props, and extracted parameters.