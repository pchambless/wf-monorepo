---
inclusion: fileMatch
fileMatchPattern: "packages/shared-imports/src/events/*/eventTypes/*.js"
---

# EventType Validation and Auto-Update

When working with eventType files, automatically:

## Validation Rules

- Ensure `eventType` name matches filename pattern (e.g., `grid-planList.js` → `"grid-planList"`)
- Validate required fields: `eventID`, `eventType`, `category`, `title`, `cluster`
- Check parameter format: `[":paramName"]` for SQL params
- Ensure category matches filename prefix (`grid-`, `select-`, `tab-`, `form-`)

## Auto-Update Actions

- Update the corresponding `index.js` file to include new/modified eventTypes
- Validate navChildren references exist
- Check workflow references are valid
- Update any component references that use the old eventType names

## Category-Driven Validation

- `grid`: Must have `dbTable`, `qrySQL`, `params`
- `select`: Must have `method: "CONFIG"`, `configKey`
- `form`: Must have `dbTable`, form configuration
- `tab`: Must have `navChildren`
- `page`: Must have `routePath`

## Common Fixes

- Auto-correct eventType names to match filename
- Update navChildren when eventType names change
- Suggest missing required fields
- Validate SQL syntax in qrySQL fields
