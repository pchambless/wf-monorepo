# Batch Mapping - Component Architecture & Visualization

## User Idea
Fix the btchMapping page representation in our system architecture. Currently shows as separate pages in mermaid charts, but it's actually a single page with multiple interactive UI components that don't follow standard navigation patterns.

**Current Issue:**
- btchMapRcpeList, btchMapAvailable, btchMapMapped appear as separate pages
- They're actually UI components within single btchMapping page
- Complex drag-and-drop interactions between components
- Component-level data flow vs navigation flow needs proper representation

**Actual Flow:**
- page: btchMapping
- Components:
  - ui:Grid -> btchMapRcpeList - click and populate other grids
  - ui:Grid -> btchMapAvailable - drag/drop to btchMapMapped (refresh both)
  - ui:Grid -> btchMapMapped - drag/drop to btchMapAvailable (refresh both)

**Scope:** Will likely need to touch views, eventTypes, directives, UI components, and interaction patterns. May require multiple phases.