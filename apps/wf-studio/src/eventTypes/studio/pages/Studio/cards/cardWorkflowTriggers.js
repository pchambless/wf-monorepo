export const cardWorkflowTriggers = {
  category: "card",
  title: "Workflow Triggers",
  cluster: "STUDIO",
  purpose: "Configure event-based triggers and their workflow actions",
  
  workflowTriggers: {
    onTriggerAdd: ["addWorkflowTrigger", "refreshPreview"],
    onTriggerRemove: ["removeWorkflowTrigger", "refreshPreview"],
    onActionAdd: ["addActionToTrigger", "refreshPreview"],
    onActionReorder: ["reorderTriggerActions", "refreshPreview"]
  },
  
  fields: [
    {
      name: "workflowTriggers",
      label: "Workflow Triggers",
      type: "workflowTriggersObject", // Custom field type for trigger management
      required: false,
      percentage: "100%",
      placeholder: "No workflow triggers configured",
      hint: "Define what workflows execute on user interactions (onSelect, onCreate, etc.)"
    }
  ]
};