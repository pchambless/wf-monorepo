# Plan 0018 Phase 3: Document Management Integration - Design

## Architecture Overview

### Implementation Strategy

We'll implement document tracking through a universal manual script that can be run by any agent (Claude, Kiro, user) to register documents in the database. This MVP approach focuses on getting the core database integration working before adding automation layers in future plans.

## Component Design

### 1. Universal Document Update Script

**Location**: `claude-plans/tools/document-update.js`

**Usage**: Manual execution by any agent (Claude, Kiro, user)

**Responsibilities**:

- Scan `.kiro/specs/` and `.kiro/issues/` directories for markdown files
- Check against existing plan_documents table to find unregistered files
- Extract metadata from file content and path
- Register new documents in plan_documents table via DML API
- Provide clear console output of registration results

### 2. Metadata Extraction Module

**Location**: `packages/shared-imports/src/utils/documentMetadata.js`

**Functions**:

- `extractPlanId(filePath)` - Extract plan ID from folder structure
- `extractTitle(fileContent)` - Get title from first markdown heading
- `determineDocumentType(filePath)` - Classify as 'spec' or 'issue'
- `parseDocumentMetadata(filePath, content)` - Combine all extraction logic

### 3. Document Registration Service

**Location**: `packages/shared-imports/src/services/documentService.js`

**Functions**:

- `registerDocument(metadata)` - Register new document via DML
- `updateDocumentStatus(id, status)` - Update document status
- `linkDocumentToPlan(documentId, planId)` - Associate with plan

## Data Flow

```
1. Agent runs script: node claude-plans/tools/document-update.js
   ↓
2. Script scans directories (.kiro/specs/, .kiro/issues/)
   ↓
3. Find unregistered files (check against plan_documents table)
   ↓
4. Extract metadata for each new file:
   - Plan ID: 19 (from folder name)
   - Type: 'spec' (from directory)
   - Title: "Feature Design" (from markdown heading)
   - Path: ".kiro/specs/0019-feature/design.md"
   ↓
5. Register via DML API (batch or individual)
   - POST /api/execDML
   - INSERT into plan_documents
   ↓
6. Output results to console
```

## Implementation Details

### Plan ID Extraction Patterns

```javascript
const PLAN_ID_PATTERNS = [
  /^(\d{4})-/, // 0019-feature-name
  /^plan-(\d+)/i, // plan-19-feature
  /^(\d+)-/, // 19-feature
];

function extractPlanId(filePath) {
  const folderName = path.basename(path.dirname(filePath));

  for (const pattern of PLAN_ID_PATTERNS) {
    const match = folderName.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return null; // No plan association
}
```

### Title Extraction

```javascript
function extractTitle(content) {
  // Try to find first markdown heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  // Fallback to filename without extension
  return null;
}
```

### Document Type Classification

```javascript
function determineDocumentType(filePath) {
  if (filePath.includes(".kiro/specs/")) {
    return "spec";
  } else if (filePath.includes(".kiro/issues/")) {
    return "issue";
  }
  return "unknown";
}
```

## Database Integration

### DML Payload Structure

```javascript
const documentPayload = {
  operation: "INSERT",
  table: "plan_documents",
  data: {
    plan_id: extractedPlanId || null,
    document_type: documentType,
    file_path: relativePath,
    title: extractedTitle || filename,
    author: "kiro",
    status: "draft",
    created_by: "kiro",
  },
};
```

### Error Handling Strategy

1. **Plan ID Not Found**: Insert with `plan_id = null`, allow manual association later
2. **Title Extraction Fails**: Use filename without extension
3. **DML API Failure**: Log error, continue with file creation (don't block user)
4. **Duplicate Detection**: Check existing records before insert

## Script Usage Examples

### Basic Usage

```bash
# Register all unregistered documents
node claude-plans/tools/document-update.js

# Dry run to see what would be registered (no database changes)
node claude-plans/tools/document-update.js --dry-run

# Register specific file
node claude-plans/tools/document-update.js --file .kiro/specs/0019-feature/design.md

# Verbose output for debugging
node claude-plans/tools/document-update.js --verbose
```

### Expected Output

```
Document Update Results:
========================
✓ Registered: .kiro/specs/0019-feature/design.md (Plan 19, Title: "Feature Design")
✓ Registered: .kiro/issues/bug-fix.md (No Plan, Title: "Critical Bug Fix")
⚠ Skipped: .kiro/specs/0018-document-management/design.md (Already registered)
✗ Failed: .kiro/specs/malformed.md (No title found, DML error)

Summary: 2 registered, 1 skipped, 1 failed
```

## Testing Strategy

### Unit Tests

- Metadata extraction functions
- Plan ID pattern matching
- Title extraction from various markdown formats

### Integration Tests

- End-to-end file creation → database registration
- Error handling scenarios
- DML API integration

### Manual Testing Scenarios

1. Create spec in numbered folder (`0020-new-feature/design.md`)
2. Create issue without plan association (`general-bug.md`)
3. Create nested spec (`0021-complex/sub/detail.md`)
4. Test with malformed markdown
5. Test with missing headings

## Future Enhancements

### Phase 4 Preparation

- Document status workflow triggers
- Automatic plan association improvements
- Content change detection for updates
- Integration with plan lifecycle events

### Monitoring & Analytics

- Document creation metrics
- Plan association success rates
- Most active document types
- Author activity tracking
