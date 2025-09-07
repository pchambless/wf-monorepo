export const modalLayout = {
  title: "Modal Layout",
  cluster: "Container",
  purpose: "Configure modal dialog size, behavior and appearance",

  fields: [
    {
      name: "size",
      label: "Modal Size",
      type: "select",
      required: true,
      percentage: "50%",
      options: [
        { value: "sm", label: "Small (400px)" },
        { value: "md", label: "Medium (600px)" },
        { value: "lg", label: "Large (800px)" },
        { value: "xl", label: "Extra Large (1000px)" },
        { value: "fullscreen", label: "Fullscreen" }
      ],
      default: "md"
    },
    {
      name: "backdrop",
      label: "Show Backdrop",
      type: "boolean",
      percentage: "25%",
      default: true,
      helpText: "Show darkened background behind modal"
    },
    {
      name: "dismissible",
      label: "Dismissible",
      type: "boolean",
      percentage: "25%",
      default: true,
      helpText: "Allow closing by clicking backdrop or ESC key"
    },
    {
      name: "centered",
      label: "Vertically Centered",
      type: "boolean",
      percentage: "50%",
      default: true,
      helpText: "Center modal vertically in viewport"
    },
    {
      name: "scrollable",
      label: "Scrollable Content",
      type: "boolean",
      percentage: "50%",
      default: true,
      helpText: "Allow modal content to scroll if too tall"
    }
  ],

  workflowTriggers: {
    onOpen: ["initializeModal", "focusFirstInput"],
    onClose: ["cleanupModal", "returnFocus"],
    onBackdropClick: ["handleDismiss"]
  },

  validation: {
    size: {
      required: true,
      enum: ["sm", "md", "lg", "xl", "fullscreen"]
    }
  }
};