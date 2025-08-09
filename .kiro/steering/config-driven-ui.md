---
inclusion: fileMatch
fileMatchPattern: "apps/wf-client/src/pages/*/components/*.jsx"
---

# Config-Driven UI Validation

When working with components that use CONFIG eventTypes:

## CONFIG EventType Usage

- Ensure `getConfigData()` calls reference valid CONFIG eventTypes
- Validate configKey exists in selectVals.json
- Check configOptions are properly applied
- Ensure fallback handling for missing configurations

## SelectVals Integration

- Validate configKey references exist in selectVals.json
- Check proper sorting by `ordr` field
- Ensure color and metadata are properly used
- Validate choice value/label structure

## Component Patterns

- Ensure consistent UI patterns for select widgets
- Validate proper active state indication
- Check accessibility compliance (ARIA labels, keyboard navigation)
- Ensure responsive design for different screen sizes

## Performance Optimization

- Check for unnecessary re-renders when config changes
- Validate proper memoization of config data
- Ensure efficient filtering and sorting
- Flag potential memory leaks in config subscriptions

## Error Handling

- Ensure graceful fallback when config loading fails
- Validate user-friendly error messages
- Check retry mechanisms for config failures
- Ensure proper loading states during config fetch
