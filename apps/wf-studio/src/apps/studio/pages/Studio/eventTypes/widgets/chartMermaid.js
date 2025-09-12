/**
 * Studio Mermaid Chart Widget
 * Displays interactive mermaid charts from generated .mmd files
 */
export const chartMermaid = {
  category: "chart",
  title: "Interactive Mermaid Chart",
  cluster: "STUDIO",
  purpose: "Display interactive mermaid charts with node click handlers",

  props: {
    mermaidFile: "{{getVal.appID}}/pages/{{getVal.pageID}}/pageMermaid.mmd",
    style: {
      width: "100%",
      height: "500px",
      border: "1px solid #e0e0e0",
      borderRadius: "4px"
    }
  },

  workflowTriggers: {
    onRefresh: ["refresh"],
    onChange: [
      { action: "setVal", param: "eventTypeID", value: "{{selected.nodeId}}" },
      { action: "switchTab", tabId: "tabEventDtl" },
      { action: "loadCards", category: "dynamic" },
      { action: "refresh", targets: ["componentDetail"] }
    ]
  }
};