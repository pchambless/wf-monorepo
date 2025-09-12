export const gridOverrides = {
  category: "card",
  title: "Grid Column Overrides",
  cluster: "Format",
  purpose: "Customize auto-generated grid columns - width, formatting, and display",

  workflowTriggers: {
    onColumnOverride: ["updateColumnOverrideArray", "refreshPreview"],
    onResetColumn: ["removeColumnOverride", "refreshPreview"],
    onReorderColumns: ["updateColumnOrder", "refreshPreview"]
  },

  fields: [
    {
      name: "columnOverrides",
      label: "Column Overrides",
      type: "columnOverridesArray", // Custom field type for grid column customization
      required: false,
      percentage: "100%",
      placeholder: "No column overrides yet - generate fields first",
      hint: "Customize auto-generated grid columns (width, headers, formatting)"
    }
  ]
};