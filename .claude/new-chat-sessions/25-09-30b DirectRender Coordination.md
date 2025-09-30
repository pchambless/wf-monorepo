WhatsFresh DirectRenderer & Database-Driven Architecture - Session Summary

  Major Accomplishments

  1. ✅ Enhanced Stored Procedure for Complete Data Assembly

  File: /apps/wf-studio/src/sql/database/api_wf/procedures/sp_hier_structure.sql

  - Eliminated N+1 queries - Single stored procedure call now returns everything
  - Added enhancedProps - Aggregated JSON from vw_eventProp table
  - Added workflowTriggers - Aggregated JSON from vw_eventTrigger table
  - Smart JSON formatting - Properly handles strings, numbers, booleans, arrays, objects
  - Uses database views - vw_eventProp and vw_eventTrigger for consistency

  Result: One database call replaces dozens of queries per page generation

  2. ✅ Simplified genPageConfig

  File: /apps/wf-server/server/utils/pageConfig/index.js

  - Removed propsRetriever.js dependency - Props now come from stored procedure
  - Removed triggersRetriever.js dependency - Triggers now come from stored procedure
  - workflowTriggers placement fixed - Now at component root, not nested in props
  - Form/Grid expansion working - Complex components expanded at generation time
  - Preview routes manifest - Auto-generates preview-routes.js for dynamic routing

  3. ✅ Preview/Production Routing Architecture

  Files:
  - /apps/wf-studio/src/config/preview-routes.js (auto-generated)
  - /apps/wf-studio/src/App.jsx (enhanced)

  Flow:
  genPageConfig generates page
    ↓
  Writes to /preview/{app}/{page}/
    ↓
  Updates preview-routes.js manifest
    ↓
  App.jsx dynamically loads preview routes
    ↓
  Test at /preview/{app}/{page}
    ↓
  Deploy button copies to /apps/{app}/{page}/ (future)

  Benefits:
  - Preview pages isolated from production
  - No manual route configuration needed
  - Easy testing before deployment
  - Clean transition from preview to production

  4. ✅ DirectRenderer Rendering Successfully

  File: /apps/wf-studio/src/rendering/DirectRenderer.jsx

  - Form fields rendering - Email/password fields display correctly
  - Button rendering - Login button with proper styling
  - Grid structure rendering - Table with headers generated
  - Non-DOM props filtered - Warnings eliminated (dataSource, rowKey, columns, selectable)
  - Debug logging added - Can trace component rendering

  5. ✅ Triggers Table Architecture Defined

  Database Table: api_wf.triggers

  Structure:
  trigType: "class" | "action"
  is_dom_event: boolean (replaces module_path)
  name: trigger/action name
  description: human-readable description

  Classes (is_dom_event: true):
  - onClick, onChange, onSubmit, onLoad

  Classes (is_dom_event: false):
  - onSuccess, onError, onRefresh

  Actions (is_dom_event: null):
  - setVals, userLogin, visible

  6. ✅ Build Cleanup

  - Moved Node.js scripts out of /src → /scripts
  - Removed problematic PlanManager page
  - Fixed empty pageConfig.json issue
  - Webpack compiles successfully (1 warning only)

  ---
  Current Issue - Triggers Not Executing

  Problem

  Login button renders but onClick handler doesn't fire when clicked.

  Root Cause

  DirectRenderer builds handlers for ALL trigger classes (onClick, onSuccess, onRefresh), but:
  1. Multiple classes map to same DOM event (onClick)
  2. Later handler overwrites earlier one
  3. Only DOM events should get React handlers
  4. Workflow callbacks (onSuccess, onError) should be handled by TriggerEngine after action completes

  Current State

  // DirectRenderer incorrectly treats all classes as DOM events
  workflowTriggers: {
    onClick: [{action: "userLogin"}],      // ✅ Should create handler
    onSuccess: [{action: "setVals"}],      // ❌ Overwrites onClick handler!
    onRefresh: [{action: "execEvent"}]     // ❌ Not a DOM event
  }

  ---
  Next Steps

  Immediate: Fix Trigger Execution

  Step 1: Load Trigger Metadata

  Options discussed:
  - ❌ Hardcode DOM event list (rejected - gets out of sync)
  - ✅ Recommended: Fetch triggers table at app startup
  - ⚪ Alternative: Include in stored procedure output

  Implementation (App.jsx):
  // On app startup, load trigger configuration
  const [triggerConfig, setTriggerConfig] = useState(null);

  useEffect(() => {
    fetch('/api/triggers')
      .then(r => r.json())
      .then(triggers => {
        const domEvents = triggers
          .filter(t => t.trigType === 'class' && t.is_dom_event)
          .map(t => t.name);
        setTriggerConfig({ domEvents });
      });
  }, []);

  Step 2: Update DirectRenderer

  File: /apps/wf-studio/src/rendering/DirectRenderer.jsx

  const buildEventHandlers = (workflowTriggers, domEvents) => {
    const handlers = {};
    Object.entries(workflowTriggers).forEach(([triggerClass, triggers]) => {
      // Only create handlers for DOM events
      if (!domEvents.includes(triggerClass)) {
        console.log(`⏭️ Skipping ${triggerClass} - workflow callback`);
        return;
      }

      handlers[triggerClass] = async (e) => {
        // Execute only the DOM event triggers
        await triggerEngine.executeTriggers(triggers, context);
      };
    });
    return handlers;
  };

  Step 3: Enhance TriggerEngine for Success/Error Callbacks

  File: /apps/wf-studio/src/rendering/WorkflowEngine/TriggerEngine.js

  After executing an action, check for success/error callbacks:
  async executeTriggers(triggers, context) {
    const result = await executeAction(triggers);

    if (result.success && workflowTriggers.onSuccess) {
      await this.executeTriggers(workflowTriggers.onSuccess, context);
    }

    if (result.error && workflowTriggers.onError) {
      await this.executeTriggers(workflowTriggers.onError, context);
    }
  }

  Future Enhancements

  1. Studio Trigger Designer

  - UI to browse triggers table
  - Drag-drop interface to assign triggers to components
  - Visual workflow builder showing onClick → action → onSuccess chain

  2. Deploy Button

  - Copy preview files to production location
  - Update routes.js with production route
  - Track deployment in database (plan_impacts)

  3. Data Binding for Grids

  - Implement dataSource resolution
  - Grid refreshing via onRefresh triggers
  - Row selection and onChange triggers

  4. Context Store Integration

  - Wire up contextStore to DirectRenderer
  - Enable visibility toggles via visible action
  - Support template variables ({{form.email.value}})

  5. Dynamic Trigger Loading

  - Include trigger metadata in pageConfig
  - Eliminate need for separate API call
  - Self-contained preview pages

  ---
  Key Files Modified This Session

  Database

  - /apps/wf-studio/src/sql/database/api_wf/procedures/sp_hier_structure.sql - Enhanced with props/triggers

  Server

  - /apps/wf-server/server/utils/pageConfig/index.js - Simplified, added route manifest generation

  Client

  - /apps/wf-studio/src/App.jsx - Added preview route loading
  - /apps/wf-studio/src/rendering/DirectRenderer.jsx - Fixed props filtering, added debug logs
  - /apps/wf-studio/src/rendering/WorkflowEngine/TriggerEngine.js - Fixed webpack warning
  - /apps/wf-studio/src/config/preview-routes.js - AUTO-GENERATED manifest

  Cleanup

  - Moved scripts: targetedAnalysis.js, writeSchema.js, studioPipelineBridge.js, generate-grid-docs.js
  - Removed: PlanManager page (old architecture)

  ---
  Testing Endpoints

  - Preview Page: http://localhost:3004/preview/wf-login/loginPage
  - genPageConfig API: POST http://localhost:3001/api/genPageConfig with {"pageID": 49}
  - Triggers API (needs to be created): GET http://localhost:3001/api/triggers

  ---
  Architecture Highlights

  Pure Database-Driven UI

  - ✅ Zero hardcoded components
  - ✅ Single source of truth (database)
  - ✅ Trigger configuration in database
  - ✅ Simple, maintainable rendering engine

  Clean Separation of Concerns

  - Database: Data structure and workflow definitions
  - genPageConfig: Transform database → pageConfig JSON
  - DirectRenderer: Render pageConfig → HTML
  - TriggerEngine: Execute workflow actions

  Scalable Pattern

  - Adding new component types = database template + expansion logic
  - Adding new triggers = database row + trigger module
  - Adding new pages = database eventTypes + genPageConfig call

  ---
  Notes for Next Session

  1. First priority: Get triggers executing (follow Step 1-3 above)
  2. Test login flow: Verify userLogin → onSuccess → setVals chain works
  3. Grid data binding: Implement dataSource resolution
  4. Consider: Should trigger metadata be in pageConfig to make preview pages self-contained?

  ---
  Session Date: 2025-09-30
  Primary Focus: Database-driven architecture, preview routing, trigger orchestration