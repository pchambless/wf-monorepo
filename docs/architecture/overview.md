# System Architecture Overview

## Introduction

The WhatsFresh monorepo implements a sophisticated event-driven architecture that transforms database schemas into fully functional React applications. This document captures the complete architecture discovered through analysis of the plans management system.

## Core Architecture Principles

### 1. Event-Driven Infrastructure
Everything is built around **eventTypes** - declarative configurations that define:
- Server-side database queries
- Frontend UI components  
- Workflow triggers and data flow
- Component layout and positioning

### 2. Schema-Driven Development
Database schemas automatically generate:
- Form layouts with proper field types
- Validation rules and constraints
- Display configurations for grids
- Foreign key relationships as dropdowns

### 3. Prototype-First Approach
- **wf-plan-management** serves as the template
- Future apps (**wf-client**, **wf-admin**) will mirror this structure
- Shared components ensure consistency across apps

## System Components

### Backend: wf-server
**Location**: `/apps/wf-server/server/events/plans/`

Server eventTypes define database operations:

```javascript
// planList.js - List query eventType
export const planList = {
  category: "list",
  cluster: "PLANS", 
  dbTable: "api_wf.plans",
  method: "GET",
  qrySQL: `SELECT id, name FROM api_wf.plans WHERE status = :planStatus`,
  params: [":planStatus"],
  primaryKey: "id"
}
```

**Plans EventTypes**:
- `planList` - Filter plans by status
- `planDtl` - Individual plan details  
- `planCommList` - Communications for a plan
- `planCommDtl` - Communication details
- `planImpactList` - File impacts for a plan  
- `planImpactDtl` - Impact details

### Frontend: wf-plan-management  
**Location**: `/apps/wf-plan-management/src/pages/PlanManager/`

Frontend eventTypes define UI components:

```javascript
// gridPlans.js - Grid component eventType
export const gridPlans = {
  category: "grid",
  title: "Plans", 
  qry: "planList", // References server eventType
  workflowTriggers: {
    onRowSelect: [
      { action: "setContext", param: "selectedPlan" },
      { action: "refresh", targets: ["formPlan", "gridPlanComms"] }
    ]
  }
}
```

**EventType Categories**:
- **page** - Main page layouts
- **tabs** - Tab containers  
- **tab** - Individual tab content
- **grid** - Data tables
- **form** - Data entry forms
- **select** - Dropdown widgets
- **button** - Action buttons

### Schema System
**Location**: `/analysis-n-document/genOps/analyzeSchemas/apps/plans/`

Database schemas provide complete metadata:

```json
{
  "name": "cluster",
  "type": "VARCHAR(20)",
  "uiType": "text", 
  "validationRules": ["required", "maxLength:20"],
  "foreignKey": {
    "type": "selectVals",
    "mapping": "cluster", 
    "widget": "selCluster"
  }
}
```

**Schema Features**:
- Field types and constraints
- UI component types (`text`, `select`, `datetime`, `checkbox`)
- Validation rules
- Foreign key relationships
- Default values and computed fields

### Display Configuration System
**Location**: `/analysis-n-document/genOps/workflows/output/plans/`

Auto-generated display configurations:

```javascript
// formPlan-display.js - Auto-generated layout
export const display = {
  form: {
    sections: [{
      title: 'Basic Information',
      fields: [
        { name: 'name', label: 'Name', required: true },
        { name: 'status', label: 'Status', required: true }
      ]
    }]
  }
}
```

### Shared Components
**Location**: `/packages/shared-imports/`

Reusable components for all apps:
- FormComponent (schema-driven forms)
- GridComponent (data tables)
- WorkflowEngine (event handling)
- ContextStore (state management)

### Studio Design Tool
**Location**: `/wf-studio/src/components/Studio/`

Visual page design interface:
- EventType template generators
- Page layout designers  
- Component configuration tools

## Data Flow Architecture

### 1. EventType Processing Flow

```
Source EventType (.js) → EventOrchestrator → PageRenderer → React Component
         ↓
    PlanManager.json → wf-studio → Visual Design Interface
```

### 2. Schema-to-UI Flow

```
Database Schema → Field Metadata → Display Config → Form Component
      ↓               ↓              ↓            ↓
   plans.json → uiType values → form layout → React inputs
```

### 3. Workflow Trigger Flow

```
User Action → EventOrchestrator → WorkflowEngine → Context Update → Component Refresh
     ↓              ↓                ↓              ↓              ↓
  Grid Click → onRowSelect → setContext/refresh → selectedPlan → Form Updates
```

## Key Components Deep Dive

### EventOrchestrator
**File**: `/apps/wf-plan-management/src/components/EventOrchestrator.jsx`

Central orchestration engine:
- **Dynamic Loading**: Auto-imports all eventTypes from subdirectories
- **Workflow Integration**: Routes user interactions to WorkflowEngine
- **Data Management**: Handles initial data loading via `onLoad` triggers
- **Component Coordination**: Manages relationships between grids, forms, etc.

