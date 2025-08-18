# GenOps Reorganization Plan

## 🎯 **Current Issues**

- Scattered across `analysis-n-document/genOps/`
- Mixed concerns (analysis, generation, templates, output)
- No clear place for Studio designs
- Hard to find related functionality

## 🚀 **Proposed Structure**

### **Move to Root Level: `/genOps/`**

```
genOps/                           # Root level for all generation operations
├── studio/                       # Studio design files
│   ├── plans/
│   │   ├── plan-manager.json     # Studio design for plan manager page
│   │   ├── dashboard.json        # Studio design for dashboard
│   │   └── reports.json          # Studio design for reports
│   ├── admin/
│   │   ├── user-management.json
│   │   └── system-settings.json
│   └── client/
│       ├── ingredient-catalog.json
│       └── recipe-builder.json
├── analysis/                     # All analysis tools
│   ├── schemas/                  # Database schema analysis
│   │   ├── apps/
│   │   │   ├── plans/
│   │   │   ├── admin/
│   │   │   └── client/
│   │   └── shared/
│   ├── events/                   # EventType analysis
│   │   ├── apps/
│   │   │   ├── plans/
│   │   │   ├── admin/
│   │   │   └── client/
│   │   └── shared/
│   └── combined/                 # Combined analysis results
├── templates/                    # All generation templates
│   ├── eventTypes/               # NEW: EventType generation templates
│   │   ├── layout.hbs
│   │   ├── query.hbs
│   │   └── navigation.hbs
│   ├── workflows/
│   │   ├── workflow.hbs
│   │   └── display.hbs
│   ├── components/               # NEW: React component templates
│   │   ├── page.hbs
│   │   ├── form.hbs
│   │   └── grid.hbs
│   └── shared/
│       ├── handlebarsProcessor.js
│       └── templateUtils.js
├── generators/                   # All generators
│   ├── genStudioToEventTypes.js  # NEW: Studio → EventTypes
│   ├── genEventTypesToComponents.js # NEW: EventTypes → Components
│   ├── genEntityWorkflows.js     # Existing workflow generator
│   ├── genCompleteApp.js         # NEW: End-to-end generator
│   └── shared/
│       ├── fileUtils.js
│       └── validationUtils.js
├── output/                       # All generated files
│   ├── eventTypes/               # Generated eventType files
│   │   ├── plans/
│   │   ├── admin/
│   │   └── client/
│   ├── workflows/                # Generated workflow files
│   │   ├── plans/
│   │   ├── admin/
│   │   └── client/
│   └── components/               # Generated React components
│       ├── plans/
│       ├── admin/
│       └── client/
└── config/                       # Configuration files
    ├── apps.json                 # App-specific configurations
    ├── databases.json            # Database mappings
    └── templates.json            # Template configurations
```

## 🎨 **Studio Integration**

### **Studio Design Files (`/genOps/studio/plans/plan-manager.json`)**

```json
{
  "appName": "plans",
  "pageName": "plan-manager",
  "version": "1.0.0",
  "lastModified": "2025-08-12T16:30:00Z",
  "metadata": {
    "title": "Plan Management",
    "description": "Main plan management interface",
    "routePath": "/plan-manager"
  },
  "sections": {
    "appbar": [
      {
        "id": "w_abc123",
        "type": "AppLogo",
        "position": { "x": 0, "y": 0 },
        "config": {
          "title": "Plan Management",
          "logoUrl": "/assets/logo.png"
        }
      },
      {
        "id": "w_def456",
        "type": "UserProfile",
        "position": { "x": 200, "y": 0 },
        "config": {
          "showNotifications": true,
          "showSettings": true
        }
      }
    ],
    "sidebar": [
      {
        "id": "w_ghi789",
        "type": "NavSection",
        "config": {
          "title": "PLAN MANAGEMENT",
          "items": ["dashboard", "plans", "communications", "impacts"]
        }
      }
    ],
    "page": [
      {
        "id": "w_jkl012",
        "type": "Tabs",
        "position": { "x": 20, "y": 20 },
        "config": {
          "tabs": ["Plan Details", "Communications", "Impacts"],
          "defaultTab": 0
        }
      },
      {
        "id": "w_mno345",
        "type": "DataGrid",
        "position": { "x": 20, "y": 80 },
        "config": {
          "entity": "plans",
          "columns": ["id", "name", "status", "created_at"],
          "filters": ["status"],
          "actions": ["create", "edit", "delete"]
        }
      }
    ]
  },
  "relationships": {
    "navChildren": {
      "pagePlanManager": ["selectPlanStatus", "tabPlan", "tabPlanComms"],
      "tabPlan": ["formPlan"],
      "gridPlans": ["formPlan"]
    }
  },
  "eventTypeMapping": {
    "w_abc123": "appLogo",
    "w_def456": "userProfile",
    "w_ghi789": "navPlanSection",
    "w_jkl012": "tabPlan",
    "w_mno345": "gridPlans"
  }
}
```

## 🚀 **Generation Pipeline**

### **Complete Workflow**

```
Studio Design → EventType Generator → Component Generator → Working App
```

### **Commands**

```bash
# Generate eventTypes from Studio design
node genOps/generators/genStudioToEventTypes.js plans plan-manager

# Generate components from eventTypes
node genOps/generators/genEventTypesToComponents.js plans

# Complete pipeline
node genOps/generators/genCompleteApp.js plans plan-manager
```

## 🎯 **Benefits of This Organization**

1. **Clear Separation**: Analysis, templates, generation, output all separated
2. **App-Centric**: Each app has its own studio designs and outputs
3. **Scalable**: Easy to add new apps, generators, templates
4. **Discoverable**: Everything has a logical place
5. **Version Controllable**: All design files can be tracked
6. **Tool Integration**: Easy to integrate with existing genEntityWorkflows

## 📋 **Migration Steps**

1. **Create new `/genOps/` structure**
2. **Move existing files** to appropriate locations
3. **Update import paths** in all generators
4. **Create Studio design persistence**
5. **Build Studio → EventType generator**
6. **Test complete pipeline**

This organization makes the Studio a **first-class citizen** in the generation pipeline while keeping everything clean and discoverable!
