z# Implementation Plan

## Phase 1: Foundation Only (Start Here)

- [x] 1. Create plan-management folder structure

  - Create `apps/wf-client/src/pages/plan-management/` directory
  - Create `apps/wf-client/src/pages/plan-management/tabMaps/` subdirectory
  - Verify folder structure matches design specification
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 2. Build basic workflowMap.js (structure only, no workflows yet)

  - Create `apps/wf-client/src/pages/plan-management/workflowMap.js`
  - Define planManagementWorkflowMap object with pageId, layout, and structure
  - Add placeholder workflowTriggers (empty arrays for now)
  - Export workflowMap for use by main component
  - _Requirements: 6.1, 6.2_

- [x] 3. Create simple index.jsx with static layout

  - Create `apps/wf-client/src/pages/plan-management/index.jsx`
  - Implement basic master-detail layout structure
  - Add static header with "Plan Management" title
  - Create placeholder areas for SelStatusWidget, PlanList, and PlanDetailTabs
  - Add basic CSS classes for layout positioning
  - _Requirements: 5.1, 5.3, 5.5, 5.6_

- [x] 4. Create placeholder tabMaps files (empty configs)

  - Create `apps/wf-client/src/pages/plan-management/tabMaps/plan-detail.js`
  - Create `apps/wf-client/src/pages/plan-management/tabMaps/communications.js`
  - Create `apps/wf-client/src/pages/plan-management/tabMaps/impacts.js`
  - Each file exports empty tabMap object with tabId and title
  - _Requirements: 2.1, 3.1, 3.2, 3.3_

- [x] 5. Add navigation route for Plan Management page

  - Add route `/plan-management` to application router
  - Add "Plan Management" navigation menu item
  - Verify page loads independently of existing ArchIntel page
  - Test navigation and URL routing
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

## Phase 2: EventType Integration

- [ ] 6. Enhance eventTypes with standard trigger patterns

  - Update existing eventTypes in `packages/shared-imports/src/events/plans/eventTypes.js`
  - Add workflowTriggers with standard 3-trigger pattern (onSelect, onUpdate, onCreate)
  - Add workflows array to relevant eventTypes
  - Preserve existing SQL, params, and navChildren structure
  - _Requirements: 6.1, 6.2, 6.6, 9.2_

- [ ] 7. Build EventTypeParser module

  - Create `packages/shared-imports/src/architecture/workflows/eventType/EventTypeParser.js`
  - Implement parseWorkflowConfig method
  - Implement validateWorkflowReferences method
  - Implement getTriggersForEvent method
  - Add integration with existing eventTypes.js
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 8. Build WorkflowTriggerMap module

  - Create `packages/shared-imports/src/architecture/workflows/eventType/WorkflowTriggerMap.js`
  - Implement mapTriggerToWorkflows method
  - Implement validateTriggerConfiguration method
  - Implement resolveTriggerContext method
  - _Requirements: 6.3, 6.4, 9.2_

- [ ] 9. Connect eventTypes to components (no workflow execution yet)
  - Update plan-management components to read from eventType configs
  - Implement data loading using eventType SQL queries
  - Display plan list using eventType configuration
  - Show plan details using eventType structure
  - _Requirements: 1.2, 2.2, 5.2_

## Phase 3: Workflow Execution

- [ ] 10. Build ExecutionOrchestrator module

  - Create `packages/shared-imports/src/architecture/workflows/eventType/ExecutionOrchestrator.js`
  - Implement executeSequential method
  - Implement executeParallel method
  - Implement executeConditional method
  - Add error handling for workflow execution
  - _Requirements: 9.4, 9.5_

- [ ] 11. Build ContextRefreshManager module

  - Create `packages/shared-imports/src/architecture/workflows/eventType/ContextRefreshManager.js`
  - Implement refreshContexts method
  - Implement context-specific refresh methods (planList, planContext, etc.)
  - Implement propagateContextUpdates method
  - _Requirements: 2.7, 6.2, 6.3, 9.6_

- [ ] 12. Implement eventTypeWorkflowExecutor

  - Create `packages/shared-imports/src/architecture/workflows/eventType/index.js`
  - Implement EventTypeWorkflowExecutor class
  - Implement executeWorkflows method
  - Add error workflow execution
  - Add workflow validation methods
  - _Requirements: 9.1, 9.3, 9.5_

- [ ] 13. Connect triggers to actual workflow execution
  - Update plan-management components to use eventTypeWorkflowExecutor
  - Implement onSelect triggers for plan selection
  - Implement onUpdate triggers for plan modifications
  - Implement onCreate triggers for new records
  - Test workflow execution and context refresh
  - _Requirements: 2.4, 2.6, 2.7, 6.2, 6.3, 6.4_

## Phase 4: Complete Integration

- [ ] 14. Add all tabMap configurations

  - Complete plan-detail.js tabMap with full tableConfig, formConfig, dmlConfig
  - Complete communications.js tabMap with communication creation form
  - Complete impacts.js tabMap with read-only impact display
  - Add validation rules and field mappings
  - _Requirements: 2.2, 2.3, 3.7, 7.1, 7.2, 7.4_

- [ ] 15. Implement SelStatusWidget with CONFIG method

  - Create SelStatusWidget component
  - Implement CONFIG method to load from selectVals.json planStatus
  - Add status filtering functionality
  - Display plan counts for each status
  - Connect to plan list filtering
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 16. Implement page-level triggers

  - Add onPageLoad trigger execution in workflowMap
  - Add onPlanSelect trigger for plan selection
  - Add onPageExit trigger for cleanup
  - Connect page triggers to eventTypeWorkflowExecutor
  - _Requirements: 6.1, 6.5_

