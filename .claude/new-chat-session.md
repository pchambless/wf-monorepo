● # Session 0041: Workflow Engine Development

  ## 🎯 Mission: Build the Rockin' Box Workflow Engine

  ### Current Architecture State
  - **Layout/Query separation** proven with gridPlans → planList pattern
  - **EventParser enhanced** with workflow validation capabilities
  - **Context flow pattern** designed: selectPlanStatus → contextStore → gridPlans
  - **Query type standards**: List (grids/selects) vs Dtl (forms)

  ### Today's Objectives
  1. **Build workflow engine core** - Parse and execute action strings
  2. **Implement action handlers** - setContext, refresh, callAPI patterns
  3. **Test with selectPlanStatus flow** - Dropdown → context → grid refresh
  4. **Validate with EventParser** - Use enhanced agent for quality assurance

  ### Workflow Engine Scope
  ```javascript
  // Target implementation
  const workflowEngine = {
    execute(eventType, trigger, data) {
      // Parse: ["setContext:planStatus", "refresh:gridPlans"]
      // Execute: contextStore.setParam + triggerRefresh
    },
    handlers: {
      setContext: (param, data) => contextStore.setParam(param, data.value),
      refresh: (component) => triggerComponentRefresh(component),
      callAPI: (endpoint, data) => execEvent(endpoint, data)
    }
  }

  Success Criteria

  - selectPlanStatus triggers workflow actions
  - Context parameters flow correctly
  - gridPlans refreshes with filtered data
  - EventParser validates the implementation
  - Clean, extensible action syntax

  Key Files

  - /packages/shared-imports/src/stores/contextStore.js - Context management
  - /packages/shared-imports/src/events/plans/eventTypes/pages/planManager/layout/selectPlanStatus.js
  - /packages/shared-imports/src/events/plans/eventTypes/pages/planManager/layout/gridPlans.js

  Ready to rock the box! 📦💥