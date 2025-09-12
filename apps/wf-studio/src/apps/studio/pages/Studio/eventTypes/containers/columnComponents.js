/**
 * Component Choices Panel Column
 * Middle column showing available components/templates for selection
 */
export const columnComponents = {
  eventType: "columnComponents",
  category: "column",
  title: "Component Choices",
  cluster: "Studio",
  purpose: "Display component palette and template options for page building",

  // Column positioning and sizing
  position: { col: { start: 3, span: 2 }, row: { start: 1, span: 10 } },
  props: {
    title: "Component Choices",
    style: {
      borderRight: "1px solid #e0e0e0",
      backgroundColor: "#fafafa",
      padding: "12px"
    }
  },

  // Child components for the component choices panel
  components: [
    {
      id: "gridComponentChoices",
      container: "inline",
      position: { row: 1, col: 1 }
    }
  ],

  workflowTriggers: {
    onLoad: ["execTemplates"],
    onComponentSelect: ["selectComponentForDesign"]
  }
};