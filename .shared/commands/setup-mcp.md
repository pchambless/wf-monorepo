---
description: "One-time MCP setup for database access (Kiro and Claude Code)"
---

# MCP MySQL Setup Guide

## Security Approach

Database credentials are stored in `~/.wf-db-credentials` (outside the git repo) with restricted permissions.

## One-Time Setup

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

### 2. Create MCP Configs from Templates

```bash
# Kiro config
cp .kiro/settings/mcp.json.example .kiro/settings/mcp.json

# Claude Code config
cp .claude/mcp.json.example .claude/mcp.json
```

### 3. Restart Agents

- **Kiro**: MCP server will auto-reconnect
- **Claude Code**: Restart Claude Code application

## Verify Connection

Both agents should now have access to these MCP tools:

- `mcp_mysql_get_database_info()` - List databases and tables
- `mcp_mysql_sql_query({ sql: "..." })` - Execute SQL queries
- `mcp_mysql_check_permissions()` - Check database permissions
- `mcp_mysql_get_operation_logs()` - View operation history

## Test Query

```sql
SELECT id, name, status FROM api_wf.plans WHERE active = 1 ORDER BY id DESC LIMIT 5;
```

## Server Integration

The server can also use these credentials:

```bash
# Start server with secure credentials
cd apps/server
npm run start:secure

# Or for development with nodemon
npm run dev:secure
```

The `start-server.sh` script:
1. Sources `~/.wf-db-credentials`
2. Exports as `DB_*` environment variables
3. Starts the server with credentials loaded

## Security Notes

- ✅ Credentials stored in `~/.wf-db-credentials` (not in git)
- ✅ File permissions set to `600` (owner read/write only)
- ✅ MCP configs ignored in `.gitignore`
- ✅ Template files (`.example`) committed to git for reference

## Troubleshooting

**Connection fails:**
- Check `~/.wf-db-credentials` exists and has correct values
- Verify file permissions: `ls -la ~/.wf-db-credentials` (should show `-rw-------`)
- Manually reconnect MCP server in Kiro or restart Claude Code

**Environment variables not loading:**
- Test manually: `source ~/.wf-db-credentials && echo $MYSQL_HOST`
- Should output: `159.223.104.19`
