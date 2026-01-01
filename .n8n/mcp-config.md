# n8n MCP Server Configuration

MCP (Model Context Protocol) access to n8n workflows allows agents to read and modify workflows programmatically.

## Configuration

**REST API URL:** `http://localhost:5678/api/v1`

**API Key (Header: X-N8N-API-KEY):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZThiZGY5YS03MWFhLTQ3YmYtYWEyYS1kZjE1MDcyNzJhZDciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY3MTU4OTcxfQ.CWFhyU2K_2r-aapinXqmj4H-43GrH557KOGR3Ku2dnY
```

**Expiration:** Never (permanent key)

## Agent Configuration

### Claude
Status: Configured (2025-12-30)
Access: Full n8n REST API

### Kiro
Status: In progress

## Usage

With API access, agents can:
- List all workflows: `GET /api/v1/workflows`
- Get workflow details: `GET /api/v1/workflows/:id`
- Update workflows: `PUT /api/v1/workflows/:id`
- Activate/deactivate: `POST /api/v1/workflows/:id/activate`
- Execute workflows: `POST /api/v1/workflows/:id/execute`

## Examples

### List All Workflows
```bash
curl -H "X-N8N-API-KEY: <key>" http://localhost:5678/api/v1/workflows | jq '.data[] | {id, name, active}'
```

### Get Workflow Details
```bash
curl -H "X-N8N-API-KEY: <key>" http://localhost:5678/api/v1/workflows/<id> | jq '.nodes[] | {name, type}'
```

### View Specific Workflow
```bash
curl -H "X-N8N-API-KEY: <key>" http://localhost:5678/api/v1/workflows | jq '.data[] | select(.name == "Export Database DDL")'
```

## Security Note

This key provides full access to n8n workflows and data. Never commit to git or share publicly.

---

**Created:** 2025-12-20
**Last Updated:** 2025-12-30
