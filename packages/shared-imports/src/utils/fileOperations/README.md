# File Operations Module

A secure, modular file creation utility for the WhatsFresh monorepo with comprehensive validation, security checks, and error handling.

## Overview

The File Operations module provides a robust `createDoc` function that enables programmatic document creation with automatic directory management, security validation, and comprehensive error handling. This utility is designed to dramatically reduce token usage in document automation workflows by providing efficient file creation capabilities.

## Features

- ✅ **Secure file creation** with path traversal prevention
- ✅ **Automatic directory creation** (recursive)
- ✅ **UTF-8 encoding** for all text files
- ✅ **Comprehensive validation** (inputs, filenames, paths)
- ✅ **Project boundary enforcement** (files must be within project)
- ✅ **Detailed error handling** with categorized error codes
- ✅ **Overwrite detection** with logging
- ✅ **Modular architecture** for maintainability

## Quick Start

```javascript
import { createDoc } from "@whatsfresh/shared-imports/utils";

// Create a simple document
const result = createDoc("./docs", "readme.md", "# My Project");

if (result.success) {
  console.log("✅ Created:", result.fullPath);
} else {
  console.error("❌ Failed:", result.message);
}
```

## API Reference

### `createDoc(filePath, fileName, content)`

Creates a document with automatic directory creation and security validation.

**Parameters:**

- `filePath` (string): Directory path (relative or absolute)
- `fileName` (string): File name with extension
- `content` (string): File content to write

**Returns:** `CreateDocResponse`

- Success: `{ success: true, fullPath: string, message: string }`
- Error: `{ success: false, error: string, message: string, code: string }`

**Security Constraints:**

- Filenames: Only alphanumeric, dash, underscore, dot
- Extensions: `.md`, `.txt`, `.json`, `.js`, `.ts`, `.jsx`, `.tsx`, `.html`, `.css`, `.yml`, `.yaml`
- Size limit: 10MB maximum
- Path validation: Must be within project directory

## Usage Examples

### Basic Document Creation

```javascript
import { createDoc } from "@whatsfresh/shared-imports/utils";

const result = createDoc(
  "./docs",
  "readme.md",
  `# My Project

This is a sample README file created with createDoc.

## Features
- Feature 1
- Feature 2
`
);

if (result.success) {
  console.log("Document created at:", result.fullPath);
}
```

### Nested Directory Creation

```javascript
// Automatically creates nested directories
const result = createDoc(
  "./docs/guides/setup",
  "installation.md",
  "# Installation Guide\n\nStep-by-step instructions..."
);
```

### Error Handling

```javascript
const result = createDoc("../../../etc", "passwd", "malicious");

if (!result.success) {
  switch (result.code) {
    case "SECURITY_ERROR":
      console.log("🔒 Security violation blocked");
      break;
    case "VALIDATION_ERROR":
      console.log("📝 Input validation failed");
      break;
    case "PERMISSION_ERROR":
      console.log("🚫 Permission denied");
      break;
    default:
      console.log("❓ Unknown error:", result.message);
  }
}
```

### Batch Document Creation

```javascript
const documents = [
  { path: "./docs", name: "readme.md", content: "# README" },
  { path: "./docs/api", name: "endpoints.md", content: "# API" },
  { path: "./docs/guides", name: "setup.md", content: "# Setup" },
];

const results = documents.map((doc) =>
  createDoc(doc.path, doc.name, doc.content)
);

const successful = results.filter((r) => r.success);
console.log(`✅ Created ${successful.length} documents`);
```

## Advanced Usage

### Using Individual Utilities

```javascript
import {
  validateInputs,
  ensureDirectory,
  fileExists,
  ERROR_TYPES,
} from "@whatsfresh/shared-imports/utils";

// Validate inputs before processing
try {
  validateInputs("./docs", "readme.md", "# Content");
  console.log("✅ Inputs valid");
} catch (error) {
  console.error("❌ Validation failed:", error.message);
}

// Check if file exists
if (fileExists("./docs/readme.md")) {
  console.log("📄 File already exists");
}

// Ensure directory exists
ensureDirectory("./docs/new-section");
```

## Error Codes

| Code               | Description                   | Example                         |
| ------------------ | ----------------------------- | ------------------------------- |
| `VALIDATION_ERROR` | Input validation failed       | Invalid filename, empty content |
| `SECURITY_ERROR`   | Security constraint violation | Path traversal attempt          |
| `PERMISSION_ERROR` | File system permission denied | Cannot write to directory       |
| `DISK_ERROR`       | Disk space or I/O error       | Disk full, hardware failure     |
| `DIRECTORY_ERROR`  | Directory operation failed    | Cannot create directory         |
| `WRITE_ERROR`      | File writing failed           | File locked, invalid path       |

## Module Architecture

```
fileOperations/
├── index.js          # Main entry point with createDoc function
├── validation.js     # Input and filename validation
├── security.js       # Path security and traversal prevention
├── directory.js      # Directory creation and management
├── backup.js         # File existence checking and backup utilities
├── writer.js         # File writing operations
├── errors.js         # Error handling and categorization
└── README.md         # This documentation
```

## Security Features

### Path Traversal Prevention

- Blocks `../`, `..\`, and other traversal patterns
- Validates resolved paths stay within project directory
- Prevents access to system files and directories

### Filename Validation

- Only allows alphanumeric characters, dashes, underscores, dots
- Blocks Windows reserved names (CON, PRN, AUX, etc.)
- Validates file extensions against allowed list
- Enforces maximum filename length (255 characters)

### Content Validation

- Ensures content is a valid UTF-8 string
- Enforces maximum file size limit (10MB)
- Validates content is not empty or null

## Performance Considerations

- **Synchronous operations** for simplicity and reliability
- **File size limits** to prevent memory issues
- **Efficient path resolution** with caching
- **Minimal dependencies** for fast loading

## Integration with Document Workflows

This utility is designed to integrate with document automation workflows:

```javascript
// Plan creation workflow
const planContent = generatePlanTemplate(planData);
const result = createDoc(
  "claude-plans/a-pending",
  `${planId}-plan.md`,
  planContent
);

// Analysis document creation
const analysisContent = generateAnalysisTemplate(findings);
const result = createDoc(
  `.kiro/${planId}/analysis`,
  "claude-analysis.md",
  analysisContent
);

// Implementation guidance
const guidanceContent = generateGuidanceTemplate(requirements);
const result = createDoc(
  `.kiro/${planId}/guidance`,
  "implementation-guide.md",
  guidanceContent
);
```

## Testing

The module includes comprehensive end-to-end testing:

```javascript
// Test basic functionality
const result = createDoc("./test-docs", "hello.md", "# Hello World");

// Test nested directories
const result = createDoc("./test-docs/guides/setup", "install.md", "# Install");

// Test security validation
const result = createDoc("../../../etc", "passwd", "malicious"); // Should fail
```

## Contributing

When contributing to this module:

1. **Maintain security** - All changes must preserve security validations
2. **Add tests** - New features require corresponding tests
3. **Update documentation** - Keep JSDoc comments current
4. **Follow patterns** - Use existing error handling and logging patterns
5. **Consider performance** - Avoid blocking operations where possible

## Version History

- **1.0.0** - Initial release with core functionality
  - Basic document creation
  - Security validation
  - Directory auto-creation
  - Comprehensive error handling
  - Modular architecture

## License

Part of the WhatsFresh monorepo - internal use only.
