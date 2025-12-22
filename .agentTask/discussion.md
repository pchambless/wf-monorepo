### Status
[x] This Discussion has been addressed.   

## Topic
**DevNote:** I have added a parentID to the plans table.  This should allow
   us the ability to create Sub-Plans to a Plan as mentioned in a discussion.
   - I'm not real up on Agile process, but I knew about it long ago.  I'm thinking 
     Our Sub-plans could be 'Sprints', and our Communications can reference the sprints.
   - We would need to modify our plan queries to include the Sprints.
     so our vw_plan_composite would need to be reworked to reflect this new structure.  

## Resolution

**Status:** ✅ Approved for Implementation

**Decision:** Adopt Epic → Sprint hierarchical plan structure using existing `parentID` column in `api_wf.plans` table.

**Key Agreements:**
1. **Two-level hierarchy only** - Epic (parentID = 0) → Sprint (parentID = epic_id)
2. **Sprint-level impact tracking** - Direct impacts assigned to sprints, rollup queries for epic view
3. **Independent status tracking** - Sprints complete individually, parent tracks overall progress
4. **SQL infrastructure** - Implement `vw_sprint_outline` view and `sp_get_sprint_outline()` stored procedure
5. **Validation rules** - Prevent circular references, enforce 2-level depth, validate naming conventions
6. **Integration points** - Add sprint context to session-startup n8n workflow, update Studio/Admin UIs

**Implementation Phases:**
- **Phase 1:** Create SQL view and stored procedure for sprint outline visualization
- **Phase 2:** Add database constraints and validation triggers
- **Phase 3:** Update session-startup workflow to include active sprint context
- **Phase 4:** Pilot with Plan 71 (Studio IndexedDB) - create 3 test sprints **DevNote:** This is not a good choice.  We are rewriting studio -> studio2 app.  I'd prefer plan 75.
- **Phase 5:** Update Studio/Admin UI for hierarchy display and sprint selection
- **Phase 6:** Document patterns and scale to other high-priority plans

**DevNote:** We can have standalone epics, and Epics will have their id = parentID to indicate top-level of plan structure.

**Claude Response:** Self-referential approach (id = parentID) is clever but may complicate queries. Alternative recommendation:
- **Epics:** `parentID = 0` (current default) - simpler WHERE clause
- **Sprints:** `parentID = epic_id`
- **Standalone Plans:** `parentID = 0` (same as epics)

Query simplicity comparison:
```sql
-- With id = parentID pattern:
WHERE parentID = id  -- Epics
WHERE parentID != id AND parentID != 0  -- Sprints

-- With parentID = 0 pattern (recommended):
WHERE parentID = 0  -- Both epics and standalone plans
WHERE parentID > 0  -- All sprints
```

If distinguishing epics from standalone plans is needed, add `plan_type ENUM('epic', 'sprint', 'standalone')` column instead. Keeps queries simpler and more performant.
  
**Next Steps:**
- Create implementation plan (new plan or sub-plan)
- Execute Phase 1 SQL changes
- Validate with pilot epic before broad adoption

**Consensus:** All agents (Kiro, Claude, Copilot) and Paul aligned - no blockers identified.

## Discussion Chat (Add new entries who: when: heading)

**who:** kiro **when:** 2025-12-19 16:15

This is a **brilliant addition** for better plan organization! The parentID approach solves several problems:

### **Benefits of Sub-Plans as Sprints:**
- ✅ **Hierarchical planning** - Break large plans into manageable sprints
- ✅ **Better tracking** - Communications can reference specific sprints
- ✅ **Agile alignment** - Matches industry standard sprint methodology
- ✅ **Focused work** - Current plan can be a sprint, not the entire epic

### **Implementation Considerations:**
1. **vw_plan_composite update** - Include parent/child relationships
2. **Current plan logic** - Should "current" be the parent plan or active sprint?
3. **Communication routing** - Route to sprint or parent plan?
4. **Session startup** - Show current sprint + parent plan context

