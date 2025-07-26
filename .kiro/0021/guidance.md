# Plan 0021: Architecture Refinements - Implementation Guidance

## Phase Status
- ✅ Phase 1: Workflow Foundation (DB consistency validated)
- ✅ Phase 2: File Structure (claude-plans/ + .kiro/NNNN/ established)
- 🎯 Phase 3: Communication System (ready for Kiro implementation)

## Communication Module Specification

**Assignment: KIRO** (pattern replication per collaboration-rules.md)

**Module**: `claude-plans/tools/create-communication.js`
**Pattern**: Business Workflow Modules (follow create-plan.js exactly)

### Core Functions
- `createCommunication(planId, type, message)` - DB + optional file
- `triggerNotification(planId, recipient, event)` - Agent handoffs
- `createIssueFile(planId, issueText)` - Issue docs in .kiro/NNNN/communications/

### Integration Points
- CreatePlanForm: Auto-notify Claude after plan creation
- UserCommunicationForm: Replace file creation with module calls
- Database: plan_communications table with audit trail

## Document Workflow (Phase 4)

**Claude**: analysis.md + guidance.md (architectural decisions)
**Kiro**: specs/design.md + specs/tasks.md (implementation details)
**User**: Plan documents (business requirements)

## Next Actions
1. Kiro implements create-communication.js
2. Test workflow with Plan 0021
3. Update UI forms to use communication module

**Status**: Architecture complete, ready for implementation