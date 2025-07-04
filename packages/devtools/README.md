# WhatsFresh DevTools Package

**Code Generation and Development Utilities for the WhatsFresh Monorepo**

The DevTools package is the central hub for all code generation, documentation, and development utilities in the WhatsFresh ecosystem. It transforms SQL views into complete UI configurations and generates app-specific code.

## 🏗️ Architecture Overview

### The Generation-First Philosophy

Instead of sharing configuration files between apps, DevTools **generates** all configurations directly into each app. This eliminates the confusion between "real configuration" and "generated artifacts" that plagued the old shared-config approach.

```
SQL Views → DevTools → Generated App Configs
    ↓           ↓              ↓
  Tables    Directives    Pages + Routes + Navigation
```

### Core Components

- **SQL Analysis**: Extracts database schema and relationships from SQL views
- **Directive Generation**: Creates UI field configurations with smart defaults
- **PageMap Generation**: Builds complete CRUD page configurations  
- **Route/Navigation Generation**: Creates app-specific routing and navigation
- **Documentation Generation**: Produces comprehensive system documentation

## 🔄 Generation Workflow

### 1. Database → Directives
```bash
# Analyze SQL views and generate UI field directives
node genDirectives.js ingrBtchList prodList vndrList
```
**Input**: SQL view files (`/sql/views/client/*.sql`)  
**Output**: Directive files (`./directives/*.json`)  
**Purpose**: Maps database columns to UI field types with smart defaults

### 2. Directives → PageMaps  
```bash
# Generate complete page configurations for apps
node genPageMaps.js --app client
node genPageMaps.js --app admin
```
**Input**: Directive files + Entity registries  
**Output**: PageMap files directly in apps (`/apps/wf-{app}/src/pages/*/pageMap.js`)  
**Purpose**: Creates complete CRUD page configurations

### 3. Entity Registry → Routes & Navigation
```bash
# Generate app-specific routes and navigation
node generate.js --app client --type routes
node generate.js --app client --type navigation
```
**Input**: Entity registries  
**Output**: App-specific routes and navigation (`/apps/wf-{app}/src/config/`)  
**Purpose**: Creates routing and navigation based on actual app entities

### 4. Generate Documentation
```bash
# Create comprehensive system documentation
node docs/genDocs.js
```
**Input**: All generated configs + SQL views  
**Output**: HTML documentation (`./docs/generated/`)  
**Purpose**: Visual documentation of pages, widgets, and architecture

## 🛠️ CLI Commands

### Individual Generators
```bash
# Generate directives for specific entities
node src/automation/page/genDirectives.js entityName1 entityName2

# Generate pageMaps for specific app
node src/automation/page/genPageMaps.js --app client

# Generate routes for specific app  
node generate.js --app client --type routes

# Generate navigation for specific app
node generate.js --app client --type navigation
```

### Full Regeneration
```bash
# Regenerate everything for an app
npm run generate-client  # or generate-admin
```

### Documentation
```bash
# Generate all documentation
node docs/genDocs.js

# View documentation
open docs/generated/index.html
```

## 📁 File Organization

```
packages/devtools/
├── src/automation/page/          # Core page generation
│   ├── directives/               # Generated UI field configs
│   ├── genDirectives.js         # SQL → Directives
│   └── genPageMaps.js           # Directives → PageMaps
├── generators/                   # App config generators  
│   ├── routeGenerator.js        # Route generation
│   └── navigationGenerator.js   # Navigation generation
├── registries/                   # Entity definitions
│   ├── clientEntityRegistry.js # Client app entities
│   └── adminEntityRegistry.js  # Admin app entities
├── utils/                        # Shared utilities
│   ├── abbreviationMap.js       # Business domain mappings
│   └── directiveMap.js          # SQL-to-UI transformation rules
├── docs/                         # Documentation generation
│   ├── genDocs.js               # Main doc generator
│   └── sections/                # Doc section generators
└── samples/                      # Mock data for previews
```

## 🎯 Developer Workflow

### When to Regenerate

**Always regenerate when:**
- SQL views change (database schema updates)
- New entities are added to apps
- Field requirements change (new validations, UI types)

**Regeneration order:**
1. **Directives first**: `genDirectives.js` (when SQL changes)
2. **PageMaps second**: `genPageMaps.js` (when directives change)  
3. **Routes/Navigation**: `generate.js` (when entities change)
4. **Documentation last**: `genDocs.js` (for final review)

### Smart Defaults & Manual Overrides

The generation system uses **smart defaults** but preserves **manual customizations**:

- **Labels, widths, groups**: Preserved from existing directive files
- **Field types**: Auto-detected from SQL patterns and database types
- **Validation rules**: Inferred from naming conventions and SQL constraints
- **Widget mappings**: Smart-mapped based on field relationships

### Troubleshooting

**PageMap not found**: Check entity registry has correct `pageIndexPath`  
**Missing database columns**: Verify SQL view has proper `AS` aliases  
**Wrong field types**: Check directive file or SQL comment directives  
**Documentation errors**: Ensure all pageMaps exist before generating docs

## 📊 Architecture Benefits

### Before (shared-config approach)
- ❌ Mixed configuration and generated artifacts
- ❌ Import confusion (which is the real config?)
- ❌ Stale files causing bugs
- ❌ Hard to track what's generated vs manual

### After (generation-first approach)  
- ✅ Clear separation: DevTools generates, Apps consume
- ✅ Single source of truth in DevTools
- ✅ App-specific configs (no unused code)
- ✅ Consistent patterns across all apps
- ✅ Easy to regenerate when requirements change

## 🔗 Integration with Other Packages

- **shared-imports**: Provides clean API for DevTools to access app pageMaps
- **shared-ui**: Widgets and components used in generated pages
- **shared-api**: Server utilities (imported safely without JSX)
- **shared-events**: Event definitions used in generated routes

## 🚀 Getting Started

1. **Clone and install**: Standard monorepo setup
2. **Generate configs**: `npm run generate-client && npm run generate-admin`  
3. **View documentation**: `node docs/genDocs.js && open docs/generated/index.html`
4. **Start developing**: Apps now have all generated configs

---

*This package represents a major architectural evolution from shared configuration to generated configuration. The result is a much cleaner, more maintainable, and more scalable codebase.*