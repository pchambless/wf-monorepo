export const cardDataBinding = {
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
  fieldOverrides: [
    // User customizations will be added here
    // Example: { fieldName: "email", percentage: "50%", row: 2 }
  ],
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