# Plan Management Guidelines for Claude

## Plan Creation Rules

### Before Creating New Plans
- [ ] **Scan impact lists**: Search existing `a-pending/` plans for file/module overlap
- [ ] **Check package conflicts**: Multiple plans affecting same package areas
- [ ] **Identify relationships**: Dependencies, enhancements, or subset of existing work
- [ ] **Scope assessment**: Can this be merged into existing plan or needs separate tracking?

### Overlap Detection Process
1. **Grep existing plans** for specific file paths and package names
2. **Check structured impact lists** for shared modules/components
3. **Look for pattern overlap** - similar changes across plans
4. **Identify dependency chains** - plans that build on each other

### When to Create vs Merge
- **Create new plan** if:
  - Addresses completely different business domain
  - Can be implemented independently 
  - Has distinct deliverables and success criteria
  - Minimal file overlap with existing plans

- **Merge into existing plan** if:
  - >3 overlapping files/modules with existing plan
  - Natural extension of current scope
  - Blocking dependency for existing work
  - Same complexity/timeline as existing plan

### When to Archive Plans
- Move to `c-archived/` if:
  - Requirements changed significantly (mark as obsolete)
  - Plan superseded by newer approach
  - No longer relevant to current architecture
  - Completed plans older than 6 months (for cleanup)

### BackBurner Ideas Management
- **Within existing plans**: Add `#### 💡 BackBurner Ideas` section for related future concepts
- **Separate BackBurner plans**: Create full plans prefixed with `[BACKBURNER]` in filename
- **BackBurner criteria**: 
  - Good ideas but not urgent
  - Dependent on other major work completing first
  - Nice-to-have enhancements vs core functionality
  - Ideas that need more research/definition

**BackBurner Plan Format:**
```markdown
# [BACKBURNER] Plan Name

## Why BackBurner
- [Reason this isn't urgent/ready]
- [Dependencies that need to complete first]
- [Research needed before implementation]

## Future Value
- [Benefits when implemented]
- [Estimated complexity/effort]
- [Priority relative to other BackBurner items]
```

## Required Plan Sections

### Streamlined Impact Tracking (MANDATORY)
Every plan must include this format:

