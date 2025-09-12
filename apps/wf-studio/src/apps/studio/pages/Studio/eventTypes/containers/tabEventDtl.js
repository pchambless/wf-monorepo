export const tabEventDtl = {
  eventType: "tabEventDtl",
  category: "tab",
  title: "Component Detail",
  cluster: "STUDIO",
  purpose: "Detailed component editor with dynamic cards based on selected component",
  
  components: [
    {
      id: "componentInfo",
      type: "text",
      container: "inline",
      position: { row: 1, col: 1 },
      props: {
        title: "Component Information", 
        content: "Select a component from the Mermaid Page to view and edit its details",
        style: {
          padding: "20px",
          backgroundColor: "#f0f4ff",
          borderRadius: "4px",
          textAlign: "center",
          color: "#666"
        }
      }
    },
    {
      id: "dynamicCards",
      type: "container",
      container: "inline", 
      position: { row: 2, col: 1 },
      props: {
        title: "Component Cards",
        style: {
          marginTop: "20px"
        }
      },
      components: []
    }
  ],

  workflowTriggers: {
    onComponentSelected: ["loadComponentCards", "refreshComponentDetail"],
    onCardChange: ["saveComponentChanges", "updatePageConfig"]
  },

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};