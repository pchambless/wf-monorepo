export const tabPageView = {
  eventType: "tabPageView",
  category: "tab", 
  title: "Page Rendered",
  cluster: "STUDIO",
  purpose: "Live preview of the page being designed",
  
  components: [
    {
      id: "pagePreview",
      type: "iframe",
      container: "inline",
      position: { row: 1, col: 1 },
      props: {
        title: "Live Page Preview",
        src: "/preview", // Will be dynamically set
        style: {
          width: "100%",
          height: "600px",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          backgroundColor: "#ffffff"
        }
      }
    },
    {
      id: "previewControls",
      type: "container",
      container: "inline",
      position: { row: 2, col: 1 },
      props: {
        style: {
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px"
        }
      },
      components: [
        {
          id: "refreshPreview",
          type: "button",
          props: {
            label: "Refresh Preview",
            style: {
              marginRight: "10px"
            }
          },
          workflowTriggers: {
            onClick: ["refreshPagePreview"]
          }
        }
      ]
    }
  ],

  workflowTriggers: {
    // TODO: Enable after core workflow is working
    // onLoad: ["loadPagePreview"],
    // onPageConfigChange: ["updatePreview"]
  },

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};