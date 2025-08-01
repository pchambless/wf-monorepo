# AI Session Startup Protocol
*Quick context recovery for Claude and Kiro when starting new sessions*

**Purpose:** Rapid situational awareness and context restoration for efficient AI collaboration

---

## Plan-Focused Startup Protocol

### 1. **Plan Context Recovery**
When user signals "Plan NNNN":
- [ ] **Read plan file** - `claude-plans/a-pending/NNNN-*.md` for plan context
- [ ] **Check .kiro structure** - `.kiro/NNNN/` for analysis, guidance, and specs
- [ ] **Review tasks status** - `.kiro/NNNN/specs/tasks.md` for current progress
- [ ] **Read CLAUDE.md** - Project context and behavioral preferences

### 2. **Plan-Specific Work State**
For active Plan NNNN:
- [ ] **Analysis files** - `.kiro/NNNN/analysis/` for Claude's prior architectural work
- [ ] **Guidance files** - `.kiro/NNNN/guidance/` for implementation guidance created
- [ ] **Specs status** - `.kiro/NNNN/specs/` for requirements, design, and task progress
- [ ] **Code references** - `.kiro/NNNN/specs/code-references.js` for implementation context

### 3. **Legacy System Check** (Being Phased Out)
- [ ] **Coordination log** - `.kiro/communication/coordination-log.json` (if exists)
- [ ] **Impact tracking** - `claude-plans/impact-tracking.json` (being migrated to database)
- [ ] **Plan registry** - `claude-plans/plan-registry.json` (if exists)

### 4. **Current Work Status Assessment**
- [ ] **Implementation blockers** - Any ARCHITECTURAL_QUESTION flags in guidance files
- [ ] **Completed analysis** - Which analysis and guidance files are complete
- [ ] **Next required work** - What Claude needs to provide next for plan progress
- [ ] **User feedback needs** - Any completed work awaiting user validation

---

## Standard Plan Structure Pattern

### Analysis Directory (`.kiro/NNNN/analysis/`)
Claude's architectural analysis files:
- `claude-analysis-*.md` - System analysis and architectural assessment
- Domain-specific analysis for plan requirements
- Integration point identification and risk assessment
- System impact and dependency analysis

### Guidance Directory (`.kiro/NNNN/guidance/`)
Claude's implementation guidance files:
- `implementation-guidance-*.md` - Specific implementation instructions
- Step-by-step implementation guidance for development
- Integration patterns and architectural constraints
- Code organization and pattern recommendations

### Specs Directory (`.kiro/NNNN/specs/`)
Shared specification files:
- `requirements.md` - Plan requirements and scope
- `design.md` - Technical design and architecture decisions
- `tasks.md` - Task breakdown and progress tracking
- `code-references.js` - Extracted code snippets with context
- `investigation-guide.md` - Investigation file locations and key functions
- `discovery-checklist.md` - Structured investigation steps

---

## Quick File References

### Current Plan Files (Replace NNNN with plan number)
- **Active Plan:** `claude-plans/a-pending/NNNN-*.md`
- **Plan Tasks:** `.kiro/NNNN/specs/tasks.md`
- **Plan Requirements:** `.kiro/NNNN/specs/requirements.md`
- **Plan Design:** `.kiro/NNNN/specs/design.md`

### Claude Work Products
- **Analysis:** `.kiro/NNNN/analysis/claude-analysis-*.md`
- **Guidance:** `.kiro/NNNN/guidance/implementation-guidance-*.md`
- **Code References:** `.kiro/NNNN/specs/code-references.js`
- **Investigation Guide:** `.kiro/NNNN/specs/investigation-guide.md`

### Legacy System Files (May Be Phased Out)
- **Plans:** `claude-plans/a-pending/`, `claude-plans/b-completed/`
- **Impact Tracking:** `claude-plans/impact-tracking.json` (potentially → database)
- **Coordination:** `.kiro/communication/coordination-log.json` (potentially → database)

### Core Architecture
- **Project Rules:** `CLAUDE.md`
- **DevTools Rules:** `packages/devtools/src/docs/generated/rules/ARCHITECTURE-RULES.md`
- **Field Patterns:** `packages/devtools/src/utils/directiveMap.js`

---

## Claude Session Startup Workflow

### Plan Context Recovery
When user says "Plan NNNN":
1. **Read plan context** - `claude-plans/a-pending/NNNN-*.md` for plan objectives
2. **Check existing analysis** - Review `.kiro/NNNN/analysis/` for prior architectural work
3. **Review guidance status** - Check `.kiro/NNNN/guidance/` for completed implementation guidance
4. **Assess current needs** - What architectural support is needed next?

### Rapid Assessment Questions
- **What analysis has Claude already completed?** (check analysis/ directory)
- **What guidance has been provided?** (check guidance/ directory)
- **What's the current task status?** (check specs/tasks.md)
- **Are there implementation blockers?** (look for ARCHITECTURAL_QUESTION flags)

### Next Action Identification
Based on current plan state:
- **Analysis needed:** Create architectural analysis files
- **Guidance needed:** Create implementation guidance files
- **Review needed:** Validate completed implementation work
- **Coordination needed:** Address architectural questions or blockers

---

## Database Migration Context (Plan 0019)

### Current Migration State
Plan 0019 focuses on migrating from file-based coordination to database-driven workflows:
- **Legacy:** `.kiro/communication/` files → **Target:** `api_wf.plan_communications` table
- **Legacy:** `claude-plans/impact-tracking.json` → **Target:** `api_wf.plan_impacts` table
- **Legacy:** File-based coordination → **Target:** Database queries + UI integration

### Session Implications
- **File references may be transitional** - some coordination still file-based during migration
- **Database integration in progress** - new workflows being developed
- **UI integration planned** - plan creation/management moving to web interface

---

## Current Plan Status Indicators

### Plan Health Check
- [ ] **Task completion** - Check `.kiro/NNNN/specs/tasks.md` for current progress
- [ ] **Analysis completeness** - Are all required analysis files created?
- [ ] **Guidance completeness** - Are all implementation guidance files created?
- [ ] **Implementation blockers** - Any ARCHITECTURAL_QUESTION flags?

### System Integration Status
- [ ] **Database migration progress** - What's been migrated from files to database?
- [ ] **UI integration status** - What plan management UI components exist?
- [ ] **Testing integration** - Are there tests for the new database workflows?

---

## Session Context Assessment

### Development State Assessment
- **Recent plan work** - Check git status for .kiro/NNNN/ modifications
- **Recent guidance** - What was the last guidance file created?
- **Implementation progress** - What has been completed based on guidance?

### Current Focus Areas (Plan-Specific)
- Focus areas depend on the specific plan objectives
- Architectural patterns and system integration needs
- Component development and workflow enhancements
- UI/UX improvements and user interface updates

---

## Efficient Session Startup

### 30-Second Assessment
1. **Plan context** - Read active plan file for current objectives
2. **Task status** - Check tasks.md for immediate next steps
3. **Blocking issues** - Scan for ARCHITECTURAL_QUESTION flags
4. **Recent work** - Review last modified files in .kiro/NNNN/

### 2-Minute Deep Dive
1. **Analysis review** - Read existing Claude analysis files
2. **Guidance review** - Check implementation guidance completeness
3. **Code integration** - Review code-references.js for implementation context
4. **System state** - Assess database migration and UI integration progress

---

**Token Conservation Strategy:** Focus on current plan structure and work rather than legacy coordination systems. Adapt to evolving workflows.

**Success Metric:** Claude can resume architectural support for any active plan within 2 minutes of session startup.