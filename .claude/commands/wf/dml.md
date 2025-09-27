---
description: "Execute DML operations with auto-context and optional impact tracking"
allowed-tools: ["Bash"]
---

# DML Operations

Execute database operations using the unified DML system.

## Usage:
- `/wf/dml [method] [table]` - Execute DML with prompts for data
- `/wf/dml SELECT context_store` - Quick context_store query
- `/wf/dml SELECT "SELECT * FROM api_wf.apps"` - Custom SQL

## Implementation:

```bash
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "❌ Method and table required"
  echo "Usage: /wf/dml [method] [table]"
  echo "Examples:"
  echo "  /wf/dml SELECT context_store"
  echo "  /wf/dml INSERT api_wf.context_store"
  echo "  /wf/dml SELECT \"SELECT * FROM api_wf.apps\""
  exit 1
fi

METHOD="$1"
TABLE="$2"

if [ "$METHOD" = "SELECT" ] && [ "$TABLE" = "context_store" ]; then
  echo "🔍 Current Context Store:"
  curl -s "http://localhost:3001/api/getVal?paramName=*&format=sql" | jq '.'
elif [[ "$TABLE" =~ ^SELECT.* ]]; then
  echo "🔍 Custom SQL Query:"
  curl -s "http://localhost:3001/api/execDML" \
    -H "Content-Type: application/json" \
    -d "{\"method\": \"CUSTOM\", \"sql\": \"$TABLE\"}" | jq '.'
else
  echo "💾 DML Operation: $METHOD on $TABLE"
  echo "Enter data (JSON format):"
  read -r DATA
  curl -s "http://localhost:3001/api/execDML" \
    -H "Content-Type: application/json" \
    -d "{\"method\": \"$METHOD\", \"table\": \"$TABLE\", \"data\": $DATA}" | jq '.'
fi
```

Integrates with the dmlProcessor and context_store system.