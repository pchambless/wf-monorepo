#!/usr/bin/env node
/**
 * 📋 Auto-generate grid-standards.mmd from executable standards
 * 
 * Run with: node src/architecture/generate-grid-docs.js
 */

import { getStandardsForDocumentation, GRID_CONFIG, CONTAINER_TYPES, LAYOUT_PATTERNS, STANDARDS_VERSION } from './grid-standards.js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateMermaidDocs() {
  const standards = getStandardsForDocumentation();
  
  const mermaidContent = `# Grid Standards Documentation

**Auto-generated from \`grid-standards.js\` v${STANDARDS_VERSION}**  
*Generated: ${standards.generatedAt}*

## System Overview

\`\`\`mermaid
graph TD
    A[Grid Standards] --> B[Container Types]
    A --> C[Position Schema] 
    A --> D[Layout Patterns]
    A --> E[CSS Generation]
    
    B --> B1[page - Top-level grid]
    B --> B2[tab - Tab content grid]
    B --> B3[card - Card internal layout]
    B --> B4[modal - Modal dialog grid]
    B --> B5[inline - Flow within parent]
    
    C --> C1["col: {start, span}"]
    C --> C2["row: {start, span}"]
    
    E --> E1[CSS Custom Properties]
    E --> E2[Grid Container Classes]
\`\`\`

## Configuration

| Property | Value | Description |
|----------|-------|-------------|
| **Grid Columns** | ${GRID_CONFIG.COLUMNS} | Total columns in grid system |
| **Default Gap** | ${GRID_CONFIG.DEFAULT_GAP} | Space between grid items |
| **Min Span** | ${GRID_CONFIG.MIN_SPAN} | Minimum column/row span |
| **Max Span** | ${GRID_CONFIG.MAX_SPAN} | Maximum column/row span |

## Container Types

\`\`\`mermaid
flowchart LR
    subgraph "Container Hierarchy"
        PAGE[page] --> TAB[tab]
        TAB --> CARD[card]
        PAGE --> MODAL[modal]
        CARD --> INLINE[inline]
    end
\`\`\`

${Object.entries(CONTAINER_TYPES).map(([key, value]) => `- **${value}**: ${getContainerDescription(value)}`).join('\n')}

## Position Schema

All components use this position structure:

\`\`\`javascript
position: {
  col: { start: 1-10, span: 1-10 },  // Column positioning
  row: { start: 1+,   span: 1+ }     // Row positioning  
}
\`\`\`

### Validation Rules

- **col.start**: Integer between 1 and ${GRID_CONFIG.COLUMNS}
- **col.span**: Integer between 1 and ${GRID_CONFIG.COLUMNS}
- **col.start + col.span - 1**: Must not exceed ${GRID_CONFIG.COLUMNS}
- **row.start**: Positive integer (1+)
- **row.span**: Positive integer (1+)

## Layout Patterns

Common layout patterns for quick use:

\`\`\`mermaid
block-beta
    columns 10
    
    subgraph "Full Width Pattern"
        fw["FULL_WIDTH<br/>cols 1-10 (100%)"]
    end
    
    subgraph "Two Column Pattern"  
        lh["LEFT_HALF<br/>cols 1-5 (50%)"]
        rh["RIGHT_HALF<br/>cols 6-10 (50%)"]
    end
    
    subgraph "Three Column Pattern (Studio)"
        lt["LEFT_THIRD<br/>cols 1-3 (30%)"]
        mt["MIDDLE_THIRD<br/>cols 4-7 (40%)"] 
        rt["RIGHT_THIRD<br/>cols 8-10 (30%)"]
    end
\`\`\`

### Pattern Details

${Object.entries(LAYOUT_PATTERNS).map(([key, pattern]) => 
  `- **${key}**: cols ${pattern.col.start}-${pattern.col.start + pattern.col.span - 1} (${Math.round((pattern.col.span / GRID_CONFIG.COLUMNS) * 100)}%)`
).join('\n')}

## CSS Classes

Generated CSS classes for containers:

| Container Type | CSS Classes |
|----------------|-------------|
${Object.values(CONTAINER_TYPES).map(type => {
  const classes = getContainerClasses(type);
  return `| **${type}** | \`${classes.join(' ')}\` |`;
}).join('\n')}

