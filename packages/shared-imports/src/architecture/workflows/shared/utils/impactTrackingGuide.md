# Impact Tracking API Reference

## Quick Reference for Kiro

### ✅ Correct Format

```javascript
import { createPlanImpact } from "./createPlanImpact.browser.js";

await createPlanImpact({
  planId: 29, // Number - the plan being worked on
  filePath: "path/to/file.js", // String - relative path from project root
  changeType: "CREATE", // String - CREATE, MODIFY, DELETE, MOVE
  description: "What you did", // String - human readable description
  agent: "kiro", // String - who made the change (kiro, claude, paul)
});
```

### 🔧 Key Points to Remember

1. **No `created_by` field** - Use `userID: agent` instead (DML processor handles audit fields)
2. **No `metadata` field** - Table doesn't have this column
3. **Use browser-safe version** - Import from `createPlanImpact.browser.js`
4. **Always include `userID`** - Required for audit trail

### 📋 Change Types

- **CREATE** - New files created
- **MODIFY** - Existing files updated
- **DELETE** - Files removed
- **MOVE** - Files relocated

### 🎯 Common Patterns

#### Creating a new workflow file:

```javascript
await createPlanImpact({
  planId: currentPlanId,
  filePath: "packages/shared-imports/src/workflows/newWorkflow.js",
  changeType: "CREATE",
  description: "Created newWorkflow with X, Y, Z features",
  agent: "kiro",
});
```

#### Updating an index file:

```javascript
await createPlanImpact({
  planId: currentPlanId,
  filePath: "packages/shared-imports/src/index.js",
  changeType: "MODIFY",
  description: "Added newWorkflow export to main index",
  agent: "kiro",
});
```

#### Batch tracking multiple changes:

```javascript
import { createPlanImpactBatch } from "./createPlanImpact.browser.js";

const impacts = [
  {
    planId: 29,
    filePath: "file1.js",
    changeType: "CREATE",
    description: "Created file1",
    agent: "kiro",
  },
  {
    planId: 29,
    filePath: "file2.js",
    changeType: "MODIFY",
    description: "Updated file2",
    agent: "kiro",
  },
];

await createPlanImpactBatch(impacts);
```

### ❌ Common Mistakes to Avoid

```javascript
// ❌ DON'T include created_by manually
data: {
  created_by: agent,  // This causes duplicate field error
  userID: agent
}

// ❌ DON'T include metadata field
data: {
  metadata: JSON.stringify({}),  // Column doesn't exist
}

// ❌ DON'T use server-side version in browser context
import { createPlanImpact } from './createPlanImpact.js';  // Wrong - server only

// ✅ DO use browser-safe version
import { createPlanImpact } from './createPlanImpact.browser.js';  // Correct
```

### 🧪 Testing Impact Tracking

```javascript
// Quick test to verify impact tracking works
const testImpact = await createPlanImpact({
  planId: 29,
  filePath: "test/impact-tracking.js",
  changeType: "CREATE",
  description: "Testing impact tracking system",
  agent: "kiro",
});

console.log(
  "Impact tracking:",
  testImpact.success ? "✅ Working" : "❌ Failed"
);
```

### 📊 Success Response Format

```javascript
{
  success: true,
  impactId: 71,
  planId: 29,
  filePath: 'path/to/file.js',
  changeType: 'CREATE',
  description: 'What you did',
  agent: 'kiro',
  message: 'Plan impact recorded: CREATE path/to/file.js'
}
```

### 🚨 Error Response Format

```javascript
{
  success: false,
  error: 'Error message',
  message: 'Failed to record plan impact: Error message',
  planId: 29,
  filePath: 'path/to/file.js',
  changeType: 'CREATE'
}
```
