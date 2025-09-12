export const tabLeafDtl = {
  eventType: "tabLeafDtl",
  category: "tab",
  title: "Leaf Detail",
  cluster: "STUDIO", 
  purpose: "Properties tab for qry-based eventTypes with field generation",
  
  // Empty components - populated dynamically by workflow
  components: [],
  
  workflowTriggers: {
    onEventTypeSelect: [
      { action: "loadCards", category: "dynamic" }  // Category will be determined from selected eventType
    ]
  },
  
  fields: [],
  hasComponents: true,
  hasWorkflows: true
};