## 📝 Plan Impacts Table - Core Action Types

### Core Action Types Only (to go into change_type column):

- CREATE - New files/features (i.e. Plan created (db-only), new module created.)
- MODIFY - Changes to existing files
- DELETE - Removals... Plan archived
- ANALYZE - Investigation work
- DISCOVER - Finding patterns/issues
- COMMUNICATE - Coordination/messaging
- PLAN - Planning activities

Note: Testing activities should be excluded from Impact tracking

### Let Description Handle Specifics:

- change_type: "MODIFY" + description: "Console cleanup - removed verbose form logging"
- change_type: "MODIFY" + description: "Build fix - added missing export path"
- change_type: "MODIFY" + description: "Bug fix - corrected navigation state handling"
- change_type: "MODIFY" + description: "Deprecation fix - updated MUI Grid v1→v2 syntax"

### - Phase definitions (idea, analysis, guidance, development, adhoc)

- phase: "idea" - Creation of a plan record in plans table: userID -> user 'firstName'
- phase: "analysis" - modules predicted in analysis: userID -> 'claude'
- phase: "guidance" - modules predicted in guidance: userID -> 'claude'
- phase: "development" - modules impacted in development: userID -> 'kiro', 'claude', 'user'
- phase: "adhoc" - modules impacted outside of defined plan: userID -> any agent.

## - Plan creation guidelines (when to create vs use Plan 0)

- Quickly identified and fixable: less than 4 predicted impacts - Plan = 0 for impacts.
- Idea discussed and/or 4 or more impacts: User creates a plan.

## Agent Role Definitions

- **Claude**: Analysis, guidance, architectural decisions
- **Kiro**: Implementation, testing, pattern replication
- **User**: Plan creation, scope decisions, requirement setting

## Communication Protocols

- Use `.kiro/communication/coordination-log.json` for agent handoffs
- Signal "Plan NNNN" for context switches
- Document analysis/guidance before implementation

## Document Structure Standards

- specs: `.kiro/{planId}/guidance/` - `requirements.md` - `design.md`

## Communications: Database-only via plan_communications table ✅

- Modal notifications for agent coordination -

### scenarios:

    #### claude creates guidance document:
    1. log to plan_communications table.  return id (to be included in modal message)
    2. popup modal notifying user with message for kiro
    3. user pastes message into kiro chat

    #### User identifies an issue.
    1. User enters the issue and description in PLAN COMMUNICATION tab
    2. log to plan_communications table.  return id (to be included in modal message)
    3. popup modal notifying user with message for impacting agent (kiro or claude)
    4. user pastes message into appropriate agent's chat.

    #### kiro completes implementation:
    1. kiro logs completion summary to plan_communications table (from_agent: 'kiro', to_agent: 'claude')
    2. popup modal notifying user with completion message for claude
    3. user pastes kiro's completion summary into claude chat
    4. claude reviews implementation and may provide feedback.

## Process Quality Metrics

- Analysis thoroughness: DISCOVERED/ANALYZED impacts per plan
- Process adherence: % plans with proper phase progression
- Implementation efficiency: CREATE/MODIFY ratio

## User Responsibilities:

- Quality control - Does the implementation meet requirements?
- Scope validation - Was everything delivered as expected?
- Acceptance decision - Ready to close the plan?
- Process oversight - Keep agents focused and coordinated

## PlanID Parameter Standards:

- **Always use contextStore for planID** - `contextStore.getParameter("planID")` is the single source of truth
- **SelPlan widget maintains planID** - When user selects a plan, it automatically updates contextStore
- **No manual planID prop passing** - Components should not receive planID as props, use contextStore instead
- **EventTypes use contextStore planID** - All execEvent calls should rely on contextStore.getParameter("planID")
- **Plan selection required** - User must select a plan before performing any plan-based operations (except Create New Plan)
- **Fallback behavior** - If no plan selected, components should prompt user to select a plan first
- **Import pattern**: `import contextStore from "@whatsfresh/shared-imports/stores/contextStore.js"`

## Implementation Standards:

- **Follow established component APIs** - Do not modify existing component interfaces
- **Study existing patterns** - Check working implementations before coding
- **Use existing eventTypes** - Leverage established database events (EventID 102, etc.)
- **Conform to pageMap structure** - CrudLayout requires systemConfig, tableConfig, formConfig
- **Test with real data** - Verify components work with actual database structures
- **No custom prop patterns** - Use existing component contracts, don't invent new ones
