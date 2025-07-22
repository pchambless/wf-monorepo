# AI Session Startup Protocol
*Quick context recovery for Claude and Kiro when starting new sessions*

**Purpose:** Rapid situational awareness and context restoration for efficient AI collaboration

---

## Universal Startup Checklist

### 1. **Project Context Recovery**
- [ ] **Read CLAUDE.md** - Project context, behavioral preferences, MVP development philosophy
- [ ] **Read AI/collaboration-rules.md** - Claude ↔ Kiro coordination framework and swim lanes
- [ ] **Read AI/collaboration-methodology.md** - Investigation support and process enhancement procedures

### 2. **Collaboration State Check**
- [ ] **Check coordination log** - `.kiro/communication/coordination-log.json` for pending items
- [ ] **Review pending communications** - `.kiro/communication/[claude-requests|kiro-questions]/`
- [ ] **Identify awaiting responses** - Any "awaiting-claude-review" or "awaiting-kiro-response" items

### 3. **Plan Status Assessment**
- [ ] **Active plans** - `claude-plans/a-pending/` for current work
- [ ] **Impact tracking** - `claude-plans/impact-tracking.json` for plan status and dependencies
- [ ] **Plan registry** - `claude-plans/plan-registry.json` for overall status
- [ ] **User signals active plan** - Wait for "Plan NNNN" format from user

### 4. **Pending Communications Review**
- [ ] **Architectural questions** - Any ARCHITECTURAL_QUESTION flags requiring input
- [ ] **Implementation handoffs** - Any completed work needing review
- [ ] **Process innovations** - Any off-plan discoveries or methodology enhancements

### 5. **Current Focus Identification**
- [ ] **Blocking dependencies** - Which plans are waiting on others
- [ ] **Compilation errors** - Any immediate technical issues
- [ ] **User validation needs** - Any work awaiting user approval

---

## Investigation Support (New Sessions)

### Check Investigation Artifacts
- [ ] **Review investigation files** in `.kiro/specs/[current-plan]/`
- [ ] **Check code references** - Pre-extracted snippets and integration points
- [ ] **Review progress logs** - Shared investigation state and discoveries

### Identify Support Needs
- [ ] **Complex integration tasks** - Need investigation guides?
- [ ] **Architectural decisions** - Need system analysis support?
- [ ] **Code extraction** - Need reference snippets for comparison?
- [ ] **Progress tracking** - Need shared investigation logs?

### Create Investigation Support (Claude)
- [ ] **investigation-guide.md** - File locations, key functions, integration points
- [ ] **code-references.js** - Extracted snippets with context and line numbers
- [ ] **discovery-checklist.md** - Structured investigation steps
- [ ] **integration-points.md** - System connections and compatibility analysis

---

## Quick File References

### Project Structure
- **Project Rules:** `/CLAUDE.md`
- **Collaboration Framework:** `/AI/collaboration-rules.md`
- **Process Methodology:** `/AI/collaboration-methodology.md`
- **Plans:** `/claude-plans/a-pending/`, `/claude-plans/b-completed/`
- **Impact Tracking:** `/claude-plans/impact-tracking.json`

### Kiro Integration
- **Coordination:** `.kiro/communication/coordination-log.json`
- **Specs:** `.kiro/specs/[plan-name]/`
- **Issues:** `.kiro/issues/`
- **Impact Registry:** `.kiro/impact-registry.json`

### Architecture Context
- **DevTools Rules:** `/packages/devtools/src/docs/generated/rules/ARCHITECTURE-RULES.md`
- **Generation Commands:** See CLAUDE.md DevTools section
- **Field Patterns:** `/packages/devtools/src/utils/directiveMap.js`

---

## Claude-Specific Startup

### Architectural Review Priorities
- [ ] **Check for ARCHITECTURAL_QUESTION flags** in recent files
- [ ] **Review system integration opportunities** in current plan
- [ ] **Assess architectural impact** of proposed changes
- [ ] **Identify pattern validation needs** for implementation approach

### Investigation Support Role
- [ ] **Create investigation guides** for complex integration tasks
- [ ] **Extract relevant code snippets** with full context
- [ ] **Identify integration points** and potential conflicts
- [ ] **Provide architectural guidance** through coordination system

### Plan Coordination
- [ ] **Review plan dependencies** and blocking relationships
- [ ] **Check for scope changes** requiring architectural input
- [ ] **Assess impact on other plans** and system components

---

## Kiro-Specific Startup

### Implementation Readiness
- [ ] **Check spec completeness** in `.kiro/specs/[plan]/`
- [ ] **Review investigation artifacts** created by Claude
- [ ] **Assess code references** and integration requirements
- [ ] **Identify architectural questions** needing clarification

### Testing & Validation
- [ ] **Review testing strategy** in plan design documents
- [ ] **Check validation criteria** for implementation success
- [ ] **Identify end-to-end testing** requirements
- [ ] **Plan integration testing** approach

### Progress Communication
- [ ] **Update progress logs** with current investigation state
- [ ] **Communicate discoveries** through coordination system
- [ ] **Request architectural input** when needed via ARCHITECTURAL_QUESTION

---

## Status Indicators to Check

### Emergency Scenarios
- [ ] **ARCHITECTURAL_QUESTION** - Implementation blocked, needs Claude input
- [ ] **Compilation errors** - Technical issues preventing progress
- [ ] **Plan sequencing conflicts** - Multiple plans affecting same files
- [ ] **User testing feedback** - Implementation needs adjustment

### Coordination Health
- [ ] **Pending responses** - Any communications awaiting reply >24 hours
- [ ] **Blocking dependencies** - Plans waiting on architectural decisions
- [ ] **Scope creep** - Implementation expanding beyond approved specs
- [ ] **Integration conflicts** - Multiple plans modifying same systems

---

## Context Clues for Quick Assessment

### Development State
- **Last modified files** - What was being worked on most recently?
- **Recent git commits** - What changes were made?
- **Build/compilation status** - Any immediate technical issues?

### Collaboration State
- **Recent .kiro/issues/** - What problems were encountered?
- **Coordination log entries** - What decisions were made?
- **Plan task status** - Which tasks are in-progress vs complete?

### System Health
- **Server logs** - Any runtime issues to address?
- **Browser console** - Any client-side errors?
- **Test results** - Any failing validations?

---

## Current Session State (Auto-Updated)
- **Active Plan:** [Plan Number] ([Plan Name])
- **Blocking:** [Blocked by Plan Number] 
- **Last Action:** [Description of last action taken]
- **Next Action:** [Description of next required action]
- **Status:** [Ready for implementation/Awaiting review/etc.]

---

## Emergency Startup Scenarios

### Mid-Implementation Handoff
**Situation:** Kiro → Claude review needed during active implementation
**Actions:** Check progress logs, review recent changes, assess architectural soundness

### Blocking Issue Discovered
**Situation:** Implementation stopped due to architectural conflict
**Actions:** Review issue details, assess integration requirements, provide architectural guidance

### Plan Sequencing Conflict
**Situation:** Multiple plans affecting same files discovered
**Actions:** Review impact tracking, coordinate sequencing, resolve conflicts

### User Testing Feedback
**Situation:** Implemented features need adjustment based on user feedback
**Actions:** Assess feedback scope, determine architectural impact, coordinate changes

---

**Token Conservation Strategy:** This document enables rapid context recovery without lengthy explanations, maintaining focus on current objectives while ensuring comprehensive situational awareness.

**Collaboration Success Metric:** Either AI can achieve full context awareness within 2-3 minutes of session startup using this protocol.