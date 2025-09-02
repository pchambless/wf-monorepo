/**
 * Component Choices Panel EventType
 * Middle column: Compact widget/container selection
 */
export const componentChoicesPanel = {
  eventType: "componentChoicesPanel",
  category: "column",
  title: "Component Choices",
  purpose: "Compact panel for selecting containers and widgets to add to eventTypes",

  components: [
    // Containers Section
    {
      id: "sectionContainers",
      type: "section",
      container: "section",
      position: { row: 1, col: 1 },
      props: {
        title: "Containers",
        collapsible: true,
        defaultExpanded: true,
        items: [
          { id: "tabs", label: "Tabs", icon: "folder", description: "Tab containers" },
          { id: "containers", label: "Containers", icon: "box", description: "Layout containers" },
          { id: "modals", label: "Modals", icon: "window", description: "Modal dialogs" },
          { id: "other", label: "Other", icon: "dots", description: "Other containers" }
        ],
        style: {
          marginBottom: "12px"
        }
      }
    },

    // Widgets Section
    {
      id: "widgetsSection",
      type: "compactSection",
      container: "section",
      position: { row: 2, col: 1 },
      props: {
        title: "Widgets",
        collapsible: true,
        defaultExpanded: true,
        items: [
          { id: "grids", label: "Grids", icon: "table", description: "Data grids" },
          { id: "forms", label: "Forms", icon: "document-text", description: "Form layouts" },
          { id: "select", label: "Select", icon: "chevron-down", description: "Dropdown selects" },
          { id: "textArea", label: "TextArea", icon: "document", description: "Multi-line text" },
          { id: "text", label: "Text", icon: "pencil", description: "Text inputs" },
          { id: "date", label: "Date", icon: "calendar", description: "Date pickers" },
          { id: "other", label: "Other", icon: "dots", description: "Other widgets" }
        ],
        style: {
          marginBottom: "12px"
        }
      }
    },

    // Quick Actions Section
    {
      id: "quickActionsSection",
      type: "compactSection",
      container: "section",
      position: { row: 3, col: 1 },
      props: {
        title: "Quick Actions",
        collapsible: true,
        defaultExpanded: false,
        items: [
          { id: "saveAll", label: "Save All", icon: "save", description: "Save all changes" },
          { id: "generateConfig", label: "Generate", icon: "cog", description: "Generate pageConfigs" },
          { id: "preview", label: "Preview", icon: "eye", description: "Preview in browser" }
        ]
      }
    }
  ],

  workflowTriggers: {
    onContainerSelect: [
      "addContainerToCurrentEventType",
      "refreshComponentDetail"
    ],
    onWidgetSelect: [
      "addWidgetToCurrentEventType",
      "refreshComponentDetail"
    ],
    onQuickAction: [
      "executeQuickAction",
      "showActionResult"
    ]
  },

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};