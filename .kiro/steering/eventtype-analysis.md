---
inclusion: fileMatch
fileMatchPattern: "packages/shared-imports/src/events/*/eventTypes/*.js"
autoRun: ["npm run analyze:events"]
---

# EventType Analysis Auto-Update

When eventType files change, automatically:

## Analysis Updates

- Regenerate eventTypes.mmd diagrams
- Update config-relationships.json with new eventType mappings
- Refresh integration-flows.json with updated workflows
- Update component-eventType relationship mappings

## Validation Triggers

- Check eventType naming consistency across all files
- Validate navChildren references exist
- Ensure workflow references are defined
- Update index.js exports automatically

## Documentation Sync

- Update README files with new eventType patterns
- Refresh architecture documentation
- Generate component usage examples
- Update category-driven development templates

This ensures analysis stays current with eventType changes!
