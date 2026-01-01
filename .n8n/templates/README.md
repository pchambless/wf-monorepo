# n8n Workflow Templates

## Auto-Export Workflow Template

**File:** `workflow-with-auto-export.json`

### Features
- ✅ Webhook trigger with configurable path
- ✅ Auto-export node that runs after every execution
- ✅ Exports to human-readable filename based on webhook path
- ✅ Ready to customize with your business logic

### How to Use

1. **Import the template** into n8n
2. **Customize the webhook path:**
   - Change `path: "your-webhook-path"` to your workflow name (e.g., `"create-user"`)
   - Change `webhookId: "your-webhook-path"` to match
3. **Add your business logic** in the "Main Logic" node
4. **Activate the workflow**

### What Happens

When the workflow executes:
1. Webhook receives request
2. Main logic processes data
3. **Auto-export node** saves workflow to filesystem
4. Response sent back to webhook caller

### Exported Filename

The workflow will be saved as: `{webhook-path}.json`

**Examples:**
- `path: "create-user"` → exports to `create-user.json`
- `path: "log-impact"` → exports to `log-impact.json`
- `path: "session-startup"` → exports to `session-startup.json`

### Current Live Examples

See these workflows for working implementations:
- `adhoc-query.json` - uses `path: "adhoc-query"`
- `create-communication.json` - uses `path: "create-communication"`
- `log-impact.json` - uses `path: "log-impact"`

### Manual Export

To export a workflow manually by ID:
```bash
docker exec n8n-whatsfresh node /home/node/export-single.js <workflow-id>
```

### Notes

- The auto-export node uses `{{ $workflow.id }}` to automatically get the workflow ID
- No need to modify the export node - it works for any workflow
- Export happens AFTER main logic but BEFORE webhook response
- Uses webhook `path` field for human-readable filenames