```markdown
## Implementation Impact Analysis

### Impact Summary
- **Files**: 15 (see impact-tracking.json: plan_id="2025-07-15-example")
- **Complexity**: High|Medium|Low
- **Packages**: apps/wf-client (8), packages/devtools (4), sql/views (3)
- **Blast Radius**: MAPPING (low), DEVTOOLS (medium), EVENTS (high)

### Impact Tracking Status
- **Predicted**: 12 files
- **Actual**: 15 files (+3 discovered)
- **Accuracy**: 80%
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`
```

**JSON Structure Replaces Verbose Markdown:**
- Detailed file tracking moved to `/claude-plans/impact-tracking.json`
- Plans reference JSON by plan_id for token efficiency
- Status updates happen in JSON, not markdown
- Cluster classification provides risk assessment at a glance

**Legend:** 
- 📋 ANALYZED - Originally anticipated during analysis
- 🔍 DISCOVERED - Found during implementation
- ✅ Completed • 🔄 In Progress • ⏳ Pending

### Dependency Tracking
Always include:
```markdown
### Plan Dependencies
- **Blocks**: [List plans that can't proceed until this is done]
- **Blocked by**: [List plans that must complete first]  
- **Related**: [List plans with overlapping scope - reference shared files]
- **File Conflicts**: [Specific files being modified by multiple plans]
```

## Overlap Detection Patterns

### Common Overlap Areas
- **Navigation/Routing**: `Sidebar.jsx`, routing configs, navigation components
- **DevTools**: `genPageMaps.js`, `events.json`, directive generators
- **Shared Components**: `shared-imports/src/` utilities, layouts, widgets
- **Database**: SQL views, `fieldMappings`, directive files

### Red Flags for Overlap
- Same specific file paths in impact lists
- Same package showing multiple "In Progress" items
- Shared dependency requirements
- Similar descriptions for different plans

### Overlap Resolution
When overlap detected:
1. **Document the conflict**: "This plan overlaps with [Plan Name] in [specific files]"
2. **Assess priority**: Which plan should proceed first?
3. **Coordinate or merge**: Can plans be sequenced or combined?
4. **Update dependencies**: Mark blocking relationships

## Plan Lifecycle Management

### Active Plan Limits
- **Maximum 3-4 active plans** in `a-pending/` at any time
- **Focus rule**: Complete high-complexity plans before starting new ones
- **Coordination rule**: Limit plans affecting same package simultaneously

### Progress Tracking During Implementation
- **Update status**: Move items between ✅🔄⏳ sections
- **Add discoveries**: New files/modules found during work
- **Update totals**: Keep completion counts current
- **Note blockers**: Issues preventing progress

### Completion Criteria
Move to `b-completed/` only when:
- All items marked ✅ Completed
- No pending discoveries that need addressing
- Plan objectives fully achieved
- **User testing completed** and feedback incorporated

## Impact List Maintenance

### During Implementation
```markdown
# When starting work on a file:
- [ ] **package**/file.ext [PLANNED] → - [🔄] **package**/file.ext [PLANNED]

# When completing work:
- [🔄] **package**/file.ext [PLANNED] → - [x] **package**/file.ext [PLANNED]

# When discovering new work:
Add: - [ ] **package**/new-file.ext [DISCOVERED] - Description
```

### Token Optimization Strategies

**For High-Token Impact Lists:**
- **Abbreviated Format**: Use minimal descriptions, focus on file paths + status
- **Reference Links**: Point to detailed analysis docs rather than inline descriptions
- **Graduated Detail**: Light tracking for simple plans, full tracking for complex multi-package plans
- **Compression After Completion**: When plans move to b-completed/, summarize verbose tracking into concise historical reference
- **JSON Impact Tracking**: Use unified `impact-tracking.json` for detailed file tracking, reference from plans

**Benefits vs Costs:**
- **Upfront Cost**: 50-100 tokens per file entry in impact analysis
- **Long-term Savings**: Prevents re-investigation, overlap detection, scope creep, context switching overhead
- **ADHD-Friendly**: Systematic development memory reduces mental load across sessions

## Impact Tracking JSON Structure

**Primary File**: `/claude-plans/impact-tracking.json`
- **Unified tracking**: All plan impacts in single queryable file
- **Append workflow**: Add new impacts to bottom as discovered
- **Date tracking**: `created` and `completed` fields (yyyy-mm-dd format)
- **Cluster classification**: Functional grouping for blast radius assessment

### Impact Cluster Categories (Change Blast Radius)

**🚨 High Blast Radius (Tread Carefully!):**
- **EVENTS**: Cross-app functionality - could break multiple apps if changed
- **API**: Server endpoints - affects all clients consuming them  
- **SHARED**: Shared-imports components - used across entire monorepo

**⚠️ Medium Blast Radius:**
- **DEVTOOLS**: Generation tools - affects generated files across packages
- **AUTH**: Authentication - impacts all protected routes
- **NAVIGATION**: Routing/sidebar - affects user flow across app

**✅ Low Blast Radius (Safer Changes):**
- **MAPPING**: Batch mapping specific functionality
- **CRUD**: Standard list/form operations for specific entities
- **RECIPES**: Recipe-specific workflow components

**ADHD-Friendly Benefits:**
- **Quick Risk Assessment**: Instantly see if changes affect critical shared systems
- **Planning Coordination**: Identify plans that need sequencing due to shared clusters
- **Context Switching**: Know which work is isolated vs requires extra caution

### Discovery Tracking
- **Mark discoveries clearly**: Use [DISCOVERED] tag
- **Update totals**: Adjust predicted vs actual counts
- **Note impact**: High number of discoveries = poor initial analysis
- **Learn**: Use patterns to improve future impact predictions

### Cross-Plan Updates
When plan affects file mentioned in other plans:
1. **Update both plans**: Note the shared file status
2. **Coordinate timing**: Ensure changes don't conflict
3. **Document handoffs**: Which plan owns which changes

## Communication Guidelines

### When Discovering Overlap
- **Explicit callout**: "This overlaps with [Plan Name] in [specific files]"
- **Suggest resolution**: "Consider merging because..." or "Sequence as..."
- **Reference impact lists**: "Both plans show X file in progress"

### When Finding Discoveries
- **Update impact list immediately**: Add [DISCOVERED] items
- **Assess scope impact**: Does this change plan complexity?
- **Check for new overlaps**: Does discovered work conflict with other plans?

### Plan Status Communication
- **Progress updates**: Update impact list status regularly
- **Completion markers**: Clear ✅ when work truly complete
- **Handoff notes**: Document completed work that enables other plans

## Plan Review Process

### Before Starting Implementation
1. **Review all impact lists** in active plans
2. **Check for file conflicts** across plans
3. **Sequence conflicting work** to avoid collisions
4. **Update dependencies** based on current status

### During Implementation
1. **Maintain impact lists** with current status
2. **Add discoveries** as they're found
3. **Coordinate conflicts** with other active plans
4. **Update accuracy metrics** for learning

### Periodic Review (every 2-3 plans)
1. **Scan for mergeable plans** with similar remaining work
2. **Archive completed work** that's ready
3. **Update dependency relationships** as plans evolve
4. **Analyze discovery patterns** to improve future planning

## File Naming & Organization

### Current Structure (Keep Simple)
```
claude-plans/
├── a-pending/           # Active and future work
├── b-completed/         # Successfully implemented
├── c-archived/          # Obsolete or old plans
└── impact-tracking.json # Unified impact tracking
```

### File Naming Convention
- **Format**: `CLUSTER - Descriptive Name.md`
- **Cluster-First Grouping**: Plans sort by functional area, not chronology
- **Blast Radius Visible**: High-risk clusters (EVENTS, SHARED, API) grouped together
- **ADHD-Friendly**: Related functionality clustered for easy scanning

**Example Naming:**
```
API - Universal DML Processor.md
DEVTOOLS - Phase 4 Cleanup.md
DEVTOOLS - TurboRepo Hot Reload Fix.md
EVENTS - EventTypes Enhancement.md
MAPPING - Batch Mapping.md
MAPPING - Batch Mapping SQL Views.md
NAVIGATION - Hierarchical Navigation Actions.md
RECIPES - Recipe Page Implementation.md
SHARED - Select Widget Parameters.md
```

**Benefits:**
- **Logical Grouping**: Related plans appear together in directory listings
- **Risk Assessment**: High blast radius plans (EVENTS, SHARED, API) immediately visible
- **Overlap Detection**: Conflicts more obvious when functionality is grouped
- **Date Tracking**: Creation dates preserved in JSON `created` field

### Migration Guidelines  
- **Manual movement**: User controls plan lifecycle
- **Status indicators**: Use impact lists to show readiness
- **Coordination**: Check for dependencies before moving plans
- **Renaming**: Existing plans can be renamed to cluster format as needed