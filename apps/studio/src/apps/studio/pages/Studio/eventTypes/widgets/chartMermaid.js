/**
 * Studio Mermaid Chart Widget
 * Displays interactive mermaid charts from generated .mmd files
 */
import { getEndpointUrl } from '../../../../../../api/config.js';

export const chartMermaid = {
  type: "chart",
  category: "chart",
  title: "Interactive Mermaid Chart",
  cluster: "STUDIO",
  purpose: "Display interactive mermaid charts with node click handlers",

  props: {
    mermaidContent: "{{getVal('mermaidContent')}}",
    style: {
      width: "100%",
      height: "500px",
      border: "1px solid #e0e0e0",
      borderRadius: "4px"
    }
  },

  workflowTriggers: {
    onRefresh: [
      { action: "getMermaidContent({ path: 'apps/wf-studio/src/apps/studio/pages/Studio/pageMermaid.mmd' })" }
    ],
    onChange: [
      { action: "selectEventTypeTab({ nodeId: '{{this.selected.nodeId}}' })" }
    ]
  }
};