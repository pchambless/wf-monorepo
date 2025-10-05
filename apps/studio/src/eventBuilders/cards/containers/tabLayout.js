export const tabLayout = {
  title: "Tab Layout",
  cluster: "Container",
  purpose: "Configure tab container orientation and behavior",

  fields: [
    {
      name: "orientation",
      label: "Orientation",
      type: "select",
      required: true,
      percentage: "50%",
      options: [
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" }
      ],
      default: "horizontal",
      placeholder: "Select tab orientation"
    },
    {
      name: "defaultActive",
      label: "Default Active Tab",
      type: "text",
      percentage: "50%",
      placeholder: "tab1",
      helpText: "ID of tab that should be active by default"
    },
    {
      name: "variant",
      label: "Style Variant",
      type: "select",
      percentage: "50%",
      options: [
        { value: "standard", label: "Standard" },
        { value: "pills", label: "Pills" },
        { value: "underline", label: "Underline" }
      ],
      default: "standard"
    },
    {
      name: "closeable",
      label: "Closeable Tabs",
      type: "boolean",
      percentage: "50%",
      default: false,
      helpText: "Allow users to close individual tabs"
    }
  ],

  workflowTriggers: {
    onTabChange: ["updateActiveTab", "refreshPreview"],
    onTabClose: ["removeTab", "updateTabsArray"]
  },

  validation: {
    orientation: {
      required: true,
      enum: ["horizontal", "vertical"]
    },
    variant: {
      enum: ["standard", "pills", "underline"]
    }
  }
};