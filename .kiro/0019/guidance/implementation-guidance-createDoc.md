# Implementation Guidance: createDoc Utility

## Implementation Overview
**Target**: Core file creation utility for document workflows  
**Priority**: High - Foundation for all document automation  
**Complexity**: Low-Medium  

## Core Function Implementation

### Location
`packages/shared-imports/src/utils/fileOperations.js`

### Function Signature
```javascript
/**
 * Create document with directory auto-creation
 * @param {string} filePath - Directory path (relative or absolute)
 * @param {string} fileName - File name with extension
 * @param {string} content - File content
 * @returns {Object} { success: boolean, fullPath: string, message: string }
 */
function createDoc(filePath, fileName, content) {
  // Implementation details below
}
```

### Implementation Steps

#### 1. Path Resolution and Validation
```javascript
import path from 'path';
import fs from 'fs';

function createDoc(filePath, fileName, content) {
  try {
    // Resolve full path
    const fullPath = path.resolve(filePath, fileName);
    
    // Security validation - prevent path traversal
    if (!fullPath.startsWith(path.resolve(process.cwd()))) {
      throw new Error('Invalid path - outside project directory');
    }
    
    // Validate filename
    if (!/^[a-zA-Z0-9\-_\.]+$/.test(fileName)) {
      throw new Error('Invalid filename - use alphanumeric, dash, underscore, dot only');
    }
```

#### 2. Directory Creation
```javascript
    // Ensure directory exists
    const directory = path.dirname(fullPath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
```

#### 3. File Writing with Backup
```javascript
    // Handle existing file
    if (fs.existsSync(fullPath)) {
      // Create backup
      const backupPath = `${fullPath}.backup.${Date.now()}`;
      fs.copyFileSync(fullPath, backupPath);
    }
    
    // Write file
    fs.writeFileSync(fullPath, content, 'utf8');
    
    return {
      success: true,
      fullPath,
      message: `Document created: ${fullPath}`
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Failed to create document: ${error.message}`
    };
  }
}
```

### Export Configuration
```javascript
// Export both named and default
export { createDoc };
export default createDoc;
```

## Integration Points

### 1. Workflow Integration
```javascript
// In document workflows
import { createDoc } from '../../../utils/fileOperations.js';

export const createAnalysisDocument = async (planId, topic, analysisContent) => {
  const result = await createDoc(
    `.kiro/${planId.toString().padStart(4, '0')}/analysis`,
    `claude-analysis-${topic}.md`,
    analysisContent
  );
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  return result;
};
```

### 2. Plan Creation Enhancement
```javascript
// In createPlan workflow
import { createDoc } from '../../utils/fileOperations.js';

// After database operations
const planDocument = generatePlanTemplate(planData);
const docResult = await createDoc(
  'claude-plans/a-pending',
  `${paddedId}-${safeName}.md`,
  planDocument
);

if (!docResult.success) {
  console.warn('Plan created in database but file creation failed:', docResult.message);
}
```

## Error Handling Specifications

### Required Error Cases
1. **Invalid paths** - Security validation
2. **Permission errors** - Directory/file permissions
3. **Disk space** - File system full
4. **Invalid content** - Non-string content, encoding issues
5. **Concurrent access** - File locks, race conditions

### Error Response Format
```javascript
{
  success: false,
  error: "Specific error message",
  message: "User-friendly message",
  code: "ERROR_CODE" // Optional for categorization
}
```

## Testing Requirements

### Unit Tests
Create `fileOperations.test.js`:

1. **Happy path** - Normal file creation
2. **Directory creation** - Auto-create nested directories  
3. **File overwrite** - Backup existing files
4. **Path validation** - Security checks
5. **Error scenarios** - Invalid inputs, permissions

### Integration Tests
1. **Workflow integration** - Test with actual document workflows
2. **Plan creation** - End-to-end plan creation with files
3. **Multiple documents** - Same directory, different files

## Security Considerations

### Path Traversal Prevention
- Resolve all paths to absolute
- Validate paths stay within project directory
- Sanitize filenames

### File Permissions
- Set appropriate file permissions (644)
- Set appropriate directory permissions (755)
- Respect existing permissions

### Content Validation
- Validate content is string
- Check for reasonable file size limits
- Prevent binary content injection

## Performance Considerations

### Synchronous vs Asynchronous
- Start with synchronous for simplicity
- Consider async version for large files
- Handle concurrent access properly

### File Size Limits
- Reasonable limits (e.g., 10MB for markdown)
- Progress reporting for large files
- Memory usage optimization

## Deployment Checklist

1. ✅ **Core function implemented** with error handling
2. ✅ **Security validation** prevents path traversal
3. ✅ **Unit tests** cover all scenarios
4. ✅ **Integration** with existing workflow system
5. ✅ **Documentation** updated in shared-imports
6. ✅ **Export** properly configured for imports

## Next Implementation Steps

### Immediate (Phase 1)
1. Implement core `createDoc` function
2. Add to shared-imports exports
3. Create unit tests
4. Test basic functionality

### Follow-up (Phase 2)  
1. Integrate with `createPlan` workflow
2. Test plan creation end-to-end
3. Add template system for plan documents
4. Create document workflow templates

### Future (Phase 3)
1. Agent document workflows (analysis, guidance)
2. Communication file creation
3. Advanced features (versioning, templates)
4. Performance optimization

## Implementation Notes

- **Keep it simple initially** - Basic file creation first
- **Security first** - Validate all inputs
- **Error handling** - Robust error reporting
- **Testing** - Comprehensive test coverage
- **Documentation** - Clear usage examples

This utility becomes the foundation for all document automation in Plan 0019.