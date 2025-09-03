/**
 * Studio Page Selector Widget  
 * Allows selection of pages within selected app
 */
export const selectPage = {
  category: "select",
  title: "Page Selector",
  cluster: "STUDIO", 
  purpose: "Select page within chosen app for eventType navigation",

  // Studio API endpoint with dynamic app parameter
  apiEndpoint: "/api/studio/pages",
  
  workflowTriggers: {
    onRefresh: ["execPages"],
    onChange: [
      { action: "setVal", param: "pageID" },
      { action: "refresh", targets: ["eventTypeHierarchy"] },
      { action: "clearVals", params: ["eventTypeID"] }
    ]
  },
  
  // UI configuration
  placeholder: "Select Page...",
  valueKey: "id",
  labelKey: "label",
  
  // Depends on appID being set
  dependencies: ["appID"]
};