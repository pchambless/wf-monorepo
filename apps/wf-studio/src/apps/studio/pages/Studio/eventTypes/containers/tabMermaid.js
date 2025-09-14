export const tabMermaid = {
  eventType: "tabMermaid",
  category: "tab",
  title: "Mermaid Page",
  cluster: "STUDIO",
  purpose: "Interactive mermaid chart for page hierarchy navigation",

  components: [
    {
      id: "chartMermaid"
    }
  ],

  workflowTriggers: {
    onRefresh: ["refresh"]
  },

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};