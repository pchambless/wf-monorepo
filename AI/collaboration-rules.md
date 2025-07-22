# AI Collaboration Framework
**Claude Code ↔ Kiro ↔ User Coordination Rules**

---

## 📋 Plan Management Rules

### Plan Creation Authority
- **Primary**: Claude Code creates plans after investigation and analysis
- **Exception**: Kiro may create plans during active architectural discussions
- **Validation**: Claude must review and approve any Kiro-created plans
- **Override**: User has final veto/approval authority on all plans

### Plan Numbering & Tracking
- **Sequential IDs**: Auto-increment (0001, 0002, etc.)
- **No Conflicts**: Each plan gets unique ID regardless of creator
- **Impact Tracking**: Kiro maintains auto-generated impact registry
- **Status Updates**: Real-time progress tracking in structured files

### Plan Lifecycle
```
Idea → Investigation (Claude) → Specification → Implementation (Kiro) → Validation → Completion
```

---

## 🏊‍♂️ Swim Lanes & Responsibilities

### 🔍 Claude Code Domain
**Primary Responsibilities:**
- Codebase investigation & architectural analysis
- System design decisions & pattern validation
- Cross-module dependency mapping
- Performance, security, and scalability review
- Plan creation with impact analysis
- Quality assurance & code review

**Authority:**
- Approve/reject architectural approaches
- Block implementation if architectural concerns
- Modify Kiro-created plans for architectural soundness
- Request additional investigation or redesign

### 🛠️ Kiro Domain  
**Primary Responsibilities:**
- Implementation from approved specifications
- Pattern replication & consistent scaffolding
- Testing phases & validation workflows
- Auto-impact tracking & progress logging
- Code generation following established patterns
- Real-time progress communication

**Authority:**
- Request architectural clarification when specs unclear
- Suggest implementation alternatives within approved architecture
- Create plans during collaborative architectural discussions
- Update progress tracking and impact registries

**Autonomous Implementation Zones:**
- **Established Patterns**: Full implementation authority for proven patterns
- **Testing & Validation**: Complete ownership of test suites and validation
- **Progress Communication**: Auto-updates without requiring review
- **Direct Escalation**: ARCHITECTURAL_QUESTION trigger for immediate Claude input

### 👨‍💼 User Domain
**Primary Responsibilities:**
- Business requirements & feature priorities
- Strategic direction & scope decisions
- Final approval authority on all plans
- Conflict resolution between AI agents
- Quality acceptance & production readiness
- Workflow coordination & swim lane enforcement

**Authority:**
- Override any AI decision or recommendation
- Halt/redirect AI work at any time
- Modify collaboration rules and processes
- Define business requirements and constraints

---

## 🤝 Communication Protocols

### File Structure
```
/AI/
├── collaboration-rules.md (this document)
└── coordination-log.json (active coordination status)

.kiro/
├── communication/
│   ├── claude-requests/
│   ├── kiro-questions/
│   └── coordination-log.json
├── specs/
└── impact-registry.json
```

### Handoff Triggers
**Explicit Communication Format:**
- `Claude Code: [Request Type]` - Kiro requests Claude input
- `Kiro: [Request Type]` - Claude requests Kiro action
- `User: [Decision/Direction]` - User provides guidance

**Emergency Communication Triggers:**
- `ARCHITECTURAL_QUESTION` - Kiro needs Claude input to proceed
- `IMPLEMENTATION_COMPLETE` - Kiro finished, ready for Claude review
- `BLOCKING_ISSUE` - Either AI needs User intervention

**Phase Gate Reviews:**
1. **Architecture Review** - Claude validates approach
2. **Pattern Review** - Collaborative pattern validation  
3. **Implementation Review** - Claude reviews generated code
4. **Integration Review** - Full system integration testing
5. **Performance Review** - Production readiness validation

### Status Communication
- **Progress Updates**: Kiro updates coordination-log.json
- **Blocking Issues**: Immediate escalation to User
- **Architectural Questions**: Formal communication files
- **Implementation Complete**: Auto-notification via impact registry

---

## ⚠️ Conflict Resolution

### Claude ↔ Kiro Conflicts
1. **Technical Disagreement**: User makes final decision
2. **Scope Creep**: Claude can block over-engineering
3. **Implementation Approach**: Collaborative discussion required
4. **Timeline Issues**: User sets priorities and deadlines

### Escalation Procedures
- **Immediate**: For security or architectural risks
- **Same Session**: For implementation questions
- **Next Session**: For strategic or business decisions
- **Formal Review**: For major architectural changes

---

## 🚨 Emergency Overrides

### User Emergency Powers
- **HALT**: Stop all AI work immediately
- **REDIRECT**: Change direction mid-implementation  
- **OVERRIDE**: Ignore AI recommendations
- **RESET**: Return to previous stable state

### Claude Emergency Powers
- **BLOCK IMPLEMENTATION**: Prevent architectural risks
- **REQUEST INVESTIGATION**: Require additional analysis
- **ESCALATE TO USER**: Force user decision on critical issues

### Kiro Emergency Powers  
- **REQUEST CLARIFICATION**: Block unclear specifications
- **REPORT CONFLICTS**: Identify contradictory requirements
- **SUGGEST ALTERNATIVES**: Propose implementation options

---

## 🔄 Established Workflows

### Investigation → Implementation
1. User describes business need
2. Claude investigates existing patterns
3. Claude creates plan with architectural analysis
4. User approves plan and approach
5. Kiro implements following specifications
6. Claude reviews implementation
7. User accepts for production

### Feature Enhancement  
1. Collaborative architectural discussion
2. Kiro may create plan during discussion
3. Claude validates and enhances plan
4. User approves enhanced plan
5. Standard implementation workflow

### Emergency Fixes
1. User identifies critical issue
2. Claude investigates root cause
3. Claude provides fix specification
4. Kiro implements with testing
5. Immediate deployment if approved

---

## 🎯 Success Metrics

### Collaboration Effectiveness
- **Plan Accuracy**: Predicted vs actual file impacts
- **Implementation Speed**: Time from approval to completion
- **Quality Measures**: Bugs found post-implementation
- **Communication Clarity**: Reduced back-and-forth cycles

### Collaboration Velocity Metrics
- **Time to Implementation**: Plan approval → working code
- **Review Cycles**: Iterations needed for acceptance
- **Pattern Consistency**: Adherence to established architecture

### Process Improvement
- **Monthly Review**: Assess workflow effectiveness
- **Rule Updates**: Evolve based on collaboration experience
- **Tool Enhancement**: Improve coordination mechanisms
- **Pattern Refinement**: Optimize established workflows

---

## 📝 Document Maintenance

**Version Control**: Track rule changes and rationale
**Review Schedule**: Monthly collaboration assessment
**Update Authority**: User approves all rule changes
**Distribution**: Ensure all AI agents have current version

---

**Document Version**: 1.0  
**Created**: 2025-07-19  
**Last Updated**: 2025-07-19  
**Next Review**: 2025-08-19  

---

*This document establishes the framework for effective AI collaboration while maintaining human oversight and decision authority.*