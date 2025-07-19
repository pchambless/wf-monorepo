# Plan Management Guidelines for Claude

## Claude chat startup rules.
<!-- sessionStartup: Plan NNNN -->
- When starting a new Claude session related to an existing plan, begin with:
Plan NNNN
- where NNNN is the numeric plan ID (e.g., 0008).
- This signals Claude to:
- Resume work on the corresponding plan file (e.g., 0008-MAPPING-Batch-Mapping.md)
- Reference associated impacts from impact-tracking.json
- Respect editing behavior and verbosity settings defined in the plan and registry
- Claude should avoid reprocessing previously analyzed content unless explicitly requested.


## Plan Creation Rules

### Before Creating New Plans
- [ ] **Query impact-tracking.json**: Search for file/module overlap across all plans
- [ ] **Check package conflicts**: Multiple plans affecting same package areas
- [ ] **Identify relationships**: Dependencies, enhancements, or subset of existing work
- [ ] **Scope assessment**: Can this be merged into existing plan or needs separate tracking?

### Overlap Detection Process
1. **Query impact-tracking.json** for file conflicts and shared modules
   ```bash
   # Find files affected by multiple plans
   jq '.impacts | group_by(.file) | map(select(length > 1))' impact-tracking.json
   
   # Check package conflicts
   jq '.impacts | group_by(.package) | map({package: .[0].package, plans: map(.plan_id) | unique})' impact-tracking.json
   ```
2. **Check cluster overlap** - multiple plans affecting same functional areas
3. **Analyze blast radius conflicts** - plans touching high-risk clusters (EVENTS, SHARED, API)
4. **Identify dependency chains** - plans that build on each other via JSON cross-references

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
- Same specific file paths in impact-tracking.json across multiple plans
- Same package showing multiple "in_progress" status items
- Shared dependency requirements
- Multiple plans with same cluster classification

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
- **Update JSON status**: Change status from "pending" → "in_progress" → "completed"
- **Add discoveries**: New impacts found during work (append to JSON)
- **Update completed dates**: Set "completed" field when work finishes
- **Note blockers**: Issues preventing progress (document in plan dependencies)

### Completion Criteria
Move to `b-completed/` only when:
- All JSON impacts have "completed" dates filled
- No pending discoveries that need addressing
- Plan objectives fully achieved
- **User testing completed** and feedback incorporated

## Impact List Maintenance

### During Implementation
```bash
# When starting work on a file:
# Update JSON: "status": "pending" → "status": "in_progress"

# When completing work:
# Update JSON: "status": "in_progress" → "status": "completed"
# Set: "completed": "yyyy-mm-dd"

# When discovering new work:
# Append new impact entry to JSON with "type": "DISCOVERED"
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
1. **Update JSON entries**: Coordinate status across shared files
2. **Coordinate timing**: Ensure changes don't conflict
3. **Document handoffs**: Which plan owns which changes (in plan dependencies)

## Communication Guidelines

### When Discovering Overlap
- **Explicit callout**: "This overlaps with [Plan Name] in [specific files]"
- **Suggest resolution**: "Consider merging because..." or "Sequence as..."
- **Reference JSON conflicts**: "Query shows X file affected by multiple plans"

### When Finding Discoveries
- **Update JSON immediately**: Add impact entry with "type": "DISCOVERED"
- **Assess scope impact**: Does this change plan complexity?
- **Check for new overlaps**: Query JSON to see if discovered work conflicts with other plans

### Plan Status Communication
- **Progress updates**: Update JSON status fields regularly
- **Completion markers**: Set "completed" date when work truly complete
- **Handoff notes**: Document completed work that enables other plans

## Plan Review Process

### Before Starting Implementation
1. **Query impact-tracking.json** for all active plan impacts
2. **Check for file conflicts** using JSON group_by queries
3. **Sequence conflicting work** to avoid collisions
4. **Update dependencies** based on current JSON status

### During Implementation
1. **Maintain JSON status** with current progress
2. **Add discoveries** as new JSON entries
3. **Coordinate conflicts** using JSON queries for shared files
4. **Update accuracy metrics** (predicted vs actual counts) for learning
## Editing Behavior
- Claude should consolidate all planned edits to a single module into one update block.
- Avoid issuing multiple passes across the same file for minor changes.
- Prefer atomic edit sweeps using the plan’s impact-tracking data.

## Token Conservation & Simple Changes
  - **Simple edits (1-2 lines)**: Prompt user to make the change rather than using Edit tool
  - **Multiple file updates**: Ask user to handle repetitive changes across similar files
  - **One-word changes**: Always suggest user makes these directly


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

Note: It is the user's responsibility to move plans between folders as they deem appropriate.  Plan locations in the different folders should not impact any analysis.  
```

### File Naming Convention
- **Format**: `[STATUS-]NNNN-CLUSTER-Descriptive-Name.md`
- **Sequential IDs**: Non-intelligent auto-increment (0001, 0002, etc.)
- **Status Prefixes**: Visual organization by completion status
- **Cluster Grouping**: Plans sort by functional area within status
- **ADHD-Friendly**: Clear visual separation of active vs completed work

**Active Plans (no prefix):**
```
0001-DEVTOOLS-Registry-System-Test.md
0002-API-Test-Auto-Increment.md
0005-MAPPING-Batch-Enhancement.md
```

**Completed Plans (DONE prefix):**
```
DONE-0003-DEVTOOLS-Claude-Plans-Management.md
DONE-0004-SHARED-Widget-Parameters.md
```

**Other Statuses:**
```
ARCHIVED-0010-API-Old-Endpoint.md
HOLD-0007-EVENTS-Future-Enhancement.md
```

**Benefits:**
- **Visual Status**: Instant identification of plan status in file listings
- **Logical Sorting**: Status prefixes sort after numeric active plans
- **Database Design**: Immutable IDs with flexible status management
- **Risk Assessment**: Cluster visible in filename for blast radius awareness

## CLI Tools for Plan Management

### Plan Creation
```bash
# Global alias setup (add to ~/.bashrc)
alias new-plan="cd /home/paul/wf-monorepo-new/claude-plans && node tools/create-plan.js"

# Usage from anywhere
new-plan DEVTOOLS "Feature Name"
new-plan SHARED "Component Enhancement" 
new-plan API "Endpoint Updates"
```

### Plan Completion
```bash
# Global alias setup (add to ~/.bashrc)  
alias complete-plan="cd /home/paul/wf-monorepo-new/claude-plans && node tools/complete-plan.js"

# Usage from anywhere
complete-plan 0003                # Mark as completed (default)
complete-plan 0005 archived       # Mark as archived
complete-plan 0007 on-hold        # Mark as on-hold
complete-plan 0003 active         # Reactivate (remove prefix)
```

### Workflow Integration
1. **Create**: `new-plan CLUSTER "Plan Name"` - generates ID, files, JSON entries
2. **Work**: Edit plan file, add impacts to impact-tracking.json
3. **Complete**: `complete-plan NNNN` - updates status, renames file, marks impacts complete
4. **Query**: Use jq commands for status analysis and reporting

### Benefits of CLI Approach
- **Token Efficiency**: User handles administrative tasks, Claude focuses on content
- **ADHD-Friendly**: One-command operations, visual file organization
- **Database Design**: Immutable IDs, referential integrity, normalized data
- **Self-Service**: No waiting for Claude to create/complete plans

### Migration Guidelines  
- **Status Management**: Use complete-plan tool for status transitions
- **File Organization**: Status prefixes provide visual sorting
- **Registry Sync**: Tools automatically maintain registry consistency
- **ID Preservation**: Plan IDs never change, only status/filename updates