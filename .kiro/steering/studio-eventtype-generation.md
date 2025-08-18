---
inclusion: always
---

# Studio → EventType Generation Architecture

## Revolutionary Workflow: Visual Design → Automated Code Generation

The Studio represents a paradigm shift from manual eventType creation to visual design-driven development.

## Architecture Overview

### EventType Organization Structure

```
eventTypes/
├── app/                    # App-level components
│   ├── appbar/            # Application bar eventTypes
│   └── sidebar/           # Navigation sidebar eventTypes
└── pages/                 # Page-specific eventTypes
    └── [pageName]/
        ├── layout/        # Visual layout eventTypes (tabs, pages, containers)
        └── query/         # Data query eventTypes (grids, forms, selects)
```

### Studio Integration Workflow

#### 1. Visual Design Phase

- **Canvas Design**: Drag widgets (Table, Form, Button, Select) onto Studio canvas
- **Layout Configuration**: Arrange components, set relationships, define navigation
- **Binding Setup**: Configure data sources, field mappings, validation rules

#### 2. EventType Generation Phase

- **Layout EventTypes**: Auto-generate from canvas structure

  - `page*` eventTypes for main containers
  - `tab*` eventTypes for tab layouts
  - Navigation relationships via `navChildren`

- **Query EventTypes**: Auto-generate from widget bindings
  - `grid*` eventTypes for data tables
  - `form*` eventTypes for input forms
  - `select*` eventTypes for dropdown components

#### 3. Component Export Phase

- **React Components**: Generate from eventTypes using genEntityWorkflows
- **Workflow Integration**: Connect to CRUD operations and business logic
- **Form-Driven Configs**: Based on actual visual design, not just schema

## EventType Categories and Patterns

### Layout EventTypes (layout/ directory)

```javascript
// Page container eventType
export const pagePlanManager = {
  eventID: 100.5,
  eventType: "pagePlanManager",
  category: "page",
  title: "Plan Management",
  cluster: "PLANS",
  navChildren: ["selectPlanStatus", "tabPlan", "tabPlanComms"],
  routePath: "/plan-manager",
  purpose: "Page for plan management and overview",
};

// Tab layout eventType
export const tabPlan = {
  eventID: 100.7,
  eventType: "tabPlan",
  category: "tab",
  title: "Plan Detail",
  cluster: "PLANS",
  navChildren: ["formPlan"],
  purpose: "Tab for viewing detailed plan information",
};
```

### Query EventTypes (query/ directory)

```javascript
// Data grid eventType
export const gridPlans = {
  eventID: 101,
  eventType: "gridPlans",
  category: "grid",
  title: "Plans",
  cluster: "PLANS",
  dbTable: "api_wf.plans",
  navChildren: ["formPlan"],
  workflows: ["createPlan"],
  selWidget: "SelPlan",
  method: "GET",
  qrySQL: `SELECT id, name FROM api_wf.plans WHERE status = :planStatus ORDER BY id DESC`,
  params: [":planStatus"],
  primaryKey: "id",
  purpose: "Get all plans given a specific status",
};

// Form eventType
export const formPlan = {
  eventID: 102,
  eventType: "formPlan",
  category: "form",
  title: "Plan Form",
  cluster: "PLANS",
  dbTable: "api_wf.plans",
  workflows: ["createPlan", "updatePlan"],
  qrySQL: `SELECT * FROM api_wf.plans WHERE id = :planId`,
  params: [":planId"],
  purpose: "Form for creating and editing plans",
};
```

## Studio Widget → EventType Mapping

### Widget Types and Generated EventTypes

- **Table Widget** → `grid*` eventType with qrySQL and data binding
- **Form Widget** → `form*` eventType with field configuration and validation
- **Button Widget** → Workflow triggers and action handlers
- **Select Widget** → `select*` eventType with configuration data

### Canvas Layout → Navigation Structure

- **Container Widgets** → `page*` eventTypes with routing
- **Tab Widgets** → `tab*` eventTypes with navChildren relationships
- **Widget Relationships** → Automatic navChildren generation

## Integration with genEntityWorkflows

### Enhanced Pipeline

```
Studio Canvas Design → EventType Generation → genEntityWorkflows → React Components
```

### Form-Driven Configuration

- **Visual Design First**: Studio canvas defines the actual UI layout
- **EventType Generation**: Captures the visual design in eventType format
- **Component Generation**: genEntityWorkflows uses eventTypes to create components
- **Perfect Alignment**: Generated components match the visual design exactly

## Development Workflow

### 1. Design Phase

1. Open Studio in plan management app
2. Design page layout with drag-and-drop widgets
3. Configure data bindings and relationships
4. Preview the visual design

### 2. Generation Phase

1. Export eventTypes from Studio canvas
2. Auto-generate layout and query eventTypes
3. Update eventType index files automatically
4. Validate eventType relationships and references

### 3. Implementation Phase

1. Run genEntityWorkflows with new eventTypes
2. Generate React components based on visual design
3. Test generated components in the application
4. Iterate on design if needed

## Benefits of This Architecture

### Design-Driven Development

- **Visual First**: Design the UI before writing code
- **Immediate Feedback**: See the layout as you build it
- **Non-Technical Friendly**: Designers can create functional layouts

### Automated Code Generation

- **Consistent Patterns**: All components follow the same eventType patterns
- **Reduced Errors**: No manual eventType creation mistakes
- **Faster Development**: Visual design → working components in minutes

### Perfect Integration

- **EventType Alignment**: Generated eventTypes match actual usage
- **Component Consistency**: All components use the same patterns
- **Workflow Integration**: Automatic connection to business logic

## Future Enhancements

### Advanced Studio Features

- **Real-time Preview**: See actual data in the Studio canvas
- **Component Library**: Reusable widget templates
- **Theme Integration**: Visual styling and branding
- **Export Options**: Multiple output formats (React, Vue, etc.)

### Enhanced EventType Generation

- **Smart Binding**: Automatic field detection from database schema
- **Validation Rules**: Visual validation configuration
- **Performance Optimization**: Automatic query optimization
- **Security Patterns**: Built-in security best practices

This architecture represents a fundamental shift from code-first to design-first development, enabling rapid prototyping and consistent implementation across the entire monorepo.
