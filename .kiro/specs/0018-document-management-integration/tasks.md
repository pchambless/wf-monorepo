# Plan 0018 Phase 3: Document Management Integration - Tasks

## Implementation Tasks

### Task 1: Create Metadata Extraction Utilities

**File**: `packages/shared-imports/src/utils/documentMetadata.js`
**Status**: Pending
**Complexity**: Medium

#### Subtasks:

- [ ] Implement `extractPlanId(filePath)` with pattern matching
- [ ] Implement `extractTitle(fileContent)` for markdown heading extraction
- [ ] Implement `determineDocumentType(filePath)` for spec/issue classification
- [ ] Implement `parseDocumentMetadata(filePath, content)` as main interface
- [ ] Add unit tests for all extraction functions
- [ ] Handle edge cases (no headings, malformed paths, etc.)

#### Acceptance Criteria:

- Plan ID extracted from folder names like "0019-feature", "plan-20-test"
- Title extracted from first `# Heading` in markdown
- Document type correctly identified as 'spec' or 'issue'
- Graceful handling of missing or malformed data

---

### Task 2: Create Document Registration Service

**File**: `packages/shared-imports/src/services/documentService.js`
**Status**: Pending
**Complexity**: Medium

#### Subtasks:

- [ ] Implement `registerDocument(metadata)` using DML API
- [ ] Implement `updateDocumentStatus(id, status)` for future use
- [ ] Implement `linkDocumentToPlan(documentId, planId)` for manual association
- [ ] Add error handling for DML API failures
- [ ] Add duplicate detection logic
- [ ] Create service tests with mock DML responses

#### Acceptance Criteria:

- Documents successfully registered in plan_documents table
- Proper error handling for API failures
- No duplicate entries for same file path
- Service methods return meaningful success/error responses

---

### Task 3: Create Universal Document Update Script

**File**: `claude-plans/tools/document-update.js`
**Status**: Pending
**Complexity**: High

#### Subtasks:

- [ ] Implement directory scanning for .kiro/specs/ and .kiro/issues/
- [ ] Add database query to check existing registered documents
- [ ] Integrate metadata extraction utilities
- [ ] Integrate document registration service
- [ ] Add command-line argument parsing (--dry-run, --file, --verbose)
- [ ] Add comprehensive error handling and user-friendly output
- [ ] Test script with various document scenarios

#### Acceptance Criteria:

- Script scans directories and finds unregistered .md files
- Metadata correctly extracted and documents registered via DML
- Clear console output showing registration results
- Command-line options work as expected (dry-run, specific files, etc.)
- Proper error handling for edge cases

---

### Task 4: Update Shared Imports Index

**File**: `packages/shared-imports/src/utils/index.js` and `packages/shared-imports/src/services/index.js`
**Status**: Pending
**Complexity**: Low

#### Subtasks:

- [ ] Export documentMetadata utilities
- [ ] Export documentService functions
- [ ] Update package documentation

#### Acceptance Criteria:

- New utilities and services available for import
- Consistent with existing export patterns

---

### Task 5: Integration Testing

**Files**: Various test scenarios
**Status**: Pending
**Complexity**: Medium

#### Subtasks:

- [ ] Test spec creation in numbered folders
- [ ] Test issue creation without plan association
- [ ] Test nested folder structures
- [ ] Test malformed markdown files
- [ ] Test DML API error scenarios
- [ ] Verify database entries match expected format

#### Acceptance Criteria:

- All test scenarios pass
- Database entries created correctly
- Error cases handled gracefully
- No performance impact on file operations

---

### Task 6: Documentation and Examples

**Files**: README updates, usage examples
**Status**: Pending
**Complexity**: Low

#### Subtasks:

- [ ] Document new utilities in shared-imports README
- [ ] Create usage examples for document service
- [ ] Update plan 0018 status with Phase 3 completion
- [ ] Add troubleshooting guide for common issues

#### Acceptance Criteria:

- Clear documentation for new functionality
- Examples show proper usage patterns
- Troubleshooting guide covers common scenarios

## Implementation Order

1. **Task 1** (Metadata Extraction) - Foundation utilities
2. **Task 2** (Document Service) - Database integration
3. **Task 4** (Exports) - Make utilities available
4. **Task 3** (Manual Script) - Document registration tool
5. **Task 5** (Integration Testing) - Validation
6. **Task 6** (Documentation) - Completion

## Success Metrics

- [ ] Script successfully scans and registers unregistered documents
- [ ] Plan association works for standard naming patterns
- [ ] System handles edge cases without breaking
- [ ] Clear console output guides users through registration process
- [ ] Command-line options provide flexibility for different use cases
- [ ] Clear audit trail of document creation in database

## Risk Mitigation

### Risk: Script doesn't detect all document files

**Mitigation**: Comprehensive directory traversal, support for nested folders, clear logging of scanned paths

### Risk: DML API failures prevent registration

**Mitigation**: Graceful error handling, continue processing other files, detailed error reporting

### Risk: Plan ID extraction too rigid

**Mitigation**: Multiple pattern support, graceful fallback to null plan_id, manual association option

### Risk: Users forget to run script regularly

**Mitigation**: Clear documentation, integration with existing plan workflows, future automation in Plan 019X
