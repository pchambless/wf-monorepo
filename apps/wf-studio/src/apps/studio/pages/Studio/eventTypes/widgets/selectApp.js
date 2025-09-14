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
    onLoad: [
      { action: "studioApiCall('execApps', {})" }
    ],
    onChange: [
      { action: "setVal('appID', {{this.value}})" },
      { action: "refresh(['selectPage'])" },
      { action: "clearVals(['pageID', 'eventTypeID'])" }
    ]
  }
};