## Usage Examples

### Basic Component Definition

\`\`\`javascript
import { validatePosition, validateContainer, CONTAINER_TYPES, LAYOUT_PATTERNS } from './grid-standards.js';

export const myComponent = {
  container: validateContainer(CONTAINER_TYPES.TAB),
  position: validatePosition(LAYOUT_PATTERNS.CARD_TOP_LEFT),
  props: {
    title: "My Component"
  }
};
\`\`\`

### CSS Application

\`\`\`javascript
import { generateCSSProps } from './grid-standards.js';

const cssProps = generateCSSProps(component.position);
// Result: { '--col-start': 1, '--col-span': 3, '--row-start': 1, '--row-span': 1 }

<div style={cssProps} className="grid-item">
  {/* Component content */}
</div>
\`\`\`

## Studio Layout Example

\`\`\`mermaid
grid:
    columns 10
    
    sidebar["Sidebar\\ncols 1-3"] --> componentPanel["Components\\ncols 4-5"]
    componentPanel --> workArea["Work Area\\ncols 6-10"]
    
    subgraph workArea ["Work Area (Tabs)"]
        direction TB
        tab1["Tab Content Grid"]
        cardBasics["Basic Properties\\ncols 1-3"]
        cardData["Data Binding\\ncols 4-6"] 
        cardPreview["Preview\\ncols 7-10"]
        
        tab1 --> cardBasics
        tab1 --> cardData
        tab1 --> cardPreview
    end
\`\`\`

---

*This documentation is auto-generated from executable standards.*  
*To update: modify \`grid-standards.js\` and run \`npm run generate-grid-docs\`*
`;

  return mermaidContent;
}

function getContainerDescription(containerType) {
  const descriptions = {
    'page': 'Top-level page grid (columnSidebar, tabsWorkArea, etc)',
    'tab': 'Tab content grid (cards within tabs)', 
    'card': 'Card internal layout',
    'modal': 'Modal dialog grid',
    'inline': 'Flow within parent container'
  };
  return descriptions[containerType] || 'Container type';
}

function getContainerClasses(containerType) {
  // Import function to get actual classes
  const baseClasses = ['grid-container'];
  
  switch (containerType) {
    case 'page': return [...baseClasses, 'page-grid'];
    case 'tab': return [...baseClasses, 'tab-grid'];
    case 'card': return [...baseClasses, 'card-grid'];
    case 'modal': return [...baseClasses, 'modal-grid'];
    case 'inline': return ['inline-flow'];
    default: return baseClasses;
  }
}

