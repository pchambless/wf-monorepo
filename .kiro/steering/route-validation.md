---
inclusion: fileMatch
fileMatchPattern: "packages/shared-imports/src/events/*/eventTypes/*.js|apps/wf-client/src/config/routes.js|apps/wf-client/src/App.jsx"
---

# Route Validation Pipeline

Validates the complete flow: eventTypes → routes.js → App.jsx

## Validation Checks

### EventType → Routes.js

- All eventTypes with `routePath` generate valid route keys
- Route key generation follows naming conventions
- No duplicate route paths across eventTypes
- Page eventTypes have corresponding entityRegistry entries
- Route paths follow REST conventions (`/entity/:id` patterns)

### Routes.js → App.jsx

- All routes in ROUTES have corresponding entityRegistry entries
- Component folder names match route key conversion
- Page components exist at expected paths
- Import statements are valid and components export correctly

### Component Structure Validation

- Page components follow established folder structure
- Index.jsx files exist and export default components
- Component names match eventType naming conventions
- Required props and eventType integration is present

## Auto-Fixes and Suggestions

### Missing Components

- Suggest correct folder names for page components
- Recommend component boilerplate based on eventType category
- Highlight missing index.jsx files

### Route Mismatches

- Flag mismatched eventType/route key pairs
- Suggest corrections for route path inconsistencies
- Recommend missing route configurations

### Import Issues

- Validate import paths are correct
- Check for circular dependencies in routing
- Ensure lazy loading is properly configured

## Common Issues to Catch

### EventType Issues

- `routePath` defined but no entityRegistry entry
- Page eventTypes without `import: true` flag
- Inconsistent naming between eventType and route

### Component Issues

- Missing page components (like plan-management folder)
- Incorrect folder naming (camelCase vs kebab-case)
- Missing or incorrect default exports

### Route Configuration Issues

- Duplicate route paths
- Missing parameter definitions
- Incorrect component imports

## Validation Patterns

### Page EventType Pattern

```javascript
// EventType should have:
{
  eventType: "page-planManagement",
  routePath: "/plan-management",
  category: "page"
}

// Should generate:
// - entityRegistry entry with import: true
// - ROUTES entry with correct path
// - Component at apps/wf-client/src/pages/plan-management/index.jsx
```

### Navigation Flow Validation

- Verify navChildren references exist and are routable
- Check parameter passing between route segments
- Validate breadcrumb and navigation consistency

## Error Prevention

### Before Component Creation

- Validate eventType has proper routePath
- Check route key generation will be unique
- Ensure folder structure follows conventions

### Before Route Registration

- Verify component exists before adding to routes
- Check for route path conflicts
- Validate parameter requirements

### Before Deployment

- Test all routes load without errors
- Verify navigation flows work end-to-end
- Check for broken links or missing components

This prevents routing issues that waste development time and tokens!
