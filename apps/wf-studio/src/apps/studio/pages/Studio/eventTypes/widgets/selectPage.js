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
    onRefresh: [
      { action: "studioApiCall('execPages', [\"getVal('appID')\"])" },
    ],
    onChange: [
      { action: "setVal('pageID', {{this.value}})" },
      { action: "refresh(['chartMermaid'])" },
      { action: "clearVals(['eventTypeID'])" }
    ]
  },

};