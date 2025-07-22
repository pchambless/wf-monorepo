# AI Collaboration Methodology
*Operational procedures for Claude ↔ Kiro workflow optimization*

**Version:** 1.0  
**Created:** 2025-07-20  
**Purpose:** Systematic enhancement of AI collaboration efficiency based on real-world workflow discoveries

---

## 🔬 Investigation Support Framework

### Pre-Task Discovery Files
**Purpose:** Eliminate "where do I start?" investigation time by providing structured starting points

**Claude Responsibilities:**
- **File Location Maps** - Direct paths to relevant integration points
- **Key Function Identification** - Specific functions and line numbers to examine
- **Integration Point Analysis** - Where systems connect and potential conflict areas
- **Example Configuration Extraction** - Working examples from existing codebase

**File Pattern:**
```
.kiro/specs/[plan-name]/
├── investigation-guide.md     # Structured file and function discovery
├── code-references.js         # Extracted snippets for comparison
├── discovery-checklist.md     # Comprehensive investigation steps
└── integration-points.md      # System connection analysis
```

### Code Reference Generation
**Purpose:** Pre-extract relevant code for comparison and understanding

**Extraction Types:**
- **Current Implementation** - Existing code that needs modification
- **Target Architecture** - How it should work after changes
- **Integration Examples** - Working patterns from similar systems
- **Configuration Samples** - Real data structures and formats

**Format Example:**
```javascript
// .kiro/specs/[plan]/code-references.js

// Current parent key logic from genDirectives.js (line 260)
const currentParentKeyLogic = `
if (fieldName === viewKeys.parentKey) return { parentKey: true, sys: true, type: 'number' };
`;

// DirectiveMap parent key support (lines 76-79, 199-203)
const directiveMapSupport = `
"parentKey": {
    transform: () => true,
    description: "Parent reference field"
}
`;
```

### Investigation Templates
**Purpose:** Ensure comprehensive analysis and prevent missing critical integration points

**Template Structure:**
```markdown
# Investigation Template - [Feature Name]

## Current State Analysis
- [ ] How is [functionality] currently implemented?
- [ ] What are the integration points?
- [ ] Are there existing patterns to follow?

## File Analysis Checklist
- [ ] [key-file-1]: Does it support [feature]?
- [ ] [key-file-2]: How does it handle [aspect]?
- [ ] [config-files]: What patterns exist?

## Integration Assessment
- [ ] Compatibility requirements
- [ ] Breaking change risks
- [ ] Testing strategy needs
```

### Progress Tracking Patterns
**Purpose:** Maintain shared investigation state between AI agents

**Shared Investigation Log:**
```markdown
# Investigation Progress - Plan [NNNN]
**Status:** [In Progress/Complete/Blocked]

## Discoveries
- ✅ Found existing system: [description]
- ✅ Identified integration point: [location]
- 🔍 Currently investigating: [current focus]
- ❌ Issue discovered: [problem description]

## Questions for Architectural Review
- [ ] Should we use existing system or create new?
- [ ] Integration approach: minimal vs comprehensive?
- [ ] Testing strategy for [specific area]?
```

---

## 📁 File Organization Standards

### .kiro/specs/[plan]/ Structure
```
.kiro/specs/[plan-name]/
├── requirements.md            # User requirements (Kiro creates)
├── design.md                 # Technical design (Kiro creates)  
├── tasks.md                  # Implementation tasks (Kiro creates)
├── investigation-guide.md    # File discovery guide (Claude creates)
├── code-references.js        # Code snippets (Claude creates)
├── discovery-checklist.md    # Investigation template (Claude creates)
├── integration-points.md     # System connections (Claude creates)
└── progress-log.md          # Shared investigation state (Both update)
```

### Reference File Naming Conventions
- **investigation-guide.md** - Primary file/function discovery
- **code-references.js** - Extracted code snippets with context
- **discovery-checklist.md** - Structured investigation steps
- **integration-points.md** - System connection analysis
- **progress-log.md** - Shared state tracking

