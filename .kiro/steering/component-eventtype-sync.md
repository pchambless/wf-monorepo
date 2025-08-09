---
inclusion: fileMatch
fileMatchPattern: "apps/wf-client/src/pages/*/components/*.jsx"
---

# Component-EventType Synchronization

When working with components that reference eventTypes:

## Auto-Sync Rules

- When `getConfigData("eventTypeName")` is used, validate eventType exists
- When `executeWorkflows("eventTypeName", ...)` is used, check eventType has workflows
- When `execEvent("eventTypeName")` is used, validate eventType has proper SQL/config

## Common Patterns to Fix

- Update old eventType names to new naming convention:
  - `"SelPlanStatus"` → `"select-PlanStatus"`
  - `"planList"` → `"grid-planList"`
  - `"planDetailTab"` → `"tab-planDetail"`

## Validation Checks

- Ensure referenced eventTypes exist in the eventTypes directory
- Check that CONFIG eventTypes have valid configKey
- Verify SQL eventTypes have required parameters
- Validate workflow eventTypes have defined workflows

## Auto-Suggestions

- Suggest correct eventType names when typos are detected
- Recommend category-appropriate eventTypes for component usage
- Highlight missing eventType definitions
