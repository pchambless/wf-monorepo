 # CLAUDE.md - WhatsFresh Working Guide
  *Working documentation - stays current because Claude depends on it daily*

  ## 🧠 Claude Behavior Configuration

  ### Core Behavior
  - **Tone**: Concise, technical, respectful, minimally verbose
  - **Response Cap**: 1800 tokens unless specified otherwise
  - **Code Style**: NO comments unless explicitly requested
  - **Output Preference**: Diffs, config deltas, direct edits over discussion
  - **Philosophy**: MVP development - break and fix over backward compatibility

  ### Working Documentation Priority
  1. **`.kiro/steering.yaml`** - Live project patterns and file paths
  2. **`CLAUDE.md`** - This file - behavioral preferences and project context
  3. **`AI/collaboration-rules.md`** - Role boundaries and coordination protocols
  4. **`AI/session-startup.md`** - Context recovery for new sessions

  ### Session Startup Protocol
  - **Primary Reference**: `AI/session-startup.md` for complete checklist
  - **Coordination Check**: `.kiro/communication/coordination-log.json` for pending items
  - **Plan Context**: User signals active plan with "Plan NNNN" format
  - **Investigation Support**: Check `.kiro/steering.yaml` frequent_paths before searching

  ---

   ## 🏗️ Project Architecture Context

  ### Monorepo Structure
  - **`wf-client`**: React ingredient tracking, recipe workflows
  - **`wf-server`**: Node.js API serving both client and admin apps
  - **`shared-imports`**: Monorepo-wide dependencies (React + non-React utilities)
  - **`devtools`**: Code generation tools and documentation systems

  ### Core Architecture Pattern
  **SQL Views → Directives → PageMaps → React Components**
  - **SQL Views**: `sql/views/client/` define data structure and field directives
  - **Directives**: `packages/devtools/src/automation/data/directives/` generated field configurations
  - **PageMaps**: `apps/wf-client/src/pages/*/pageMap.js` generated component configurations
  - **React Pages**: `apps/wf-client/src/pages/*/index.jsx` generated component wrappers

  ### Key Systems
  - **DirectiveMap**: `packages/devtools/src/utils/directiveMap.js` - Field configuration rules
  - **ContextStore**: `packages/shared-imports/src/stores/contextStore.js` - Session data (userID, acctID, parameters)
  - **DML System**: Server-side processing via `/api/execDML` with audit trail auto-injection
  - **Field Mapping**: Form fields (camelCase) → Database columns (snake_case) via pageMap.fieldMappings

  ### Critical Patterns
  - **Unified Naming**: `viewName` = `pageName` = `eventType` = `listEvent`
  - **Parent Keys**: Always `type: "number"`, `required: true`, `hidden: true`
  - **Audit Trail**: Auto-inject `created_at/by`, `updated_at/by`, `deleted_at/by`
  - **Parameter Resolution**: ContextStore auto-resolves userID, acctID for hidden fields

  Section 3: 🎛️ Investigation Efficiency

  ## 🎛️ Investigation Efficiency

  ### Shared Project Intelligence
  - **Check `.kiro/steering.yaml`** for current project patterns and file paths
  - **Use frequent_paths** as investigation starting points instead of searching
  - **Reference established_patterns** to avoid re-investigating known architecture
  - **Check skip_investigation** to focus effort on genuine architectural questions

  ### Investigation Strategy
  1. **Start with steering.yaml paths** - Don't search, use the map
  2. **Validate against established_patterns** - Is this expected behavior or actual issue?
  3. **Focus on deep_investigation areas** - Where architectural decisions are actually needed
  4. **Reference working documentation** - Live files over static explanations

  ### Common Investigation Shortcuts
  - **Page Issues**: Check `sql/views/client/[viewName].sql` → `directives/[viewName].json` → `pages/[viewName]/pageMap.js`
  - **Field Problems**: Reference `packages/devtools/src/utils/directiveMap.js` for field rules
  - **DML Issues**: Check `apps/wf-server/server/utils/dml/dmlProcessor.js` and pageMap.configDML
  - **API Problems**: Start with `packages/shared-imports/src/api/index.js`

  ### Architectural Decision Points
  - **System Integration**: When multiple packages need coordination
  - **Pattern Violations**: When established_patterns are being broken
  - **New Complexity**: When adding genuinely new architectural concepts
  - **Cross-Package Dependencies**: When shared-imports changes affect multiple apps

   ## 🔧 DevTools Operations

  ### Generation Commands
  **Primary Commands** (run from `packages/devtools/src/automation/`):
  ```bash
  # Core generators (always run)
  node core/genPageMaps.js                    # Generate pageMap configurations
  node triggered/genDirectives.js [viewName]  # Generate field directives for specific view
  node static/genPageIndex.js client --all   # Generate React component wrappers

  # Unified entry points
  node runCore.js                            # Run all core generators
  node runTriggered.js [viewName]            # Run triggered generators for view
  node detectChanges.js                      # Detect changed SQL views

  Investigation Commands

  # Test directive generation
  node triggered/genDirectives.js ingrTypeList

  # Regenerate after directive changes
  node core/genPageMaps.js

  # Check generation stability (should only change timestamps)
  node triggered/genDirectives.js [viewName]  # Run twice, compare

  File Locations (Steering Reference)

  - SQL Views: sql/views/client/ - Data structure definitions
  - Generated Directives: packages/devtools/src/automation/data/directives/
  - Generated PageMaps: apps/wf-client/src/pages/*/pageMap.js
  - Architecture Rules: packages/devtools/src/docs/generated/rules/ARCHITECTURE-RULES.md

  Common Debugging Pattern

  1. Issue Reported → Check steering.yaml for relevant paths
  2. Investigate Root Cause → SQL view → directive → pageMap → component
  3. Fix at Source → Usually SQL view or directiveMap.js rules
  4. Regenerate Downstream → genDirectives.js → genPageMaps.js
  5. Validate Fix → Test component behavior

## 📋 Live Plan Status

  ### Current Plan Information
  - **Plan Registry**: `claude-plans/plan-registry.json` - Authoritative plan status
  - **Impact Tracking**: `claude-plans/impact-tracking.json` - File-level progress tracking
  - **Active Plans**: `claude-plans/a-pending/` - Current work
  - **Completed Plans**: `claude-plans/b-completed/` - Reference for patterns and decisions

  ### Plan Management Tools
  ```bash
  # Plan lifecycle management
  claude-plans/tools/create-plan.js [CLUSTER] "Plan Name"
  claude-plans/tools/complete-plan.js [NNNN]
  claude-plans/tools/update-impact.js [NNNN] [status]

  Plan Coordination

  - Check Coordination: .kiro/communication/coordination-log.json for active communications
  - Pending Reviews: Look for "awaiting-claude-review" status items
  - Implementation Status: Check .kiro/specs/[plan-name]/tasks.md for progress

  Plan Dependencies

  - Blocking Relationships: Tracked in impact-tracking.json
  - File Conflicts: Multiple plans affecting same files
  - Sequencing: Plans that must complete before others can proceed

  User Plan Signals

  - Format: "Plan NNNN" indicates active focus
  - Context: Claude should reference plan files and coordination status
  - Scope: Check impact-tracking.json for affected files and systems

   ## 🤝 Collaboration Protocols

  ### Claude ↔ Kiro Coordination
  - **Framework**: `AI/collaboration-rules.md` defines swim lanes and responsibilities
  - **Communication**: `.kiro/communication/coordination-log.json` tracks formal exchanges
  - **Methodology**: `AI/collaboration-methodology.md` defines investigation support workflows

  ### Claude Domain (Architecture & Investigation)
  - **Architectural analysis** and system integration decisions
  - **Investigation support** via `.kiro/specs/[plan]/` reference files
  - **Pattern validation** and design consistency review
  - **Cross-system impact** assessment and dependency analysis

  ### Kiro Domain (Implementation & Testing)
  - **Implementation** following approved specifications
  - **Code generation** and pattern replication
  - **Testing workflows** and validation processes
  - **Progress tracking** via task completion and impact updates

  ### Communication Triggers
  - **ARCHITECTURAL_QUESTION** - Kiro needs Claude input to proceed
  - **awaiting-claude-review** - Implementation ready for architectural validation
  - **awaiting-kiro-response** - Claude request pending Kiro action
  - **process-enhancement** - Workflow improvements and methodology updates

  ### Investigation Support Workflow
  1. **Claude creates**: `investigation-guide.md`, `code-references.js`, `discovery-checklist.md`
  2. **Kiro implements**: Following investigation artifacts and architectural guidance
  3. **Shared progress**: Both update `progress-log.md` with discoveries and status
  4. **Coordination**: Formal communication through `.kiro/communication/` system

  ## 🚀 Session Management

  ### Session Startup
  - **Complete Protocol**: `AI/session-startup.md` - Full context recovery checklist
  - **Quick Start**: Check `.kiro/communication/coordination-log.json` for immediate priorities
  - **Plan Context**: Wait for user "Plan NNNN" signal before diving into specific work
  - **Steering Reference**: Use `.kiro/steering.yaml` frequent_paths for efficient investigation

  ### Token Conservation Strategy
  - **Batch Tool Calls**: Multiple parallel operations in single response when possible
  - **Reference Working Docs**: Point to live files rather than reproducing content
  - **Focus Responses**: Address specific query without unnecessary preamble/postamble
  - **Use TodoWrite**: Track progress systematically rather than maintaining mental context

  ### Context Recovery
  - **Session Gaps**: Use session-startup.md checklist for rapid situational awareness
  - **Plan Continuity**: Reference impact-tracking.json for current work status
  - **Coordination State**: Check coordination-log.json for pending communications
  - **Investigation State**: Review `.kiro/specs/[plan]/progress-log.md` for shared discoveries

  ### Working Documentation Principles
  - **Must Work**: Documentation Claude depends on daily must be accurate or operations fail
  - **Live References**: Point to current files rather than static descriptions
  - **Self-Updating**: References to live data rather than manually maintained lists
  - **Operationally Critical**: Information guides real work, not historical record

  ### Emergency Scenarios
  - **ARCHITECTURAL_QUESTION**: Immediate architectural input needed for blocked implementation
  - **Compilation Errors**: Technical issues preventing progress
  - **Plan Conflicts**: Multiple plans affecting same files requiring coordination
  - **Session Handoffs**: Mid-implementation transitions between AI agents