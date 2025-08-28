/**
 * Work Area Tabs EventType  
 * Right column: Component Detail + Mermaid Chart + Page Renderer tabs
 */
export const workAreaTabs = {
  eventType: "workAreaTabs",
  category: "tabs",
  title: "Work Area Tabs", 
  purpose: "Tabbed interface for component editing, visualization, and preview",

  components: [
    // Component Detail Tab
    {
      id: "componentDetailTab",
      type: "tab",
      container: "tab",
      props: {
        title: "Component Detail", 
        key: "componentDetail",
        icon: "cog",
        description: "Edit selected eventType properties and fields",
        isDefault: true
      },
      components: [
        {
          id: "componentDetailForm",
          type: "dynamicForm",
          position: { row: 1, col: 1 },
          span: { cols: 1, rows: 1 },
          props: {
            title: "Component Properties",
            dataSource: "selectedEventType",
            formMode: "edit",
            emptyState: "Select an eventType to view component details",
            sections: [
              {
                title: "Basic Properties",
                fields: ["eventType", "category", "title", "purpose"]
              },
              {
                title: "Field Configuration", 
                fields: ["fields"],
                fieldEditor: true // Special field array editor
              },
              {
                title: "Layout & Components",
                fields: ["components", "workflowTriggers"]
              }
            ]
          }
        }
      ]
    },

    // Mermaid Chart Tab
    {
      id: "mermaidChartTab",
      type: "tab",
      container: "tab",
      props: {
        title: "Mermaid Chart of Page",
        key: "mermaidChart", 
        icon: "chart-bar",
        description: "Visual hierarchy of current page layout"
      },
      components: [
        {
          id: "mermaidRenderer",
          type: "mermaid", 
          position: { row: 1, col: 1 },
          span: { cols: 1, rows: 1 },
          props: {
            title: "Current Layout Hierarchy",
            dataSource: "currentPageStructure",
            chartType: "hierarchy",
            autoRefresh: true,
            emptyState: "Select a page to view layout hierarchy",
            mermaidConfig: {
              theme: "default",
              direction: "TD"
            }
          }
        }
      ]
    },

    // Page Renderer Tab
    {
      id: "pageRendererTab", 
      type: "tab",
      container: "tab",
      props: {
        title: "Page Renderer",
        key: "pageRenderer",
        icon: "eye", 
        description: "Live preview of page structure"
      },
      components: [
        {
          id: "pagePreview",
          type: "pageRenderer",
          position: { row: 1, col: 1 },
          span: { cols: 1, rows: 1 },
          props: {
            title: "Live Page Preview",
            dataSource: "currentPageConfig",
            renderMode: "preview", 
            scale: 0.75,
            emptyState: "Select a page to preview its structure",
            showGrid: true,
            interactive: false
          }
        }
      ]
    }
  ],

  workflowTriggers: {
    onTabChange: [
      "refreshTabContent",
      "updateActiveWorkArea"
    ],
    onComponentSave: [
      "validateEventType",
      "saveEventTypeToFile", 
      "regeneratePageConfig",
      "refreshAllTabs"
    ],
    onFieldEdit: [
      "updateFieldDefinition",
      "refreshPreview"
    ]
  },

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};