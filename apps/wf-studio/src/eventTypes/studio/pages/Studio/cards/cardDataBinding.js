export const cardDataBinding = {
  category: "card",
  title: "Data Binding",
  cluster: "STUDIO",
  purpose: "Query configuration and field generation with manual overrides",
  workflowTriggers: {
    onQryChange: ["validateQryExists", "clearGeneratedFields"],
    onGenerateFields: ["callUnifiedGenFieldsWorkflow", "populatePreview"],
    onApplyChanges: ["updateEventTypeWithPreview", "saveEventTypeFile"]
  },
  fields: [
    {
      name: "qry",
      label: "Query Reference",
      type: "text",
      required: true,
      row: 1,
      percentage: "60%",
      placeholder: "Server query name."
    },
    {
      name: "purpose",
      label: "Purpose",
      type: "textarea",
      row: 1,
      percentage: "40%",
      placeholder: "Describe what this component does..."
    }
    // Auto-generated fields will be populated here by Generate Fields workflow
  ],
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