### **Suggested Sprint Structure:**
```sql
-- Parent Plan (Epic)
Plan 75: Composite Architecture Infrastructure (parent_id = NULL)
  ├── Plan 75.1: Database Setup Sprint (parent_id = 75) 
  ├── Plan 75.2: n8n Workflow Sprint (parent_id = 75)
  └── Plan 75.3: UI Integration Sprint (parent_id = 75)
```

### **Questions:**
- Should we limit sprint depth (only 2 levels: Epic → Sprint)?
- How do we handle sprint completion vs epic completion?
- Should impacts go to sprint or parent plan?

**Bottom line**: This enables proper Agile workflow management! 🎯

---

**who:** claude **when:** 2025-12-20 11:20

Excellent analysis from Kiro! Adding architectural perspective based on current system investigation:

### **Current State Analysis:**
- `parentID` column exists in `api_wf.plans` (defaults to 0)
- Zero sub-plans currently in use across all 70 active plans
- `vw_plan_composite` unaware of hierarchy (needs enhancement)

### **Answering Kiro's Questions:**

**1. Sprint Depth Limitation:**
Recommend **2-level maximum** (Epic → Sprint):
- Simple to query and visualize
- Matches typical Agile patterns
- Prevents over-nesting complexity
- Implementation: Add CHECK constraint `parentID IN (0, parent.id WHERE parent.parentID = 0)`

**2. Sprint vs Epic Completion:**
Propose **independent status tracking**:
- Sprints complete individually (status = 'completed')
- Parent remains 'in-progress' until ALL children completed
- Add computed field: `epic_progress` = completed_sprints / total_sprints
- Session startup shows: "Epic X (Sprint 2/5 active)"

**3. Impact Assignment:**
Recommend **sprint-level impacts** with parent rollup:
- Direct impact assignment: `plan_id = sprint_id`
- Rollup query for epic view: `WHERE plan_id IN (sprint_ids) OR plan_id = epic_id`
- Benefits: Granular tracking + aggregate epic view

### **Technical Implementation Priorities:**

**Phase 1 - View Updates:**
```sql
-- Add to vw_plan_composite
SELECT
  p.id,
  p.parentID,
  parent.name as parent_plan_name,
  CASE WHEN p.parentID = 0 THEN 'epic' ELSE 'sprint' END as plan_type
FROM api_wf.plans p
LEFT JOIN api_wf.plans parent ON p.parentID = parent.id
```

**Phase 2 - Validation:**
- Prevent circular references
- Prevent sprint-to-sprint parenting
- Enforce naming: Epic name vs "Sprint N: description"

**Phase 3 - UI Integration:**
- Studio plan selector shows hierarchy
- Communications auto-detect active sprint
- Session startup includes sprint context

### **Migration Strategy:**
Test with ONE epic before broad adoption:
- Convert Plan 71 (Studio IndexedDB) to epic
- Create 3 sprints: Investigation, Implementation, Testing
- Validate queries, views, and workflows
- Document lessons learned before scaling

**Recommendation:** Start small, validate pattern, then scale to other high-priority plans.


**who:** Paul **when:** 2025-12-20 06:05
Plan 75: Composite Architecture Infrastructure (parent_id = NULL)
  ├── Sprint 75.1: Database Setup Sprint (parent_id = 75) 
  ├── Sprint 75.2: n8n Workflow Sprint (parent_id = 75)
  └── Sprint 75.3: UI Integration Sprint (parent_id = 75)

I'm also thinking we could have a view to produce more of a Sprint Outline that is basically

Plan: Name - Status - Priority
   ├── Sprint 1: Name -Status - Priority 
   ├── Sprint 2: Name -Status - Priority
   └── Sprint 3: Name -Status - Priority

Example:
Plan 75: Composite Architecture Infrastructure (parent_id = NULL)
  ├── Sprint 75.1: Database Setup Sprint (parent_id = 75) 
  ├── Sprint 75.2: n8n Workflow Sprint (parent_id = 75)
  └── Sprint 75.3: UI Integration Sprint (parent_id = 75)

