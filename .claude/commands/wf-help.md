---
description: "List all WhatsFresh custom slash commands and their usage"
allowed-tools: []
---

# WhatsFresh Command Help

Complete reference for all WhatsFresh custom slash commands.

## 🔧 Core Commands

### `/context`
**Context management - view and set context_store values**
- `/context` - Show all current context_store values
- `/context [key]` - Show specific context value
- `/context [key] [value]` - Set context variable

### `/pageconfig`
**Generate pageConfig.json for WhatsFresh apps**
- `/pageconfig [app] [page]` - Generate pageConfig for specific app/page
- `/pageconfig` - Generate using current context values

### `/apps`
**WhatsFresh app ecosystem management**
- `/apps` - List all configured apps with ports and roles
- `/apps [role]` - Show apps available for specific role
- `/apps status` - Show running status of all apps

## 🚀 WhatsFresh Namespace (`/wf/`)

### `/wf/eventtype`
**Execute eventTypes with auto-context resolution**
- `/wf/eventtype [id]` - Execute eventType with auto-context
- `/wf/eventtype [id] [param=value]` - Execute with additional parameters

### `/wf/dml`
**Database operations with auto-context**
- `/wf/dml [method] [table]` - Execute DML with prompts for data
- `/wf/dml SELECT context_store` - Quick context_store query
- `/wf/dml SELECT "SELECT * FROM api_wf.apps"` - Custom SQL

## 💡 Key Features

- **Auto-context resolution** - Uses context_store, no manual parameters
- **Database-driven** - Direct integration with WhatsFresh API
- **Role-based access** - Commands respect user roles from context
- **Unified system** - Leverages getVal/setVals/clearVals controllers

## 🔗 Quick Examples

```bash
/context userEmail paul@example.com    # Set user context
/apps status                           # Check app health
/pageconfig wf-login loginPage         # Generate page config
/wf/eventtype 39                       # Execute AppList
/wf-help                              # Show this help (meta!)
```

Built for the database-driven, auto-context architecture! 🎯