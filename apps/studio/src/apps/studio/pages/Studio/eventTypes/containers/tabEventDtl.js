export const tabEventDtl = {
  eventType: "tabEventDtl",
  category: "tab",
  title: "Component Detail",
  cluster: "STUDIO",
  purpose: "Detailed component editor with dynamic cards based on selected component",

  components: [
    {
      id: "textHeader",
      type: "textLine",
      container: "inline",
      position: { row: 1, col: 1 },
      props: {
        prefix: "Event Type: ",
        contextKey: "eventTypeID",
        size: "large",
        color: "primary",
        align: "left",
        variant: "selected-component"
      }
    },
    {
      id: "tabsEventDetail",
      type: "tabs",
      container: "inline",
      position: { row: 2, col: 1 },
      props: {
        style: {
          marginTop: "20px"
        }
      },
      components: [
        {
          id: "containerEventStructure",
          eventTypeRef: 6,  // References eventTypeRegistry[6]
          container: "tab"
        },
        {
          id: "containerEventCards",
          eventTypeRef: 7,  // References eventTypeRegistry[7]
          container: "tab"
        },
        {
          id: "containerEventChanges",
          eventTypeRef: 8,  // References eventTypeRegistry[8]
          container: "tab"
        }
      ]
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