# Plan 0018 Phase 3: Document Management Integration

## Requirements

### Objective

Set up manual document registration system for files in `.kiro/specs/` and `.kiro/issues/` directories, integrating them into the plan_documents database table via a universal script.

### Functional Requirements

#### FR1: Document Discovery

- Script must scan `.kiro/specs/` and `.kiro/issues/` directories for markdown files
- Discovery should work for both individual files and files within subdirectories
- Support for nested folder structures (e.g., `.kiro/specs/0019-feature/design.md`)

#### FR2: Manual Database Registration

- Unregistered documents must be registered in the `plan_documents` table when script is run
- Document type should be inferred from directory (`specs` or `issues`)
- File path should be stored relative to workspace root
- Title should be extracted from file content (first # heading) or filename
- Author should default to 'kiro' for automated creation
- Status should default to 'draft'

#### FR3: Plan Association

- System should attempt to extract plan_id from folder name patterns (e.g., `0018-feature-name`)
- If no plan_id can be extracted, allow manual association later
- Support for specs/issues not tied to specific plans

#### FR4: Metadata Extraction

- Extract title from first markdown heading or use filename
- Set appropriate timestamps (created_at, updated_at)
- Track creation source (created_by = 'kiro', 'user', etc.)

### Technical Requirements

#### TR1: Implementation Approach

- Use manual script execution rather than automated detection (file watchers deferred to Plan 019X)
- Integrate with existing plan management workflow
- Provide clear command-line interface for different use cases

#### TR2: Error Handling

- Handle cases where plan_id cannot be determined
- Graceful handling of malformed markdown files
- Prevent duplicate entries for the same file

#### TR3: Integration Points

- Work with existing plan management system
- Compatible with current database schema
- Support future document status workflow

### Non-Functional Requirements

#### NFR1: Performance

- Document registration should not significantly delay file creation
- Batch processing for multiple file operations

#### NFR2: Reliability

- System should recover gracefully from failures
- No data loss if registration fails temporarily

#### NFR3: Maintainability

- Clear separation between detection and registration logic
- Configurable patterns for plan_id extraction
- Logging for troubleshooting

## Success Criteria

1. Script successfully discovers and registers unregistered `.md` files in `.kiro/specs/`
2. Script successfully discovers and registers unregistered `.md` files in `.kiro/issues/`
3. Plan association works for standard naming patterns
4. Title extraction works from markdown headings
5. System handles edge cases gracefully (no plan_id uses plan_id = 0 for orphans, malformed files, etc.)

## Out of Scope

- Migration of existing documents (handled separately)
- Document content indexing or search
- Advanced workflow states beyond draft/approved/obsolete
- Real-time collaboration features
