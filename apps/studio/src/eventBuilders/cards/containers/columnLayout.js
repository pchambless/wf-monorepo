export const columnLayout = {
  title: "Column Layout",
  cluster: "Container",
  purpose: "Configure column positioning and sizing properties",

  fields: [
    {
      name: "position",
      label: "Position",
      type: "select",
      required: true,
      percentage: "50%",
      options: [
        { value: "left", label: "Left" },
        { value: "middle", label: "Middle" },
        { value: "right", label: "Right" }
      ],
      placeholder: "Select column position"
    },
    {
      name: "width",
      label: "Fixed Width",
      type: "text",
      percentage: "25%",
      placeholder: "280px",
      helpText: "Fixed width (e.g., 280px, 300px). Leave empty for flex sizing."
    },
    {
      name: "flex",
      label: "Flex",
      type: "number",
      percentage: "25%",
      placeholder: "1",
      helpText: "Flex grow value. Only used if width is not set."
    },
    {
      name: "scrollable",
      label: "Scrollable",
      type: "boolean",
      percentage: "100%",
      default: true,
      helpText: "Allow vertical scrolling if content overflows"
    }
  ],

  workflowTriggers: {
    onPositionChange: ["updateColumnOrder", "refreshPreview"]
  },

  validation: {
    position: {
      required: true,
      enum: ["left", "middle", "right"]
    },
    width: {
      pattern: "^\\d+(px|%)$",
      message: "Width must be in px or % format (e.g., 280px, 25%)"
    },
    flex: {
      type: "number",
      min: 0,
      max: 10
    }
  }
};