# WhatsFresh Documentation System

This directory contains the comprehensive documentation generation system for the WhatsFresh monorepo. The system automatically generates unified HTML documentation from various sources throughout the codebase.

## 📖 Overview

The documentation system provides:

- **Automated Documentation Generation** - Unified HTML docs from multiple sources
- **Widget Registry** - Complete catalog of UI components and their usage
- **Page Previews** - Visual previews of generated pages (table, form, DML views)
- **Architecture Rules** - Development standards and decisions
- **Template System** - Consistent styling and navigation across all docs
- **Future Sections** - Directive system and API documentation (planned)

## 🗂️ Directory Structure

```
packages/devtools/src/docs/
├── README.md                     # This file - system overview
├── automation/
│   └── genMasterDocs.js         # Main orchestrator for all documentation
├── templates/
│   ├── page-template.html       # Base HTML template
│   ├── navigation.html          # Navigation component
│   └── styles.css              # Unified CSS styling
├── sections/
│   ├── widgets/
│   │   ├── genWidgetDocs.js    # Widget documentation generator
│   │   └── source/             # Widget generation modules
│   ├── pages/
│   │   ├── genPageDocs.js      # Page preview generator
│   │   └── source/             # Page generation modules
│   └── ...                    # Future sections
├── rules/
│   └── ARCHITECTURE-RULES.md   # Development standards
└── generated/                   # Output directory (auto-generated)
    ├── index.html              # Main documentation index
    ├── styles.css              # Copied CSS
    ├── widgets/                # Widget documentation
    ├── pages/                  # Page previews
    └── rules/                  # Architecture rules
```

## 🚀 Quick Start

### Generate All Documentation

```bash
# From monorepo root
yarn generate-docs

# Or directly
node packages/devtools/src/docs/automation/genMasterDocs.js
```

### View Documentation

Open `packages/devtools/src/docs/generated/index.html` in your browser.

## 📋 Documentation Table of Contents

| Section | Status | Description | Link |
|---------|--------|-------------|------|
| **🏠 Home** | ✅ Available | Main index and navigation | [index.html](./generated/index.html) |
| **🔧 Widget Registry** | ✅ Available | Complete catalog of UI widgets and components | [widgets/](./generated/widgets/index.html) |
| **📄 Page Previews** | ✅ Available | Visual previews of generated pages and layouts | [pages/](./generated/pages/index.html) |
| **🔄 Event Types Flow** | ✅ Available | Complete event system flow and relationships - **THE GLUE** | [events/](./generated/events/index.html) |
| **📋 Architecture Rules** | ✅ Available | Development standards and architectural decisions | [rules/](./generated/rules/index.html) |
| **⚛️ React Guidelines** | ✅ Available | React development conventions, ES modules, MUI, and MobX patterns | [rules/REACT-DEVELOPMENT-GUIDELINES.md](./rules/REACT-DEVELOPMENT-GUIDELINES.md) |
| **⚙️ Directive System** | 🔄 Planned | Field directives and form generation documentation | *Coming Soon* |
| **🌐 API Documentation** | 🔄 Planned | REST API endpoints and data contracts | *Coming Soon* |


## 📦 Integration with Build Process

The documentation generation is integrated into the monorepo build process:

```json
// package.json scripts
{
  "generate-docs": "node packages/devtools/src/docs/automation/genMasterDocs.js",
  "build": "yarn generate-page-maps && yarn generate-docs && yarn generate-visuals && yarn workspaces run build"
}
```

## 🎯 Key Features

### Automatic Discovery

- **Widgets**: Automatically discovers widgets from shared-ui registry
- **Pages**: Scans pageMap configurations for page previews
- **Rules**: Processes markdown files into HTML

### Responsive Design

- **Mobile-friendly**: Responsive CSS for all screen sizes
- **Clean styling**: Professional documentation appearance
- **Consistent navigation**: Unified UX across all sections

