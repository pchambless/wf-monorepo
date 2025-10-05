export const formOverrides = {
  category: "card",
  title: "Form Field Overrides",
  cluster: "Format",
  purpose: "Customize auto-generated form fields - layout, types, and positioning",

  workflowTriggers: {
    onFieldOverride: ["updateFieldOverrideArray", "refreshPreview"],
    onResetField: ["removeFieldOverride", "refreshPreview"],
    onReorderFields: ["updateFieldOrder", "refreshPreview"]
  },

  fields: [
    {
      name: "fieldOverrides",
      label: "Field Overrides",
      type: "fieldOverridesArray", // Custom field type for form field customization
      required: false,
      percentage: "100%",
      placeholder: "No field overrides yet - generate fields first",
      hint: "Customize auto-generated form fields (layout, types, validation)"
    }
  ]
};