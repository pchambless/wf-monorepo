# Session Startup MCP Server - Universal Agent Initialization

## What This Solves

**Problem:** Every agent (Claude, Kiro, Copilot) must manually run `/startSession` to load protocol and context.

**Solution:** MCP resource that **auto-loads** on agent connection, delivering:
- Living protocol (communication types, rules)
- Active epic/sprint status
- Recent activity and file changes
- System health metrics

## Installation

```bash
cd /home/paul/Projects/wf-monorepo/.n8n
npm install --no-save @modelcontextprotocol/sdk node-fetch
chmod +x mcp-session-server.js
```

## Configuration

Add to `.claude/mcp.json` (and similar for Kiro, Copilot):

```json
{
  "mcpServers": {
    "session-startup": {
      "command": "node",
      "args": [
        "/home/paul/Projects/wf-monorepo/.n8n/mcp-session-server.js"
      ],
      "disabled": false,
      "autoApprove": []
    },
    "mysql": { ... },
    "n8n-workflows": { ... }
  }
}
```

## How It Works

1. **MCP Client Connects** (Claude, Kiro, etc.)
2. **Server Advertises Resource**: `session://startup`
3. **Client Auto-Fetches** (if configured for auto-load)
4. **Server Calls**: `http://localhost:5678/webhook/session-startup`
5. **Returns**: Protocol (id=294,295), plans, activity, impacts

## Testing

```bash
# Test the server directly
node /home/paul/Projects/wf-monorepo/.n8n/mcp-session-server.js
```

In Claude/agent, check resources:
```
List available MCP resources
```

Should show: `session://startup`

## Agent-Specific Setup

### Claude Code
- Add to `.claude/mcp.json` as shown above
- Resource will auto-appear in context

### Kiro
- Add to `.kiro/settings/mcp.json`
- Configure auto-fetch if supported

### VS Code Copilot / GitHub Copilot
- Add to respective MCP configurations
- May need client-specific resource loading

## Benefits

✅ **Universal** - Works for all MCP-compatible agents
✅ **Automatic** - No manual `/startSession` needed
✅ **Consistent** - Same protocol for everyone
✅ **Fresh** - Pulls live data from n8n on each connection

## Fallback

If MCP resource fails, agents can still run `/startSession` manually.

---

**Created:** 2025-12-29
**Status:** Ready for testing
