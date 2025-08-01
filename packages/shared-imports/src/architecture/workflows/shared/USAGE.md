# Document Workflows Usage Guide

## Server vs Browser Separation

The document workflow system has been split into server-side and browser-side components to avoid Node.js module conflicts in browser environments.

### Server-Side Usage (Node.js only)

For server-side scripts, API routes, and Node.js applications:

```javascript
// Import server-side document functions
import {
  createDoc,
  createAnalysis,
  createGuidance,
} from "@whatsfresh/shared-imports/utils/server";

// Create analysis document
const result = createAnalysis(19, "my-feature", "Analysis content...");

// Create guidance document
const result = createGuidance(19, "my-component", "Implementation guidance...");
```

### Browser-Side Usage (React components)

For React components and browser environments:

```javascript
// Import browser-safe modal component
import { PostCreationDeliveryModal } from "@whatsfresh/shared-imports/components";

// Use in React component
function MyComponent() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <PostCreationDeliveryModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      documentType="analysis"
      filePath="/path/to/document.md"
      content="Document content..."
      planId="0019"
      topic="my-feature"
    />
  );
}
```

## Complete Workflow Example

### 1. Server-Side Document Creation

```javascript
// In API route or server script
import { createAnalysis } from "@whatsfresh/shared-imports/utils/server";

export async function POST(request) {
  const { planId, topic, content } = await request.json();

  const result = createAnalysis(planId, topic, content);

  if (result.success) {
    // Return document details to client
    return Response.json({
      success: true,
      documentType: "analysis",
      filePath: result.filePath,
      planId: result.planId,
      topic: result.topic,
    });
  }

  return Response.json({ success: false, error: result.message });
}
```

### 2. Client-Side Modal Integration

```javascript
// In React component
import { PostCreationDeliveryModal } from "@whatsfresh/shared-imports/components";

function DocumentCreator() {
  const [modalData, setModalData] = useState(null);

  const createDocument = async () => {
    const response = await fetch("/api/create-analysis", {
      method: "POST",
      body: JSON.stringify({
        planId: 19,
        topic: "feature",
        content: "Analysis...",
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Show delivery modal
      setModalData({
        isOpen: true,
        documentType: result.documentType,
        filePath: result.filePath,
        content: "Analysis...", // Original content
        planId: result.planId,
        topic: result.topic,
      });
    }
  };

  return (
    <>
      <button onClick={createDocument}>Create Analysis</button>

      {modalData && (
        <PostCreationDeliveryModal
          {...modalData}
          onClose={() => setModalData(null)}
        />
      )}
    </>
  );
}
```

## Available Functions

### Server-Side (`@whatsfresh/shared-imports/utils/server`)

- `createDoc(filePath, fileName, content)` - Core file creation utility
- `createAnalysis(planId, topic, content, options)` - Create analysis documents
- `createGuidance(planId, component, content, options)` - Create guidance documents
- `createPlanDocument(planId, planData)` - Create plan documents

### Browser-Side (`@whatsfresh/shared-imports/components`)

- `PostCreationDeliveryModal` - Multi-directional coordination modal
- Format functions are included in the modal component

## Error Handling

### Server-Side Errors

```javascript
const result = createAnalysis(19, "feature", "content");
if (!result.success) {
  console.error("Creation failed:", result.message);
  console.error("Error code:", result.code);
}
```

### Client-Side Errors

```javascript
// Handle API errors
const response = await fetch("/api/create-document");
if (!response.ok) {
  console.error("API request failed");
}

// Handle modal errors (clipboard, etc.)
// Errors are handled internally by the modal component
```

## Security Notes

- Server-side functions include path traversal protection
- File creation is restricted to project directory
- Filename validation prevents malicious names
- Browser-side modal only handles formatting and display

## Performance Considerations

- Server-side functions are synchronous for reliability
- Modal component is lightweight with minimal dependencies
- Clipboard operations include fallback for older browsers
- Content formatting is done client-side to reduce server load
