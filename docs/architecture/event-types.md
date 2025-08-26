# EventTypes Guide

EventTypes are the foundation of the WhatsFresh architecture. They are declarative configurations that define both server-side database operations and frontend UI components.

## EventType Categories

### Server EventTypes
**Location**: `/apps/wf-server/server/events/plans/`

#### List EventTypes (category: "list")
For retrieving multiple records with filtering:

```javascript
export const planList = {
  category: "list",
  cluster: "PLANS",
  dbTable: "api_wf.plans", 
  method: "GET",
  qrySQL: `
    SELECT id, name
    FROM api_wf.plans  
    WHERE status = :planStatus
    ORDER BY id DESC
  `,
  params: [":planStatus"],
  primaryKey: "id",
  purpose: "Get all plans given a specific status"
}
```

#### Detail EventTypes (category: "detail") 
For retrieving single records:

```javascript
export const planDtl = {
  category: "detail", 
  title: "Plan Detail",
  cluster: "PLANS",
  dbTable: "api_wf.plans",
  method: "GET",
  qrySQL: `
    SELECT id, cluster, name, status, priority, 
           description, comments, assigned_to,
           created_at, created_by
    FROM api_wf.plans
    WHERE id = :planID
  `,
  params: [":planID"],
  primaryKey: "id", 
  purpose: "Get detailed data for a specific plan"
}
```

### Frontend EventTypes
**Location**: `/apps/wf-plan-management/src/pages/PlanManager/`

#### Page EventTypes (category: "page")
Define main page layouts:

```javascript
export const pagePlanManager = {
  category: "page",
  title: "Plan Management", 
  cluster: "PAGE",
  routePath: "/plan-manager",
  purpose: "Page for plan management and overview",
  components: [
    {
      id: "tabsPlanTabs",
      container: "tabs", 
      event: "tabsPlanTabs",
      position: { row: 1, col: 5 },
      span: { cols: 50, rows: 20 },
      props: { title: "Plan Management Tabs" }
    }
  ]
}
```

#### Grid EventTypes (category: "grid")
Define data tables that connect to server queries:

```javascript
export const gridPlans = {
  category: "grid",
  title: "Plans",
  qry: "planList", // References server eventType
  cluster: "PLANS", 
  workflowTriggers: {
    onRefresh: ["execEvent"],
    onRowSelect: [
      { action: "setContext", param: "selectedPlan" },
      { action: "refresh", targets: ["formPlan", "gridPlanComms", "gridPlanImpacts"] }
    ],
    onCreate: ["createRecord"],
    onUpdate: ["updateRecord"] 
  },
  workflows: ["createPlan"],
  purpose: "Display all plans given a specific status"
}
```

#### Form EventTypes (category: "form")
Define data entry forms:

```javascript
export const formPlan = {
  category: "form", 
  title: "Plan Detail",
  cluster: "PLANS",
  qry: "planDtl", // References server detail query
  displayConfig: "/path/to/formPlan-display.js",
  purpose: "Form layout for plan details",
  workflowTriggers: {
    onRefresh: ["execEvent"],
    onSelect: ["validateAccess", "refreshContext"],
    onCreate: ["createRecord"], 
    onUpdate: ["updateRecord"]
  },
  validation: {
    name: { required: true, minLength: 3, maxLength: 100 },
    cluster: { required: true },
    status: { required: true },
    priority: { required: true }
  }
}
```

#### Select EventTypes (category: "select")
Define dropdown widgets with data sources:

```javascript
export const selectPlanStatus = {
  qry: "selectPlanStatus",
  category: "select",
  title: "Plan Status", 
  cluster: "PLANS",
  entryPoint: true, // Loads on page init
  method: "CONFIG",
  configKey: "planStatus", 
  configOptions: { sortByOrder: true },
  purpose: "Filter plans by status selection",
  workflowTriggers: {
    onLoad: ["CONFIG"],
    onSelectionChange: [
      { action: "setContext", param: "planStatus" },
      { action: "refresh", targets: ["gridPlans"] }
    ]
  },
  defaultValue: "pending"
}
```

