export const tabsWorkArea = {
  eventType: "tabsWorkArea", 
  category: "tabs",
  title: "Work Area Tabs",
  cluster: "STUDIO",
  purpose: "Main tabbed interface for Studio work area",
  
  components: [
    {
      id: "tabLeafDtl",
      container: "tab",
      position: { row: 1, col: 1 },
      props: {
        label: "Component Detail",
        icon: "edit",
        defaultActive: true
      }
    }
  ],

  workflowTriggers: {
    onTabChange: ["saveCurrentWork", "loadTabContent"],
    onLoad: ["initializeWorkArea"]
  },

  fields: [],
  hasComponents: true,
  hasWorkflows: true
};