### Investigation Artifact Patterns
**Consistency Rules:**
- All code snippets include **file path and line numbers**
- Integration points specify **API contracts and data flow**
- Progress logs use **standardized status indicators** (✅ 🔍 ❌)
- File references include **purpose and context**

---

## 🤝 Communication Enhancement

### Architectural Discovery Workflows
**When Claude Discovers System Integration Opportunities:**

1. **Create Investigation Support Files** in `.kiro/specs/[plan]/`
2. **Communicate via Coordination System** (not ad-hoc)
3. **Provide Architectural Guidance** through formal communication files
4. **Update Progress Logs** with discovery findings

### Implementation Support Protocols
**Claude's Enhanced Support Role:**

**Pre-Implementation:**
- Generate investigation guides and code references
- Identify integration patterns and compatibility requirements
- Create structured discovery checklists
- Extract relevant configuration examples

**During Implementation:**
- Update shared progress logs based on Kiro's findings
- Respond to architectural questions through coordination system
- Provide additional code references as needed
- Monitor for scope changes requiring architectural review

**Post-Implementation:**
- Review integration results for architectural soundness
- Document successful patterns for future reuse
- Update methodology based on collaboration learnings

### Knowledge Transfer Patterns
**Systematic Learning Capture:**

**After Each Plan:**
- **Successful Patterns** - What investigation approaches worked well?
- **Integration Discoveries** - New system connections found?
- **Process Improvements** - How can support be enhanced?
- **Reusable Templates** - What can be standardized for future use?

**Knowledge Preservation:**
- Update methodology document with proven enhancements
- Create pattern libraries for common integration scenarios
- Maintain reference guides for frequently used systems
- Document architectural decision rationales

---

## 🚀 Implementation Guidelines

### For Claude (Investigation Support)
1. **Always create investigation support files** for plans involving system integration
2. **Extract relevant code snippets** with full context and line numbers
3. **Identify integration points** and potential architectural conflicts
4. **Maintain shared progress logs** throughout implementation
5. **Communicate discoveries** through formal coordination system

### For Kiro (Implementation Enhancement)
1. **Review investigation guides** before beginning implementation
2. **Update progress logs** with findings and issues discovered
3. **Request additional support** through coordination system when needed
4. **Document successful patterns** for future methodology improvements

### For User (Process Coordination)
1. **Expect investigation support files** for complex integration tasks
2. **Review architectural discoveries** through coordination communications
3. **Approve scope changes** when architectural improvements are identified
4. **Provide guidance** on investigation priorities and implementation approaches

---

## 📊 Success Metrics

### Investigation Efficiency
- **Time to Implementation Start** - Reduction in discovery/setup time
- **Integration Issues Found** - Early identification vs discovery during implementation  
- **Architectural Conflicts Prevented** - Issues caught before implementation begins

### Collaboration Quality
- **Communication Clarity** - Reduced back-and-forth for clarification
- **Scope Change Management** - Proactive identification and handling
- **Knowledge Transfer Effectiveness** - Successful pattern reuse between plans

### Process Evolution
- **Methodology Updates** - Continuous improvement based on experience
- **Pattern Library Growth** - Reusable investigation templates and approaches
- **Tool Enhancement** - Better coordination and support mechanisms

---

## 🔄 Continuous Improvement

This methodology will evolve based on:
- **Real collaboration experiences** between Claude and Kiro
- **User feedback** on process effectiveness and efficiency
- **Technical discoveries** that improve investigation and integration approaches
- **New collaboration patterns** that emerge from complex multi-plan coordination

**Next Review:** After Plan 0013 completion - assess investigation support effectiveness and identify enhancements.

---

**Process Innovation Status:** Active Development  
**Collaboration Framework:** Aligned with AI/collaboration-rules.md  
**Implementation:** Starting with Plan 0013 as pilot program