export const containerEventStructure = {
  eventType: "containerEventStructure",
  category: "container",
  title: "EventType Structure",
  cluster: "STUDIO",
  purpose: "Display and edit the JSON structure of selected eventType",

  components: [
    {
      id: "structureHeader",
      type: "textLine",
      container: "inline",
      position: { row: 1, col: 1 },
      props: {
        text: "EventType JSON Structure",
        size: "medium",
        color: "secondary",
        align: "left"
      }
    },
    {
      id: "jsonViewer",
      type: "text",
      container: "inline",
      position: { row: 2, col: 1 },
      props: {
        content: "EventType JSON structure will be displayed here",
        style: {
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "14px"
        }
      }
    }
  ],

  workflowTriggers: {
    onLoad: ["loadSelectedEventType"],
    onEdit: ["validateEventTypeStructure", "saveEventType"]
  },

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};