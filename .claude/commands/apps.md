---
description: "WhatsFresh app ecosystem management - view apps, ports, and roles"
allowed-tools: ["Bash"]
---

# Apps Management

Manage the WhatsFresh app ecosystem using the database-driven architecture.

## Usage:
- `/apps` - List all configured apps with ports and roles
- `/apps [role]` - Show apps available for specific role
- `/apps status` - Show running status of all apps

## Implementation:

```bash
if [ -z "$1" ]; then
  echo "🚀 WhatsFresh App Ecosystem:"
  curl -s "http://localhost:3001/api/execEventType" \
    -H "Content-Type: application/json" \
    -d '{"eventTypeID": 39}' | jq '.data[] | {app: .app, port: .port, allowed_roles: .allowed_roles}'
elif [ "$1" = "status" ]; then
  echo "📊 App Status Check:"
  echo "wf-client (3002):    $(curl -s --max-time 2 http://localhost:3002 >/dev/null && echo '✅ Running' || echo '❌ Down')"
  echo "wf-studio (3003):    $(curl -s --max-time 2 http://localhost:3003 >/dev/null && echo '✅ Running' || echo '❌ Down')"
  echo "wf-login (3005):     $(curl -s --max-time 2 http://localhost:3005 >/dev/null && echo '✅ Running' || echo '❌ Down')"
  echo "wf-admin (3006):     $(curl -s --max-time 2 http://localhost:3006 >/dev/null && echo '✅ Running' || echo '❌ Down')"
  echo "wf-shared-query (3007): $(curl -s --max-time 2 http://localhost:3007 >/dev/null && echo '✅ Running' || echo '❌ Down')"
else
  echo "🔐 Apps for role: $1"
  curl -s "http://localhost:3001/api/execEventType" \
    -H "Content-Type: application/json" \
    -d "{\"eventTypeID\": 40, \"roleID\": \"$1\"}" | jq '.data[]'
fi
```

Uses eventType 39 (AppList) and eventType 40 (AuthAppList) for role-based filtering.