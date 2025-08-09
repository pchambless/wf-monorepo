---
inclusion: manual
---

# Category-Driven Development Automation

Use categories to drive component and eventType creation patterns.

## Category Templates

### `grid` EventTypes

```javascript
{
  eventType: "grid-{entityName}",
  category: "grid",
  dbTable: "api_wf.{table_name}",
  method: "GET",
  qrySQL: `SELECT id, name FROM api_wf.{table_name} WHERE {filter_condition} ORDER BY id DESC`,
  params: [":filterParam"],
  primaryKey: "id",
  navChildren: ["tab-{entityName}Detail"],
  workflows: ["update{EntityName}", "create{EntityName}"],
  workflowTriggers: {
    onSelect: ["validateAccess", "refreshContext"],
    onUpdate: ["updateRecord", "trackImpact"],
    onCreate: ["createRecord", "trackImpact"]
  }
}
```

### `CONFIG` EventTypes (usiing selValues.json)

```javascript
{
  eventType: "select-{configName}",
  category: "ui:Select",
  method: "CONFIG",
  configKey: "{configName}",
  configOptions: { sortByOrder: true },
  navChildren: ["grid-{targetEntity}"]
}
```

### `form` EventTypes

```javascript
{
  eventType: "form-{entityName}Detail",
  category: "form",
  dbTable: "api_wf.{table_name}",
  method: "GET",
  qrySQL: `SELECT * FROM api_wf.{table_name} WHERE id = :entityID`,
  params: [":entityID"],
  primaryKey: "id",
  workflows: ["update{EntityName}"],
  workflowTriggers: {
    onUpdate: ["updateRecord", "trackImpact"],
    onSave: ["validateData", "updateRecord"]
  }
}
```

## Component Auto-Generation Patterns

### Grid Components

- Auto-generate DataGrid with sorting, filtering, pagination
- Include row selection and bulk operations
- Connect to appropriate form/detail views

### Select Components

- Auto-generate from CONFIG eventTypes
- Include search/filter capabilities
- Handle multi-select when needed

### Form Components

- Auto-generate from form eventTypes
- Include validation based on database schema
- Handle audit fields automatically

## Workflow Integration

- Auto-connect appropriate workflows based on category
- Generate standard CRUD workflows for grid/form combinations
- Include impact tracking for all data modifications