// Generate individual mermaid files
function generateIndividualCharts() {
  const docsPath = join(__dirname, '../../docs/architecture');
  
  // 1. Grid Standards Core Architecture
  const coreArchitecture = `---
title: Grid Standards Core Classes
---
classDiagram
    GridStandards <|-- ContainerTypes
    GridStandards <|-- PositionSchema
    GridStandards <|-- LayoutPatterns
    GridStandards : +int COLUMNS
    GridStandards : +string DEFAULT_GAP
    GridStandards : +validatePosition()
    GridStandards : +validateContainer()
    GridStandards : +generateCSSProps()
    
    class ContainerTypes{
      +string PAGE
      +string TAB
      +string CARD
      +string MODAL
      +string INLINE
      +getContainerClasses()
    }
    
    class PositionSchema{
      +object col
      +object row
      +validate()
      +generateCSSProps()
    }
    
    class LayoutPatterns{
      +object FULL_WIDTH
      +object LEFT_HALF
      +object CARD_TOP_LEFT
      +getWidthPercentage()
      +createExample()
    }`;

  // 2. Component Architecture 
  const componentArchitecture = `---
title: Component Architecture
---
classDiagram
    Component <|-- PageComponent
    Component <|-- TabComponent  
    Component <|-- CardComponent
    Component : +string container
    Component : +object position
    Component : +object props
    Component : +validate()
    
    class PageComponent{
      +string layout
      +array components
      +object workflowTriggers
      +renderPage()
    }
    
    class TabComponent{
      +array components
      +object workflowTriggers
      +renderTab()
    }
    
    class CardComponent{
      +array fields
      +object workflowTriggers
      +renderCard()
    }
    
    GridStandards --> Component : validates
    PageRenderer --> Component : renders
    GenPageConfig --> Component : processes`;

  // 3. System Integration
  const systemIntegration = `---
title: System Integration
---
classDiagram
    GridStandards --> GenPageConfig : validates
    GridStandards --> PageRenderer : provides CSS
    GridStandards --> CardDefinitions : validates
    
    class GridStandards{
      +validatePosition()
      +validateContainer()
      +generateCSSProps()
      +getLayoutPatterns()
      +isValidPosition()
    }
    
    class GenPageConfig{
      +scanEventTypes()
      +validateComponents()
      +generateConfig()
      +stripMetadata()
    }
    
    class PageRenderer{
      +applyCSS()
      +renderComponents()
      +handleLayout()
      +processPosition()
    }
    
    class CardDefinitions{
      +string container
      +object position
      +object props
      +array fields
      +validate()
    }`;

  // 4. Basic Layout Patterns
  const layoutPatterns = `---
title: Basic Layout Patterns
---
block-beta
    columns 10
    
    block:fullWidth:10
        fw["FULL_WIDTH<br/>10 cols (100%)"]
    end
    
    block:halfSplit:10
        lh["LEFT_HALF<br/>5 cols (50%)"] rh["RIGHT_HALF<br/>5 cols (50%)"]
    end
    
    block:threeCol:10
        lt["LEFT<br/>3 cols (30%)"] mt["MIDDLE<br/>4 cols (40%)"] rt["RIGHT<br/>3 cols (30%)"]
    end
    
    classDef fullWidth fill:#4caf50
    classDef twoCol fill:#2196f3
    classDef threeCol fill:#ff9800
    
    class fw fullWidth
    class lh,rh twoCol
    class lt,mt,rt threeCol`;

  // Write individual files
  const charts = [
    { name: 'core-architecture.mmd', content: coreArchitecture },
    { name: 'component-architecture.mmd', content: componentArchitecture },
    { name: 'system-integration.mmd', content: systemIntegration },
    { name: 'layout-patterns.mmd', content: layoutPatterns }
  ];

  charts.forEach(chart => {
    const filePath = join(docsPath, chart.name);
    writeFileSync(filePath, chart.content, 'utf8');
    console.log(`✅ Generated ${chart.name}`);
  });

  // Generate summary README
  const readmeContent = `# Grid Standards Documentation

**Auto-generated from \`grid-standards.js\` v${STANDARDS_VERSION}**  
*Generated: ${new Date().toISOString()}*

## Mermaid Charts

- **[core-architecture.mmd](./core-architecture.mmd)** - Grid standards core classes and structure
- **[component-architecture.mmd](./component-architecture.mmd)** - Component inheritance hierarchy  
- **[system-integration.mmd](./system-integration.mmd)** - How standards integrate with GenPageConfig and PageRenderer
- **[layout-patterns.mmd](./layout-patterns.mmd)** - Common layout patterns

## Configuration

| Property | Value | Description |
|----------|-------|-------------|
| **Grid Columns** | ${GRID_CONFIG.COLUMNS} | Total columns in grid system |
| **Default Gap** | ${GRID_CONFIG.DEFAULT_GAP} | Space between grid items |
| **Container Types** | ${Object.values(CONTAINER_TYPES).length} | page, tab, card, modal, inline |
| **Layout Patterns** | ${Object.keys(LAYOUT_PATTERNS).length} | Pre-defined common layouts |

## Usage

Import standards in your components:

\`\`\`javascript
import { validatePosition, CONTAINER_TYPES, LAYOUT_PATTERNS } from '../architecture/grid-standards.js';

export const myComponent = {
  container: CONTAINER_TYPES.TAB,
  position: LAYOUT_PATTERNS.CARD_TOP_LEFT,
  // ... rest of component
};
\`\`\`

---

*To regenerate: run \`node src/architecture/generate-grid-docs.js\`*
`;

  const readmePath = join(docsPath, 'README.md');
  writeFileSync(readmePath, readmeContent, 'utf8');
  console.log(`✅ Generated README.md`);
}

// Generate individual charts and documentation
try {
  generateIndividualCharts();
  console.log(`\n🎯 All documentation generated in docs/architecture/`);
} catch (error) {
  console.error('❌ Error generating documentation:', error);
  process.exit(1);
}