/**
 * Studio Main Page EventType
 * Defines the 3-column layout for the Studio interface
 */
export const studioPage = {
  eventType: "pageStudio",
  category: "page",
  title: "Page Design Studio",
  purpose: "Three-column layout: app/page selector + component choices + tabbed work area",
  routePath: "/studio",
  cluster: "Page",

  components: [
    // Left Column - App/Page Selector & EventType Hierarchy
    {
      id: "columnSidebar",
      type: "sidebar",
      container: "column",
      position: { col: { start: 1, span: 2 }, row: { start: 1, span: 10 } },
      props: {
        title: "Studio Sidebar",
        style: {
          backgroundColor: "#f5f5f5",
          borderRight: "1px solid #e0e0e0"
        }
      }
    },

    // Middle Column - Component Choices (Compact)
    {
      id: "columnComponents",
      type: "column",
      container: "column",
      position: { col: { start: 3, span: 2 }, row: { start: 1, span: 10 } },
      props: {
        title: "Component Choices",
        style: {
          borderRight: "1px solid #e0e0e0",
          backgroundColor: "#fafafa",
          padding: "12px"
        }
      }
    },

    // Right Column - Tabbed Work Area
    {
      id: "tabsWorkArea",
      container: "tab",
      position: { col: { start: 5, span: 6 }, row: { start: 1, span: 20 } },
      flex: 1,
      props: {
        title: "Work Area",
        style: {
          backgroundColor: "#ffffff"
        }
      }
    }
  ],

  fields: [], // Page-level components don't have fields
  hasComponents: true,
  hasWorkflows: true
};