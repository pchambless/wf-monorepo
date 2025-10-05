export const tabPageChart = {
  eventType: "tabPageChart",
  category: "tab",
  title: "Page Chart",
  cluster: "STUDIO",
  purpose: "Overview chart showing page structure and navigation options",
  
  components: [
    {
      id: "pageOverview",
      type: "text",
      container: "inline",
      position: { row: 1, col: 1 },
      props: {
        title: "Page Overview",
        content: "Interactive page structure overview and quick navigation",
        style: {
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px"
        }
      }
    }
  ],

  workflowTriggers: {
    onLoad: ["loadPageOverview"],
    onRefresh: ["refreshPageData"]
  },

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};