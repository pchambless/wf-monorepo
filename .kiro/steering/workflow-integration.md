---
inclusion: fileMatch
fileMatchPattern: "apps/wf-client/src/pages/*/index.jsx"
---

# Workflow Integration Validation

When working with page components that execute workflows:

## Workflow Execution Patterns

- Ensure `executeWorkflows()` calls use correct eventType names
- Validate workflow triggers match eventType definitions
- Check proper context passing to workflows
- Ensure error handling for workflow failures

## Context Management

- Validate context refresh after workflow execution
- Check proper parameter passing between components
- Ensure state updates reflect workflow results
- Validate loading states during workflow execution

## Error Handling

- Ensure proper try-catch blocks around workflow calls
- Validate user-friendly error messages
- Check retry logic for failed workflows
- Ensure proper cleanup on workflow errors

## Performance Optimization

- Flag unnecessary workflow executions
- Suggest batching of related workflow calls
- Validate proper debouncing of user actions
- Check for workflow execution in render loops

## Impact Tracking Integration

- Ensure all data modifications include impact tracking
- Validate proper plan ID association
- Check impact categorization is correct
- Ensure impact descriptions are meaningful