### Development Workflow

1. **Code Changes**: Modify widgets, pages, or rules
2. **Generate Docs**: Run `npm run generate-docs`
3. **Review**: Open generated HTML to review changes
4. **Commit**: Documentation updates with code changes

## 🔄 Future Enhancements

### Planned Sections

- **Directive System**: Document field directives and form generation
- **API Documentation**: REST endpoints and data contracts
- **Database Schema**: Entity relationships and SQL documentation

### Planned Features

- **Live Reload**: Auto-regenerate docs during development
- **Search**: Full-text search across all documentation
- **Markdown Processing**: Enhanced markdown-to-HTML conversion
- **Code Examples**: Interactive code samples and demos

## 📖 Viewing the Documentation

**🚀 Easy Access**: Double-click this file in Windows Explorer:
- **[VIEW_DOCS.html](./VIEW_DOCS.html)** ← **Click this in File Explorer to open in browser**

**📊 Direct Links** (for File Explorer):
- **Main docs**: `packages/devtools/src/docs/generated/index.html`
- **Quick launcher**: `packages/devtools/src/docs/VIEW_DOCS.html`

**📝 README**: This file is best for understanding the system structure and quick reference.

## 📖 Related Documentation

- [Architecture Rules](./rules/ARCHITECTURE-RULES.md) - Development standards
- [Widget Usage Guide](./generated/widgets/index.html) - UI component documentation
- [Page Previews](./generated/pages/index.html) - Visual page documentation

---

## 🔧 Documentation System Technical Details

<details>
<summary>Click to expand technical implementation details</summary>

### How It Works

#### 1. Template Engine (`TemplateEngine` class)
- **Templates**: Reusable HTML templates with `{{variable}}` placeholders
- **Navigation**: Consistent navigation with active state management  
- **Styling**: Unified CSS across all documentation pages

#### 2. Master Generator (`MasterDocGenerator` class)
- **Orchestration**: Coordinates all documentation generation
- **Section Management**: Manages individual documentation sections
- **Output**: Creates unified documentation in `generated/` directory

#### 3. Section Generators
Each documentation section has its own generator:
- **Widget Generator**: Scans widget registry and creates component docs
- **Page Generator**: Creates visual previews from pageMap configurations
- **Rules Generator**: Converts markdown to HTML with templates

### Extending the System

#### Adding a New Documentation Section

1. **Create section generator**:
   ```javascript
   // sections/newsection/genNewSectionDocs.js
   export class NewSectionDocGenerator {
     constructor(templateEngine) {
       this.templateEngine = templateEngine;
     }
     
     async generateDocs(outputDir) {
       // Generate section documentation
     }
   }
   ```

2. **Add to master generator**:
   ```javascript
   // In genMasterDocs.js
   async generateNewSectionDocs() {
     const { NewSectionDocGenerator } = await import('../sections/newsection/genNewSectionDocs.js');
     // ... implement generation
   }
   ```

3. **Update navigation**:
   ```html
   <!-- In templates/navigation.html -->
   <a href="{{baseUrl}}/newsection/index.html" {{newsectionActive}}>New Section</a>
   ```

#### Creating Custom Templates

Templates use simple variable replacement:

```html
<!-- my-template.html -->
<h1>{{title}}</h1>
<div class="content">{{content}}</div>
<p>Generated: {{timestamp}}</p>
```

```javascript
// Usage
const html = await templateEngine.generatePage({
  title: 'My Page',
  content: '<p>Page content</p>',
  activeSection: 'mysection'
});
```

### Contributing

When adding new documentation:

1. Follow the template system for consistency
2. Update this README if adding new sections
3. Ensure responsive design
4. Test documentation generation
5. Update build scripts if needed

</details>

---

**📖 Documentation available at**: `packages/devtools/src/docs/generated/index.html`

**🔄 Last updated**: Auto-generated with each documentation build