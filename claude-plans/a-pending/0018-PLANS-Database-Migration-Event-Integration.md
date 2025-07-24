# PLANS - Database Migration & Event Integration (Enhanced)

## Plan Overview
Migrate plan management system from file-based coordination to comprehensive database-backed operations with integrated user interface and automation. **Absorbs Plan 0016 (User Communication Interface)** into unified implementation.

## Background
The existing plan management relies on JSON files and markdown documents for coordination. This plan creates a complete database foundation with normalized tables, foreign key relationships, event-driven CRUD operations, and integrated user interface for plan management.

## Architecture Decisions

### Database-Only Operations
- **Communications**: Database records only (no file creation)
- **Impact Tracking**: Database events only (no file creation)
- **Rationale**: Structured data belongs in database, files reserved for human-readable documents

### Unified Document Management (File + Database)
- **All Documents**: Tracked in single plan_documents table regardless of type
- **Plan Files**: Treated as documents with document_type='plan'
- **Specifications**: document_type='spec-design', 'spec-requirements', 'spec-tasks'
- **Issues**: document_type='issue-report', 'issue-audit'
- **Rationale**: Unified workflow for all document types, consistent tracking and status management

### Agent Document Update System
- **Universal Script**: .kiro/tools/document-update.js for all agents
- **Claude Integration**: Script-based database updates after document modifications
- **User Integration**: Same script for document creation and updates
- **Kiro Integration**: Existing hooks + script compatibility
- **Eliminates**: Need for file watching on manual document updates

### Document Creation Domains

  **1. Plan Creation** → **User**
  - Creates initial plans via UI/CLI tools
  - Business requirements and priorities

  **2. Plan Guidance & Requirements** → **Claude**
  - Architectural analysis and technical requirements
  - Updates plan scope, phases, dependencies
  - Cross-plan integration analysis

  **3. Issues** → **Claude identifies, User enters**
  - Claude spots problems during architecture review
  - User formally enters via issue interface (maintains user ownership)

  **4. Specs** → **Always Kiro**
  - `design.md`, `requirements.md`, `tasks.md`
  - Implementation-focused documentation
  - Technical execution artifacts

  **Benefits:**
  - Clear ownership and accountability
  - Predictable `created_by` database values
  - Agent responsibility boundaries
  - Simplified document workflow automation

## Phased Implementation

### Phase 1: Database Foundation ✅ (Complete)
- Created `api_wf.plans` table with auto-increment IDs
- Created `api_wf.plan_communications` for strategic coordination (database-only)
- Created `api_wf.plan_impacts` for file change tracking (database-only)
- Created `api_wf.plan_documents` for document references
- Created plan eventTypes: `planList`, `planCommunicationList`, `planImpactList`, `planDocumentList`
- Migrated existing plan data from plan-registry.json

### Phase 2: User Interface Implementation (Core Plan 0016 Integration) 
**Note: Communication folder consolidation skipped - files become obsolete with database migration**
- Build 3-tab architecture dashboard: Plan Communication, Plan Tools, Structure Relationships
- Implement database-native communication form (saves to plan_communications table)
- Create plan selector dropdowns using planList eventType
- Build communication history display using planCommunicationList queries
- Implement plan tools (create, complete, impact tracking) with DML integration
- **Deliverable**: Complete user interface for plan management

### Phase 3: Unified Document Management
- Implement universal document-update script (.kiro/tools/document-update.js)
- Integrate all document types into plan_documents table (plans, specs, issues)
- Build document status workflow (draft → review → approved → archived)
- Create Claude database integration via script execution
- Migrate existing documents to unified structure
- **Deliverable**: Universal document management system with agent integration

### Phase 4: Advanced Automation (Future)
- Implement database triggers for automatic logging (where beneficial)
- Build workflow automation for plan lifecycle events
- Create notification system for status changes
- Implement file watching for system-generated changes (non-manual updates)
- **Deliverable**: Enhanced automation while maintaining manual control where needed

## Implementation Impact Analysis

### Impact Summary
- **Plan ID**: 0018
- **Files**: 15+ (database tables, eventTypes, UI components)
- **Complexity**: High (infrastructure migration)
- **Packages**: packages/shared-imports, packages/db-connect, sql/claude-plans
- **Blast Radius**: PLANS (new), DATABASE (medium), DEVTOOLS (medium)

### Impact Tracking Status
- **Database Design**: ✅ Complete
- **Data Migration**: ✅ Complete  
- **EventTypes**: ✅ Complete
- **UI Components**: ⏳ Pending Kiro implementation
- **Server Integration**: ⏳ Pending coordination system fix

### Key Components
- Database tables with proper foreign keys and audit trails
- EventType definitions for data access
- Migration scripts for existing data
- Operational guidance for Kiro implementation

## Updated Success Criteria

### Phase 2: User Interface
- [ ] 3-tab architecture dashboard functional
- [ ] Communication form saves directly to plan_communications table (no files)
- [ ] Plan selector dropdowns populated from planList eventType
- [ ] Communication history displays from planCommunicationList queries
- [ ] Plan creation/completion tools integrated with database

### Phase 3: Unified Document Management
- [ ] Universal document-update script implemented and tested
- [ ] All document types integrated into plan_documents table (plans, specs, issues)
- [ ] Claude script integration functional for database updates
- [ ] Document status workflow operational (draft → review → approved → archived)
- [ ] Migration of existing documents to unified structure complete

### Phase 4: Full Automation
- [ ] Database triggers for automatic logging
- [ ] Impact tracking automation (database-only, no files)
- [ ] Plan lifecycle notifications

## Plan Dependencies
- **Absorbs**: Plan 0016 (User Communication Interface) - now Phase 3 of this plan
- **Enables**: Complete plan management automation, reporting, analytics
- **Blocks**: All future plan management enhancements until database foundation is complete

## Technical Architecture Notes
- **Database-Only**: Communications and impacts stored only in database (no file creation)
- **File + Database**: Documents (.md files) tracked in both filesystem and database
- **Auto-increment IDs**: Replace file-based numbering system
- **Foreign key relationships**: Ensure data integrity across plan artifacts
- **DML integration**: All CRUD operations through standard DML system
- **EventType queries**: UI components use database-driven data fetching

### Impact Tracking Guidelines
- **Track meaningful milestones**: Document creation, task completion, major spec changes
- **Skip routine updates**: Individual task steps, progress logs, minor edits
- **Task completion pattern**: Track when task.md is fully completed (all steps done), not individual step updates
- **Document changes**: Track creation of new specs/issues, skip routine maintenance
- **Code changes**: Track all implementation-related file modifications during plan execution

## Current Status
- **Phase 1**: ✅ Complete (database foundation established)
- **Phase 2**: ✅ Complete (UI database integration implemented by Kiro)
- **Phase 3**: ⏳ Ready for implementation (document management integration)
- **Overall**: Enhanced scope with Plan 0016 integration, Phase 2 complete, proceeding to Phase 3

## Next Steps for Kiro
**Phase 3**: Unified Document Management - Implement universal document-update script and integrate all document types (plans, specs, issues) into plan_documents table with Claude script integration for database updates.