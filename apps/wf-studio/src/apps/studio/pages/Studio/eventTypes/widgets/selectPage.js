/**
 * Studio Page Selector Widget  
 * Allows selection of pages within selected app
 */
export const selectPage = {
  category: "select",
  title: "Page Selector",
  cluster: "STUDIO",
  purpose: "Select page within chosen app for eventType navigation",

  workflowTriggers: {
    onRefresh: ["execPages"],
    onChange: [
      { action: "setVal", param: "pageID" },
      { action: "refresh", targets: ["eventTypeHierarchy"] },
      { action: "clearVals", params: ["eventTypeID"] }
    ]
  },

};