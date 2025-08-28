/**
 * Studio Sidebar EventType
 * Left column: App selector + Page list + EventType hierarchy
 */
export const studioSidebar = {
  eventType: "studioSidebar",
  category: "sidebar", 
  title: "App Page Designer",
  purpose: "App selection, page navigation, and eventType hierarchy display",

  components: [
    // App Selector
    {
      id: "appSelector",
      type: "select",
      container: "inline",
      position: { row: 1, col: 1 },
      props: {
        title: "Select App",
        options: ["plans", "client", "admin"],
        defaultValue: "plans",
        style: {
          marginBottom: "16px",
          width: "100%"
        }
      }
    },

    // Page List
    {
      id: "pageList", 
      type: "select",
      container: "inline",
      position: { row: 2, col: 1 },
      props: {
        title: "Page List (select)",
        dataSource: "currentAppPages",
        style: {
          marginBottom: "16px", 
          width: "100%"
        }
      }
    },

    // EventType Hierarchy (Accordion)
    {
      id: "eventTypeHierarchy",
      type: "accordion",
      container: "accordion", 
      position: { row: 3, col: 1 },
      span: { cols: 1, rows: 10 },
      props: {
        title: "Accordion List of eventTypes",
        expandMultiple: true,
        sections: [
          {
            id: "pageSection",
            title: "Page",
            items: ["tabs", "layout components"]
          },
          {
            id: "tabsSection", 
            title: "-- tabs",
            items: ["grids and forms", "other widgets"]
          },
          {
            id: "gridsFormsSection",
            title: "-- grids and forms", 
            items: ["formPlan", "gridPlans", "formPlanComm"]
          },
          {
            id: "widgetsSection",
            title: "-- other widgets",
            items: ["btnCreate", "selectPlanStatus"]
          }
        ]
      }
    }
  ],

  workflowTriggers: {
    onAppChange: [
      "loadAppEventTypes",
      "refreshPageList",
      "clearSelection"
    ],
    onPageSelect: [
      "loadPageEventTypes", 
      "refreshHierarchy"
    ],
    onEventTypeSelect: [
      "loadEventTypeDetail",
      "highlightInHierarchy"
    ]
  },

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};