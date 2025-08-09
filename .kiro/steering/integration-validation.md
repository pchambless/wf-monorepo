---
inclusion: fileMatch
fileMatchPattern: "apps/*/src/**/*.jsx"
autoRun: ["npm run analyze:integration"]
---

# Integration Flow Validation

When working with React components, automatically:

## Component-EventType Validation

- Verify all eventType references exist and are correctly named
- Check that component usage matches eventType category patterns
- Validate parameter passing between components
- Ensure proper workflow integration

## Flow Validation

- Trace complete user flows: select → grid → form → workflow
- Validate data flow and state management
- Check error handling and loading states
- Ensure proper context refresh patterns

## Pattern Compliance

- Enforce category-driven component patterns
- Validate master-detail relationships
- Check proper audit field handling
- Ensure impact tracking integration

## Performance Checks

- Identify unnecessary re-renders and state updates
- Check for proper memoization and optimization
- Validate efficient data loading patterns
- Flag potential memory leaks or performance issues

## Auto-Suggestions

- Recommend component refactoring opportunities
- Suggest missing error handling or validation
- Highlight inconsistent patterns across components
- Propose performance optimizations

This ensures components follow architectural patterns and integrate properly!
