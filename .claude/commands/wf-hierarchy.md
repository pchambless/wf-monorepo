---
description: "WhatsFresh component hierarchy viewer - display tree structure for any component"
allowed-tools: ["Bash"]
---

# WhatsFresh Hierarchy Viewer

Display component hierarchy tree starting from any xrefID (app, page, component).

## Usage:
- `/wf:hierarchy [xrefID]` - Show complete hierarchy tree below the specified component

## Implementation:

```bash
if [ -z "$1" ]; then
  echo "❌ Component ID required"
  echo "Usage: /wf:hierarchy [xrefID]"
  echo "Examples:"
  echo "  /wf:hierarchy 23  # Show app structure"
  echo "  /wf:hierarchy 49  # Show page components"
  echo "  /wf:hierarchy 31  # Show component children"
  exit 1
fi

echo "🌳 Component Hierarchy for ID: $1"
echo ""

# Call the stored procedure to get hierarchy
RESULT=$(curl -s "http://localhost:3001/api/execDML" \
  -H "Content-Type: application/json" \
  -d "{\"method\": \"CALL\", \"procedure\": \"api_wf.sp_hier_page($1)\"}")

# Check if we got results
if echo "$RESULT" | grep -q "error"; then
  echo "❌ Error fetching hierarchy:"
  echo "$RESULT" | jq '.error // .message // .'
  exit 1
fi

# Parse and display the hierarchy
echo "$RESULT" | jq -r '
  .["{ CALL api_wf.sp_hier_page('$1') }"][] |
  (
    if .level == -1 then ""
    elif .level == 0 then "├── "
    elif .level == 1 then "│   ├── "
    elif .level == 2 then "│   │   ├── "
    elif .level == 3 then "│   │   │   ├── "
    else ("│   " * .level) + "├── "
    end
  ) +
  .comp_name + " (ID: " + (.id | tostring) + ")" +
  "\n" +
  (
    if .level == -1 then ""
    elif .level == 0 then "│   "
    elif .level == 1 then "│   │   "
    elif .level == 2 then "│   │   │   "
    elif .level == 3 then "│   │   │   │   "
    else ("│   " * (.level + 1))
    end
  ) +
  "Template: " + .template +
  (if .props != "{}" and .props != "" then
    "\n" +
    (
      if .level == -1 then ""
      elif .level == 0 then "│   "
      elif .level == 1 then "│   │   "
      elif .level == 2 then "│   │   │   "
      elif .level == 3 then "│   │   │   │   "
      else ("│   " * (.level + 1))
      end
    ) +
    "Props: " + (.props | if length > 80 then .[:80] + "..." else . end)
  else "" end)
'

echo ""
echo "🎯 Use any component ID above with /wf:hierarchy to drill deeper"
```

Universal tree viewer - works at any hierarchy level from app down to individual components.