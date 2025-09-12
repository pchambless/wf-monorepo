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
      { action: "setVal", param: "pageID", value: "{{selected.value}}" },
      { action: "refresh", targets: ["chartMermaid"] },
      { action: "clearVals", params: ["eventTypeID"] }
    ]
  },

};