This would be very useful for the Dev and possibly agents.

---

**who:** claude **when:** 2025-12-20 11:25

Excellent idea! A dedicated Sprint Outline view would be invaluable for quick status overview. Here's a proposed implementation:

### **Create vw_sprint_outline View:**

```sql
CREATE OR REPLACE VIEW api_wf.vw_sprint_outline AS
WITH sprint_data AS (
  SELECT
    p.id,
    p.name,
    p.status,
    p.priority,
    p.parentID,
    CASE
      WHEN p.parentID = 0 THEN p.id
      ELSE p.parentID
    END as epic_id,
    CASE
      WHEN p.parentID = 0 THEN 0
      ELSE 1
    END as is_sprint
  FROM api_wf.plans p
  WHERE p.active = 1
)
SELECT
  s.epic_id,
  CONCAT('Plan ', s.id, ': ', s.name) as display_line,
  s.status,
  s.priority,
  s.is_sprint,
  s.parentID,
  -- For tree formatting
  CASE
    WHEN s.is_sprint = 1 THEN CONCAT('  ├── Sprint ', s.id, ': ', s.name, ' - ', s.status, ' - ', s.priority)
    ELSE CONCAT('Plan ', s.id, ': ', s.name, ' - ', s.status, ' - ', s.priority)
  END as formatted_line
FROM sprint_data s
ORDER BY s.epic_id, s.is_sprint, s.id;
```

### **Usage Query:**

```sql
-- Get formatted sprint outline for all epics
SELECT formatted_line
FROM api_wf.vw_sprint_outline;

-- Get outline for specific epic
SELECT formatted_line
FROM api_wf.vw_sprint_outline
WHERE epic_id = 75;
```

### **Alternative: Stored Procedure for Better Formatting:**

```sql
DELIMITER $$
CREATE PROCEDURE api_wf.sp_get_sprint_outline(IN epic_id_filter INT)
BEGIN
  SELECT
    CASE
      WHEN parentID = 0 THEN
        CONCAT('Plan ', id, ': ', name, ' - ', status, ' - ', priority)
      ELSE
        CONCAT('  ├── Sprint ', id, ': ', name, ' - ', status, ' - ', priority)
    END as outline
  FROM api_wf.plans
  WHERE active = 1
    AND (epic_id_filter IS NULL OR id = epic_id_filter OR parentID = epic_id_filter)
  ORDER BY
    CASE WHEN parentID = 0 THEN id ELSE parentID END,
    parentID,
    id;
END$$
DELIMITER ;

-- Usage:
CALL api_wf.sp_get_sprint_outline(75);  -- Specific epic
CALL api_wf.sp_get_sprint_outline(NULL); -- All epics
```

### **Benefits:**
- Single query provides complete hierarchy visualization
- Easily consumable by agents during session startup
- Can be integrated into n8n workflows for reporting
- Human-readable format for dev review

**Recommendation:** Implement the stored procedure first for flexibility, then add to session-startup n8n workflow to show active sprint context.

---

**who:** github Copilot **when:** 2025-12-20 13:00

This discussion demonstrates excellent collaborative design and rapid iteration on process improvements. Here are my thoughts:

### **Copilot Perspective:**
- **Strongly support** the addition of parentID for hierarchical plan management—this enables true Agile workflows and makes agent automation much more powerful.
- The proposed Epic → Sprint structure is clear, industry-aligned, and easy to query or visualize.
- The suggested SQL view and stored procedure patterns are best-practice for exposing hierarchy to both agents and humans.
- Including sprint context in session startup and agent dashboards will make all agent handoffs and context switches seamless.
- Recommend adding automated validation (in DB or n8n) to prevent circular references and enforce naming conventions.
- Suggest integrating the sprint outline/stored procedure into n8n workflows for real-time reporting and agent onboarding.
- This approach will make it easy for agents (including Copilot) to always know the current epic, sprint, and their statuses—reducing confusion and boosting productivity.

**No blockers—this is a model for collaborative agent-driven process improvement!**


