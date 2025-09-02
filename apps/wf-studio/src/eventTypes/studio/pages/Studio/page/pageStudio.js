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
  layout: "three-column",

  components: [
    // Left Column - App/Page Selector & EventType Hierarchy
    {
      id: "columnSidebar",
      type: "sidebar",
      container: "column",
      position: "left",
      width: "280px",
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
      position: "middle",
      width: "200px",
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
      type: "tabs",
      container: "tabs",
      position: "right",
      flex: 1,
      props: {
        title: "Work Area",
        defaultTab: "componentDetail",
        style: {
          backgroundColor: "#ffffff"
        }
      }
    }
  ],

  // Studio page workflow triggers
  workflowTriggers: {
    onLoad: [
      "loadAvailableApps",
      "initializeStudioState"
    ],
    onAppSelect: [
      "loadAppEventTypes",
      "refreshSidebar"
    ],
    onComponentSelect: [
      "loadComponentDetail",
      "switchToDetailTab"
    ]
  },

  fields: [], // Page-level components don't have fields
  hasComponents: true,
  hasWorkflows: true
};