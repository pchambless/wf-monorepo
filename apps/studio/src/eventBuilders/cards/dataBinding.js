export const dataBinding = {
  category: "card",
  title: "Data Binding",
  cluster: "cards",
  purpose: "Query configuration and field generation with manual overrides",
  workflowTriggers: {
    onQryChange: ["validateQryExists", "clearGeneratedFields"],
    onGenerateFields: ["callUnifiedGenFieldsWorkflow", "populatePreview"],
    onApplyChanges: ["updateEventTypeWithPreview", "saveEventTypeFile"]
  },
  fields: [],
  actions: [
    {
      label: "Generate Fields",
      action: "generateFields",
      type: "primary"
    },
    {
      label: "Save Changes",
      action: "saveChanges",
      type: "secondary"
    }
  ]
};