### PageRenderer  
**File**: `/apps/wf-plan-management/src/components/PageRenderer.jsx`

Component factory system:
- **Category Routing**: Routes eventTypes to specific React components
- **Layout Engine**: Converts position/span metadata to CSS Grid
- **Event Handling**: Connects UI events back to EventOrchestrator
- **Nested Rendering**: Supports hierarchical component structures

### FormComponent (Schema-Driven)
Dynamic form generation:
- **Field Mapping**: Schema `uiType` → React input components
- **Validation**: Real-time validation using schema rules
- **Foreign Keys**: Automatic dropdown generation for relationships  
- **Mode Support**: Create/Edit/View modes with appropriate behaviors

## Page Structure Patterns

### Hierarchical Layout
```
page (pagePlanManager)
└── tabs (tabsPlanTabs)  
    ├── tab (tabPlan)
    │   ├── select (selectPlanStatus)
    │   ├── grid (gridPlans)  
    │   └── form (formPlan)
    ├── tab (tabPlanComms)
    │   ├── grid (gridPlanComms)
    │   └── form (formPlanComm) 
    └── tab (tabPlanImpacts)
        ├── grid (gridPlanImpacts)
        └── form (formPlanImpact)
```

### Position-Based Layout
Components use CSS Grid positioning:
```javascript
{
  position: { row: 1, col: 3 },
  span: { cols: 1, rows: 20 }
}
// Becomes: gridColumn: "3 / span 1", gridRow: "1 / span 20"
```

## Configuration Generation Process

### 1. EventType Analysis
Source `.js` files are analyzed to extract:
- Component metadata
- Workflow relationships  
- Query dependencies
- Layout structures

### 2. JSON Generation
Creates `PlanManager.json` with:
- Flattened eventType list
- Component hierarchy
- Workflow capabilities
- Studio integration metadata

### 3. Studio Integration
JSON feeds into wf-studio for:
- Visual page design
- Component configuration
- Workflow visualization
- Code generation

## Integration Points

### Server ↔ Frontend
```javascript
// Server eventType
export const planList = { 
  qrySQL: "SELECT * FROM plans WHERE status = :planStatus"
}

// Frontend eventType references it
export const gridPlans = {
  qry: "planList" // Links to server eventType
}
```

### Schema ↔ Forms
```javascript
// Schema defines field
{ name: "status", uiType: "select", foreignKey: { mapping: "planStatus" }}

// FormComponent renders as dropdown
<select>
  <option value="pending">Pending</option>
  <option value="active">Active</option>  
</select>
```

### EventType ↔ Workflows
```javascript
// EventType defines triggers
workflowTriggers: {
  onRowSelect: [
    { action: "setContext", param: "selectedPlan" },
    { action: "refresh", targets: ["formPlan"] }
  ]
}

// WorkflowEngine executes them
await workflowEngine.executeTrigger(eventType, 'onRowSelect', rowData);
```

## Development Patterns

### Adding New EventTypes

1. **Server Query**: Create eventType in `/wf-server/server/events/plans/`
2. **Frontend Component**: Create eventType in `/wf-plan-management/src/pages/PlanManager/`
3. **Auto-Discovery**: EventOrchestrator automatically loads new eventTypes
4. **JSON Update**: Regenerate `PlanManager.json` for studio integration

### Creating New Apps

1. **Copy Structure**: Use wf-plan-management as template
2. **Update EventTypes**: Modify eventTypes for new domain
3. **Schema Integration**: Connect to relevant database schemas  
4. **Shared Components**: Leverage shared-imports package

### Schema-Driven Development

1. **Database First**: Define tables with proper metadata
2. **Schema Analysis**: Run schema analysis tools  
3. **Auto-Generation**: Generate display configs and form layouts
4. **Customization**: Override auto-generated configs as needed

## Future Architecture Plans

### Upcoming Apps
- **wf-client** - Client management (will mirror wf-plan-management)
- **wf-admin** - Administrative functions (will mirror wf-plan-management)

### Enhancement Areas
- Enhanced FormComponent with full schema integration
- Advanced GridComponent with sorting/filtering
- Workflow visualization in studio
- Real-time collaborative editing

### Integration Goals
- Seamless studio → runtime experience
- Complete schema-driven automation  
- Multi-tenant architecture support
- Advanced workflow orchestration

## Conclusion

This architecture provides a powerful foundation for rapid application development through:

- **Declarative Configuration**: EventTypes define everything
- **Schema Automation**: Database drives UI generation
- **Visual Design**: Studio enables non-technical page creation
- **Code Reuse**: Shared components across apps
- **Scalable Patterns**: Template-based app creation

The plans management system serves as the proven prototype, demonstrating these patterns work effectively for complex business applications.

---

*Architecture documented August 2025 based on analysis of wf-monorepo-new codebase.*