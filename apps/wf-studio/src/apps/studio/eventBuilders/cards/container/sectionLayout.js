export const sectionLayout = {
  title: "Section Layout",
  cluster: "Container",
  purpose: "Configure section grouping, headers and visual styling",

  fields: [
    {
      name: "header",
      label: "Section Header",
      type: "text",
      percentage: "100%",
      placeholder: "Optional section header text",
      helpText: "Display text at top of section"
    },
    {
      name: "collapsible",
      label: "Collapsible",
      type: "boolean",
      percentage: "33%",
      default: false,
      helpText: "Allow users to expand/collapse section content"
    },
    {
      name: "bordered",
      label: "Show Border",
      type: "boolean",
      percentage: "33%",
      default: true,
      helpText: "Add border around section content"
    },
    {
      name: "padding",
      label: "Content Padding",
      type: "select",
      percentage: "33%",
      options: [
        { value: "none", label: "None" },
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" }
      ],
      default: "md"
    },
    {
      name: "defaultExpanded",
      label: "Default Expanded",
      type: "boolean",
      percentage: "50%",
      default: true,
      helpText: "Initial expanded state (only for collapsible sections)",
      conditional: { field: "collapsible", value: true }
    },
    {
      name: "variant",
      label: "Style Variant",
      type: "select",
      percentage: "50%",
      options: [
        { value: "default", label: "Default" },
        { value: "card", label: "Card Style" },
        { value: "outlined", label: "Outlined" },
        { value: "filled", label: "Filled Background" }
      ],
      default: "default"
    }
  ],

  workflowTriggers: {
    onToggle: ["toggleSection", "refreshPreview"],
    onHeaderChange: ["updateSectionHeader"]
  },

  validation: {
    padding: {
      enum: ["none", "sm", "md", "lg"]
    },
    variant: {
      enum: ["default", "card", "outlined", "filled"]
    }
  }
};