#### Tab Container EventTypes (category: "tabs")
Define tab containers:

```javascript
export const tabsPlanTabs = {
  category: "tabs",
  title: "Tabs",
  cluster: "TABS", 
  purpose: "Container for the tabs on the page",
  components: [
    {
      id: "tabPlan",
      container: "tab",
      event: "tabPlan", 
      position: { row: 1, col: 1 },
      span: { cols: 1, rows: 1 },
      props: { title: "Plan Details", active: true }
    },
    {
      id: "tabPlanComms", 
      container: "tab",
      position: { row: 1, col: 2 },
      span: { cols: 1, rows: 1 },
      props: { title: "Communications" }
    }
  ]
}
```

#### Tab EventTypes (category: "tab")
Define individual tab content:

```javascript
export const tabPlan = {
  category: "tab",
  title: "Plan Detail", 
  cluster: "PLANS",
  purpose: "Get all plans for management",
  components: [
    {
      id: "selectPlanStatus",
      container: "inline",
      title: "Plan Status", 
      position: { row: 1, col: 1 },
      span: { cols: 2, rows: 1 },
      props: { title: "Select Status" }
    },
    {
      id: "gridPlans",
      container: "inline",
      title: 'Status Plans',
      position: { row: 1, col: 3 },
      span: { cols: 1, rows: 20 },
      props: { title: "Status Plans", showToolbar: true }
    },
    {
      id: "formPlan", 
      container: "inline",
      title: "Plan Details",
      position: { row: 2, col: 1 },
      span: { cols: 1, rows: 1 },
      props: { title: "Plan Details", allowEdit: true }
    }
  ]
}
```

## EventType Structure Reference

### Common Properties

| Property | Description | Example |
|----------|-------------|---------|
| `category` | EventType classification | `"grid"`, `"form"`, `"page"` |
| `title` | Display title | `"Plan Detail"` |
| `cluster` | Logical grouping | `"PLANS"`, `"COMMUNICATE"` |  
| `purpose` | Documentation string | `"Get all plans for management"` |
| `qry` | Server eventType reference | `"planList"` |

### Server-Specific Properties

| Property | Description | Example |
|----------|-------------|---------|
| `dbTable` | Database table | `"api_wf.plans"` |
| `method` | HTTP method | `"GET"`, `"POST"` |
| `qrySQL` | Parameterized SQL | `SELECT * FROM plans WHERE id = :planID` |
| `params` | Parameter array | `[":planID", ":status"]` |
| `primaryKey` | Primary key field | `"id"` |

### Frontend-Specific Properties

| Property | Description | Example |
|----------|-------------|---------|
| `components` | Child component array | `[{id: "grid1", container: "inline"}]` |
| `workflowTriggers` | Event → action mapping | `{onRowSelect: ["setContext"]}` |
| `displayConfig` | Layout configuration path | `"/path/to/display.js"` |
| `validation` | Form validation rules | `{name: {required: true}}` |
| `routePath` | URL route (pages only) | `"/plan-manager"` |

### Component Layout Properties

| Property | Description | Example |
|----------|-------------|---------|
| `position` | Grid position | `{row: 1, col: 3}` |
| `span` | Grid span | `{cols: 2, rows: 1}` |
| `container` | Container type | `"inline"`, `"tabs"`, `"tab"` |
| `props` | Component props | `{title: "Grid Title", showToolbar: true}` |

## Workflow Triggers

Workflow triggers connect UI events to business logic:

### Common Trigger Events

| Trigger | When It Fires | Common Actions |
|---------|---------------|----------------|
| `onLoad` | Component initialization | `["CONFIG", "execEvent"]` |
| `onRefresh` | Manual or automatic refresh | `["execEvent"]` |  
| `onRowSelect` | Grid row selection | `["setContext", "refresh"]` |
| `onSelectionChange` | Dropdown selection | `["setContext", "refresh"]` |
| `onCreate` | Create button click | `["createRecord"]` |
| `onUpdate` | Update/save action | `["updateRecord"]` |
| `onClick` | Button click | `["clearTargetForm", "showForm"]` |

