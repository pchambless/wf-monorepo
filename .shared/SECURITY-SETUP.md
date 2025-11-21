# Security Setup - Database Credentials

## Overview

Database credentials are stored in a single secure location outside the git repository: `~/.wf-db-credentials`

This file is used by:
- **Kiro** (MCP MySQL connection)
- **Claude Code** (MCP MySQL connection)
- **Server** (Node.js application)

## Initial Setup

### 1. Create Credentials File

```bash
cat > ~/.wf-db-credentials << 'EOF'
export MYSQL_HOST=159.223.104.19
export MYSQL_PORT=3306
export MYSQL_USER=wf_admin
export MYSQL_PASSWORD=Nothing123
export MYSQL_DATABASE=whatsfresh
EOF

chmod 600 ~/.wf-db-credentials
```

### 2. Configure MCP for AI Agents

```bash
# Copy MCP config templates
cp .kiro/settings/mcp.json.example .kiro/settings/mcp.json
cp .claude/mcp.json.example .claude/mcp.json

# Restart agents to load configs
# - Kiro: Auto-reconnects
# - Claude Code: Restart application
```

### 3. Verify Setup

```bash
# Test credentials file
source ~/.wf-db-credentials && echo "Host: $MYSQL_HOST, User: $MYSQL_USER"

# Should output: Host: 159.223.104.19, User: wf_admin
```

## Usage

### Starting the Server

**With secure credentials (recommended):**
```bash
npm run server:secure
```

**Or from server directory:**
```bash
cd apps/server
npm run dev:secure
```

**Without secure credentials (uses .env fallback):**
```bash
npm run server
```

### AI Agent Database Access

Both Kiro and Claude Code can query the database directly using MCP tools:

```javascript
// Get database info
mcp_mysql_get_database_info()

// Run queries
mcp_mysql_sql_query({ 
  sql: "SELECT * FROM api_wf.plans WHERE active = 1" 
})

// Check permissions
mcp_mysql_check_permissions()
```

## File Structure

```
~/.wf-db-credentials          # Secure credentials (chmod 600, not in git)
.kiro/settings/mcp.json       # Kiro MCP config (gitignored)
.kiro/settings/mcp.json.example  # Template (in git)
.claude/mcp.json              # Claude Code MCP config (gitignored)
.claude/mcp.json.example      # Template (in git)
apps/server/.env              # Fallback credentials only
apps/server/start-server.sh   # Startup script that loads credentials
```

## Security Features

✅ **Single source of truth**: All credentials in one file
✅ **Outside git repo**: `~/.wf-db-credentials` never committed
✅ **Restricted permissions**: `chmod 600` (owner read/write only)
✅ **Gitignored configs**: MCP configs with credentials not committed
✅ **Template files**: `.example` files for reference without credentials
✅ **Fallback safety**: `.env` has safe defaults if credentials file missing

## Updating Credentials

To change database credentials:

1. Edit `~/.wf-db-credentials`
2. Restart server: `npm run server:secure`
3. Reconnect MCP servers (Kiro auto-reconnects, Claude Code needs restart)

## Troubleshooting

**MCP connection fails:**
```bash
# Verify credentials file exists
ls -la ~/.wf-db-credentials

# Should show: -rw------- (600 permissions)

# Test loading
source ~/.wf-db-credentials && echo $MYSQL_HOST
```

**Server can't connect:**
```bash
# Check if start-server.sh is executable
ls -la apps/server/start-server.sh

# Should show: -rwxr-xr-x

# Make executable if needed
chmod +x apps/server/start-server.sh
```

**Credentials not loading:**
```bash
# Verify file format (no spaces around =)
cat ~/.wf-db-credentials

# Should be: export MYSQL_HOST=159.223.104.19
# NOT: export MYSQL_HOST = 159.223.104.19
```

## Migration from Old Setup

If you previously had credentials in `.env` or MCP configs:

1. Create `~/.wf-db-credentials` with correct values
2. Update `.env` to use fallback values only
3. Recreate MCP configs from templates
4. Remove old credentials from git history if needed:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .kiro/settings/mcp.json" \
     --prune-empty --tag-name-filter cat -- --all
   ```

## Best Practices

- ✅ Never commit `~/.wf-db-credentials`
- ✅ Never commit MCP configs with real credentials
- ✅ Use `npm run server:secure` for development
- ✅ Keep `.example` files updated when changing config structure
- ✅ Document any new services that need credentials
- ❌ Don't put credentials in `.env` (use as fallback only)
- ❌ Don't share `~/.wf-db-credentials` file directly
