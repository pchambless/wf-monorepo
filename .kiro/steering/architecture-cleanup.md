---
inclusion: fileMatch
fileMatchPattern: "packages/shared-imports/src/architecture/**/*"
autoRun: ["npm run analyze:dead-code"]
---

# Architecture Cleanup Automation

When working in architecture files, automatically:

## Dead Code Detection

- Highlight unused modules and functions
- Identify obsolete patterns and deprecated code
- Flag circular dependencies and architectural violations
- Suggest refactoring opportunities

## Pattern Enforcement

- Ensure new code follows established patterns
- Validate module boundaries and separation of concerns
- Check for proper error handling and logging
- Enforce naming conventions and file organization

## Cleanup Suggestions

- Recommend module consolidation opportunities
- Identify duplicate functionality across packages
- Suggest performance optimizations
- Flag security or maintainability issues

## Documentation Updates

- Update architecture diagrams when patterns change
- Refresh module dependency documentation
- Generate impact analysis for proposed changes
- Update best practices documentation

This prevents technical debt accumulation in core architecture!
