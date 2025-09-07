/**
 * Studio App Selector Widget
 * Allows selection of apps in Studio interface
 */
export const selectApp = {
  category: "select",
  title: "App Selector",
  cluster: "STUDIO",
  purpose: "Select app for Studio page/eventType navigation",
  workflowTriggers: {
    onLoad: ["execApps"],
    onChange: [
      { action: "setVal", param: "appID" },
      { action: "refresh", targets: ["selectPage"] },
      { action: "clearVals", params: ["pageID", "eventTypeID"] }
    ]
  }
};