### Action Types

| Action | Purpose | Parameters |
|--------|---------|------------|
| `execEvent` | Execute server query | Event context |
| `setContext` | Update context store | `param: "selectedPlan"` |
| `refresh` | Refresh components | `targets: ["formPlan", "gridPlans"]` |
| `createRecord` | Create new record | Form data |
| `updateRecord` | Update existing record | Form data + ID |
| `CONFIG` | Load configuration data | `configKey: "planStatus"` |

## EventType Relationships

### Server → Frontend Connection
```javascript
// Server defines the query
export const planList = { qrySQL: "SELECT * FROM plans..." }

// Frontend references it  
export const gridPlans = { qry: "planList" }
```

### Parent → Child Component Hierarchy
```javascript
// Page contains tabs
pagePlanManager.components = [{ event: "tabsPlanTabs" }]

// Tabs contain individual tabs  
tabsPlanTabs.components = [{ event: "tabPlan" }]

// Tab contains grids and forms
tabPlan.components = [
  { id: "gridPlans" },
  { id: "formPlan" }  
]
```

### Workflow Cascade
```javascript
// Select triggers grid refresh
selectPlanStatus: {
  onSelectionChange: [
    { action: "setContext", param: "planStatus" },
    { action: "refresh", targets: ["gridPlans"] }
  ]
}

// Grid selection triggers form refresh  
gridPlans: {
  onRowSelect: [
    { action: "setContext", param: "selectedPlan" },
    { action: "refresh", targets: ["formPlan"] }
  ]  
}
```

## Development Patterns

### Creating New EventTypes

1. **Choose Category**: Determine if it's a page, grid, form, tab, or select
2. **Define Purpose**: Clear documentation of what it does
3. **Set Relationships**: Connect to server queries via `qry` property
4. **Add Workflows**: Define trigger events and actions
5. **Layout Components**: Use position/span for child components

### EventType Naming Conventions

| Pattern | Example | Usage |
|---------|---------|-------|
| `[entity]List` | `planList` | Server list queries |
| `[entity]Dtl` | `planDtl` | Server detail queries |
| `grid[Entity]` | `gridPlans` | Frontend grids |
| `form[Entity]` | `formPlan` | Frontend forms |  
| `tab[Entity]` | `tabPlan` | Tab contents |
| `tabs[Name]` | `tabsPlanTabs` | Tab containers |
| `select[Purpose]` | `selectPlanStatus` | Dropdown widgets |
| `page[Name]` | `pagePlanManager` | Main pages |

### File Organization

```
/server/events/plans/
├── planList.js      # Server queries
├── planDtl.js
├── planCommList.js
└── planCommDtl.js

/pages/PlanManager/
├── page/
│   └── pagePlanManager.js    # Page definitions
├── tabs/ 
│   ├── tabsPlanTabs.js      # Tab containers
│   └── tabPlan.js           # Tab contents
├── grids/
│   ├── gridPlans.js         # Grid components  
│   └── gridPlanComms.js
├── forms/
│   ├── formPlan.js          # Form components
│   └── formPlanComm.js  
└── widgets/
    ├── selectPlanStatus.js   # UI widgets
    └── btnCreate.js
```

## Best Practices

### Server EventTypes
- Use clear, descriptive SQL with proper formatting
- Always parameterize queries (`:paramName`) 
- Include purpose documentation
- Use consistent naming (List/Dtl suffixes)
- Specify primary keys for data integrity

### Frontend EventTypes  
- Reference server eventTypes via `qry` property
- Define comprehensive workflow triggers
- Use semantic component positioning
- Include clear titles and purposes
- Group related functionality in tabs

### Workflow Design
- Keep workflows simple and focused
- Use context to share data between components
- Refresh dependent components after context changes
- Handle loading states appropriately
- Provide user feedback for actions

### Component Layout
- Use logical grid positioning (row/col)
- Provide appropriate spanning for content
- Group related components visually
- Consider responsive behavior
- Test layout with various content sizes

---

*EventTypes are the heart of the WhatsFresh architecture - master them to build powerful, maintainable applications.*