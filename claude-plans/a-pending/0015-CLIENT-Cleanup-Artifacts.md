# CLIENT - Cleanup Artifacts & Architectural Intelligence System

## User Idea
In order to Clone the structure of the Client to the Admin app, we need to first identify, then delete artifacts created in the abundance of strategy changes that came before our current strategy. This includes many config files and folders that no longer support the app.

**Evolution:** This plan now includes building an architectural intelligence system using madge dependency analysis to:
1. Identify dead code systematically across all apps (client/server/shared-imports)  
2. Create visual dependency mapping for AI agents and user understanding
3. Build temporary dashboard visualization until admin app is ready
4. Establish ongoing architectural intelligence backbone for Claude & Kiro

## Implementation Impact Analysis

### Impact Summary
- **Plan ID**: 0015
- **Files**: TBD (see impact-tracking.json: plan_id="0015")
- **Complexity**: TBD (High|Medium|Low)
- **Packages**: TBD (package names and file counts)
- **Blast Radius**: CLIENT (high)

### Impact Tracking Status
- **Predicted**: TBD files
- **Actual**: TBD files (+X discovered)
- **Accuracy**: TBD%
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`

### Plan Dependencies
- **Blocks**: [List plans that can't proceed until this is done]
- **Blocked by**: [List plans that must complete first]
- **Related**: [List plans with overlapping scope]
- **File Conflicts**: [Specific files being modified by multiple plans]

## Implementation Strategy

### Phase 1: Architectural Analysis (Claude - Analysis Doctor)
**Status: In Progress**
- ✅ Complete madge dependency analysis (client + server + shared-imports)
- 🔄 **CURRENT**: Create comprehensive architectural intelligence specification 
- ⏳ Design mermaid chart generation requirements
- ⏳ Coordinate handoff to Kiro for implementation

### Phase 2: System Implementation (Kiro - Implementation Surgeon)  
**Status: Pending Claude handoff**
- Build enhanced path-classes.js with madge-derived intelligence
- Create architectural analysis API functions
- Implement mermaid chart generators
- Build temporary dashboard visualization component

### Phase 3: Dead Code Cleanup (Systematic Removal)
**Status: Pending Phase 2**
- Priority 1: Safe immediate removals (test files, broken dependencies)
- Priority 2: Layout cleanup (redundant wrappers)  
- Priority 3: Generated page components (verify routing first)
- Priority 4: Asset file review (manual check for usage)

### Phase 4: Ongoing Intelligence (Repeatable Process)
**Status: Future**
- Automated madge analysis pipeline
- Regular architectural health reports
- Integration with admin app (when ready)
- AI agent architectural guidance system

## Architectural Intelligence Specification for Kiro

### 1. Enhanced path-classes.js Requirements
```javascript
// claude-plans/config/path-classes.js
export const getArchitecturalIntel = () => {
  return {
    // Core dependency analysis
    getCriticalNodes: () => [...],        // Files with most dependents
    getBlastRadius: (filePath) => {...},  // Impact assessment
    getDependents: (filePath) => [...],   // Who depends on this file
    getDeadCode: () => [...],             // Files safe to remove
    
    // Visual generation
    generateMermaidChart: () => "graph TD\n...",
    generateDependencyReport: () => {...},
    
    // AI-consumable intelligence  
    getInvestigationPaths: (cluster) => [...],
    getSafeModificationZones: () => [...],
    getCrossPackageDependencies: () => [...]
  }
}
```

### 2. Temporary Dashboard Component Requirements
```jsx
// apps/wf-client/src/components/architecture/ArchDashboard.jsx
// Temporary component until admin app ready
<ArchitecturalIntelligence 
  showDependencyGraph={true}      // Mermaid visualization
  showDeadCodeReport={true}       // Cleanup candidates
  showCriticalNodes={true}        // High-risk files
  showCrossPackageFlow={true}     // Client→Server→Shared flow
/>
```

### 3. Mermaid Chart Generation Requirements
- **Dependency flow charts**: Client → Shared-Imports → Server
- **Critical node highlighting**: Color-code by blast radius
- **Dead code identification**: Show orphaned files
- **Cluster visualization**: Group by functional area

## Next Steps

### Immediate (Claude Tasks)
1. ✅ **Complete architectural analysis** of madge-full.json
2. ✅ **Create detailed specification** for Kiro implementation (`.kiro/specs/0015/architectural-analysis.md`)
3. ✅ **Coordinate handoff** through .kiro/communication system
4. ⏳ **Update steering.yaml** to reference new intelligence system

### Implementation Phase (Kiro Tasks)  
1. **Build path-classes.js** enhanced system
2. **Create mermaid generators** from dependency data
3. **Build dashboard component** for temporary visualization
4. **Test and validate** architectural intelligence accuracy

### Cleanup Phase (Collaborative)
1. **Execute dead code removal** following Priority 1-4 sequence
2. **Validate architectural assumptions** post-cleanup
3. **Update admin app preparation** with architectural intelligence
4. **Establish ongoing intelligence pipeline**
