export const containerEventChanges = {
  eventType: "containerEventChanges",
  category: "container",
  title: "Compare Changes",
  cluster: "STUDIO",
  purpose: "Show before/after diff view of eventType changes",

  components: [
    {
      id: "changesHeader",
      type: "textLine",
      container: "inline",
      position: { row: 1, col: 1 },
      props: {
        text: "EventType Changes Comparison",
        size: "medium",
        color: "secondary",
        align: "left"
      }
    },
    {
      id: "diffViewer",
      type: "container",
      container: "inline",
      position: { row: 2, col: 1 },
      props: {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          padding: "20px",
          backgroundColor: "#fff7ed",
          borderRadius: "4px"
        }
      },
      components: [
        {
          id: "beforeSection",
          type: "text",
          props: {
            content: "BEFORE: Original eventType structure",
            style: {
              padding: "12px",
              backgroundColor: "#fef2f2",
              borderRadius: "4px",
              fontFamily: "monospace"
            }
          }
        },
        {
          id: "afterSection",
          type: "text",
          props: {
            content: "AFTER: Modified eventType structure",
            style: {
              padding: "12px",
              backgroundColor: "#f0fdf4",
              borderRadius: "4px",
              fontFamily: "monospace"
            }
          }
        }
      ]
    }
  ],

  workflowTriggers: {
    onLoad: ["loadOriginalEventType", "loadModifiedEventType"],
    onCompare: ["generateDiffView", "highlightChanges"],
    onRevert: ["confirmRevert", "restoreOriginal"]
  },

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};