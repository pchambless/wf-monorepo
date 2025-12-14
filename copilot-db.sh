#!/bin/bash

# copilot-db.sh - Quick database queries for AI agents
# Usage: ./copilot-db.sh "SELECT * FROM api_wf.plans LIMIT 5"

# Check if SQL query provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 \"SQL_QUERY\""
    echo "Example: $0 \"SELECT * FROM context_store LIMIT 5\""
    echo "Example: $0 \"SELECT id, name, status FROM api_wf.plans WHERE active = 1\""
    exit 1
fi

SQL_QUERY="$1"
SERVER_URL="http://localhost:3001"
USER_EMAIL="claude@whatsfresh.ai"

# Check if server is running with a simple test query
TEST_RESULT=$(curl -s -X POST "$SERVER_URL/api/copilot/query" \
-H "Content-Type: application/json" \
-d "{\"sql\": \"SELECT 1 as test\", \"userEmail\": \"$USER_EMAIL\"}" 2>/dev/null)

if [ $? -ne 0 ] || [ -z "$TEST_RESULT" ]; then
    echo "❌ Server not running or not responding on $SERVER_URL"
    echo "Start server with: cd apps/server && npm run dev"
    exit 1
fi

# Execute query
echo "🔍 Executing: $SQL_QUERY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -s -X POST "$SERVER_URL/api/copilot/query" \
-H "Content-Type: application/json" \
-d "{\"sql\": \"$SQL_QUERY\", \"userEmail\": \"$USER_EMAIL\"}" | \
jq -r '
if .success then
  if .data | length > 0 then
    (.data | map(keys) | add | unique) as $headers |
    ([$headers] + (.data | map([.[] | tostring]))) |
    .[] | @csv
  else
    "✅ Query executed successfully - No results returned"
  end
else
  "❌ Error: " + (.error // "Unknown error") + "\n" + (.message // "")
end' | column -t -s ','

# Show row count if successful
RESULT=$(curl -s -X POST "$SERVER_URL/api/copilot/query" -H "Content-Type: application/json" -d "{\"sql\": \"$SQL_QUERY\", \"userEmail\": \"$USER_EMAIL\"}")
ROW_COUNT=$(echo "$RESULT" | jq -r '.rowCount // 0')
if [ "$ROW_COUNT" -gt 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Rows returned: $ROW_COUNT"
fi