- [ ] 17. Add error handling and recovery

  - Implement error workflows (onError triggers)
  - Add user-friendly error messages
  - Add retry logic for failed operations
  - Add validation error display
  - _Requirements: 2.8, 9.5_

- [ ] 18. Performance optimization and testing
  - Optimize component rendering and data loading
  - Add loading states and progress indicators
  - Test responsive layout on different screen sizes
  - Verify all requirements are met
  - _Requirements: 3.4, 5.5, 5.6, 7.3, 7.5, 7.6_

## Implementation Notes

### Phase 1 Goal

Get the basic page rendering with folder structure in place. No workflows, no complex logic - just the foundation.

### Phase 2 Goal

Components can read eventType configs and display data. Still no workflow execution.

### Phase 3 Goal

Workflows execute when triggered, context refreshes work. Core functionality operational.

### Phase 4 Goal

Complete, polished Plan Management page with all features working.

### Testing Strategy

- Test each phase thoroughly before moving to the next
- Each phase should be functional and stable
- Incremental complexity prevents overwhelming issues
- Easy rollback if problems occur

**Start with Phase 1 only - get the basic structure working first!** 🏗️

## Phase 5: Modularization and Code Organization

- [ ] 19. Create hooks directory structure

  - Create `apps/wf-client/src/pages/plan-management/hooks/` directory
  - Create placeholder files for custom hooks
  - Set up proper exports and imports structure
  - _Requirements: Code organization, maintainability_

- [ ] 20. Extract data management hooks

  - Create `hooks/usePlanData.js` with loadPlans logic and state management
  - Create `hooks/usePlanSelection.js` with plan selection and detail loading
  - Create `hooks/useStatusFilter.js` with status filtering logic
  - Move all data-related state and logic from main component
  - _Requirements: Separation of concerns, reusability_

- [ ] 21. Extract workflow integration hooks

  - Create `hooks/useWorkflowIntegration.js` with workflow execution logic
  - Create `hooks/usePageLifecycle.js` with page initialization and cleanup
  - Create `hooks/useErrorHandling.js` with error state and recovery logic
  - Move all workflow-related logic from main component
  - _Requirements: Workflow abstraction, error handling_

- [ ] 22. Create modular UI components

  - Create `components/PlanListSection.jsx` for the master list display
  - Create `components/PlanDetailSection.jsx` for the detail tabs area
  - Create `components/ErrorDisplay.jsx` for error messaging and retry
  - Create `components/LoadingStates.jsx` for loading indicators
  - Move UI rendering logic from main component
  - _Requirements: Component reusability, UI separation_

- [ ] 23. Extract utility modules

  - Create `utils/pageWorkflows.js` for page-level workflow orchestration
  - Create `utils/contextManager.js` for context update handling
  - Create `utils/planFormatters.js` for data formatting utilities
  - Move utility functions from main component
  - _Requirements: Utility organization, code reuse_

- [ ] 24. Refactor main component to orchestrator

  - Reduce main component to ~100 lines using extracted hooks and components
  - Focus on component composition and data flow orchestration
  - Remove all business logic from main component
  - Ensure clean separation of concerns
  - _Requirements: Clean architecture, maintainability_

- [ ] 25. Add component and hook tests

  - Create test files for each extracted hook
  - Create test files for each extracted component
  - Test hooks in isolation with mock data
  - Test components with various prop combinations
  - Ensure 100% test coverage for extracted modules
  - _Requirements: Testing, quality assurance_

- [ ] 26. Update documentation and exports

  - Create README.md for the plan-management module structure
  - Document each hook's purpose, parameters, and return values
  - Document component props and usage examples
  - Create proper index.js files for clean imports
  - _Requirements: Documentation, developer experience_

## Phase 5 Goals

### **Modularization Objectives:**

- Transform 593-line monolith into focused, single-responsibility modules
- Create reusable hooks that can be used across other plan-related pages
- Establish clear separation between data logic, UI components, and utilities
- Improve testability by isolating concerns into testable units

### **Architecture Benefits:**

- **Maintainability**: Each module has a single, clear responsibility
- **Testability**: Hooks and components can be tested in isolation
- **Reusability**: Logic can be shared across multiple components
- **Readability**: Main component becomes a clear composition of parts

### **File Structure After Phase 5:**

```
plan-management/
├── index.jsx                 (~100 lines - orchestration only)
├── hooks/
│   ├── usePlanData.js
│   ├── usePlanSelection.js
│   ├── useStatusFilter.js
│   ├── useWorkflowIntegration.js
│   ├── usePageLifecycle.js
│   └── useErrorHandling.js
├── components/
│   ├── PlanListSection.jsx
│   ├── PlanDetailSection.jsx
│   ├── ErrorDisplay.jsx
│   ├── LoadingStates.jsx
│   └── SelStatusWidget.jsx
├── utils/
│   ├── pageWorkflows.js
│   ├── contextManager.js
│   ├── planFormatters.js
│   └── errorHandler.js
├── tabMaps/
│   ├── plan-detail.js
│   ├── communications.js
│   └── impacts.js
└── workflowMap.js
```

**Start Phase 5 when ready to transform the monolith into a clean, modular architecture!** 🏗️
