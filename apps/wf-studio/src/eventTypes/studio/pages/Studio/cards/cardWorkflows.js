export const cardWorkflows = {
  category: "card",
  title: "Standalone Workflows",
  cluster: "STUDIO",
  purpose: "Configure standalone workflows that can be called programmatically",
  
  workflowTriggers: {
    onWorkflowAdd: ["addStandaloneWorkflow", "refreshPreview"],
    onWorkflowRemove: ["removeStandaloneWorkflow", "refreshPreview"],
    onWorkflowReorder: ["reorderWorkflows", "refreshPreview"]
  },
  
  fields: [
    {
      name: "workflows",
      label: "Workflows",
      type: "workflowsArray", // Custom field type for standalone workflow management
      required: false,
      percentage: "100%",
      placeholder: "No standalone workflows configured",
      hint: "Define workflows that can be called independently (createPlan, validateData, etc.)"
    }
  ]
};