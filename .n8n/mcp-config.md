# n8n MCP Server Configuration

MCP (Model Context Protocol) access to n8n workflows allows agents to read and modify workflows programmatically.

## Configuration

**Server URL:** `http://0.0.0.0:5678/mcp-server/http`

**Access Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZThiZGY5YS03MWFhLTQ3YmYtYWEyYS1kZjE1MDcyNzJhZDciLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImY5MjkzYmIzLTI1MzctNDI0NS1hYjViLWU0MTAzZmYwNDg5MSIsImlhdCI6MTc2NjMyNDI5OX0.Molr3zLb4sgfZgzfFrJ4oRRtGWbWopkL6X2Qmmw5xvI
```

## Agent Configuration

### Kiro
Status: In progress

### Claude
Status: Pending setup

## Usage

With MCP access, agents can:
- Read workflow definitions
- Update workflow nodes
- Modify workflow connections
- Deploy workflow changes

This enables programmatic workflow updates without manual UI editing.

## Example: Update Session-Startup Workflow

Instead of manually editing in n8n UI, agents can now:

```javascript
// Pseudo-code - actual MCP API calls
const workflow = mcp.getWorkflow('Agent Session Startup');
workflow.updateNode('Active Plans', {
  query: 'SELECT * FROM vw_sprint_outline WHERE status = "current"'
});
workflow.save();
```

## Security Note

This token provides full access to n8n workflows. Store securely and rotate periodically.

---

**Created:** 2025-12-20
**Last Updated:** 2025-12-20
