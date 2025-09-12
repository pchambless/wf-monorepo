export const tabsWorkArea = {
  eventType: "tabsWorkArea",
  category: "tab",
  title: "Work Area Tabs",
  cluster: "STUDIO",
  purpose: "Main tabbed interface for Studio work area",

  components: [
    {
      id: "tabMermaid",
      container: "tab",
      position: { row: 1, col: 2 },
      props: {
        label: "Mermaid Chart",
        icon: "account_tree"
      }
    },
    {
      id: "tabEventDtl",
      container: "tab",
      position: { row: 1, col: 3 },
      props: {
        label: "Component Detail",
        icon: "edit"
      }
    },
    {
      id: "tabPageView",
      container: "tab",
      position: { row: 1, col: 4 },
      props: {
        label: "Page Renderer",
        icon: "preview"
      }
    }
  ],

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};