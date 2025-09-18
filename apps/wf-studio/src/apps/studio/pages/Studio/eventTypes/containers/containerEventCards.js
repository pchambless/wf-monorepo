export const containerEventCards = {
  eventType: "containerEventCards",
  category: "container",
  title: "Component Cards",
  cluster: "STUDIO",
  purpose: "Dynamic cards based on selected component type for editing properties",

  components: [
    {
      id: "cardsHeader",
      type: "textLine",
      container: "inline",
      position: { row: 1, col: 1 },
      props: {
        text: "Component Configuration Cards",
        size: "medium",
        color: "secondary",
        align: "left"
      }
    },
    {
      id: "dynamicCardContainer",
      type: "container",
      container: "inline",
      position: { row: 2, col: 1 },
      props: {
        style: {
          padding: "20px",
          backgroundColor: "#f0f4ff",
          borderRadius: "4px"
        }
      },
      components: [
        {
          id: "cardPlaceholder",
          type: "text",
          props: {
            content: "Dynamic component cards will be rendered here based on selected component type",
            style: { textAlign: "center", color: "#666" }
          }
        }
      ]
    }
  ],

  workflowTriggers: {
    onComponentSelected: ["loadComponentCards", "generateDynamicCards"],
    onCardSave: ["validateCardData", "updateComponentConfig"],
    onCardReset: ["reloadOriginalConfig"]
  },

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};