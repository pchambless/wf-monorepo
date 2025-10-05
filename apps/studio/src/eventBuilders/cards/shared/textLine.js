export const textLineProps = {
  category: "textLine",
  title: "Text Line Properties",
  cluster: "cards",
  purpose: "Display a single line of text with dynamic content",

  fields: [
    {
      id: "text",
      type: "text",
      label: "Text Content",
      required: true,
      placeholder: "Enter text to display"
    },
    {
      id: "contextKey",
      type: "text",
      label: "Context Key",
      required: false,
      placeholder: "Optional: context store key for dynamic content"
    },
    {
      id: "prefix",
      type: "text",
      label: "Prefix Text",
      required: false,
      placeholder: "Text to show before dynamic content"
    },
    {
      id: "size",
      type: "select",
      label: "Text Size",
      options: ["small", "medium", "large", "xlarge"],
      defaultValue: "medium"
    },
    {
      id: "color",
      type: "text",
      label: "Text Color",
      defaultValue: "#333",
      placeholder: "CSS color value"
    },
    {
      id: "align",
      type: "select",
      label: "Text Alignment",
      options: ["left", "center", "right"],
      defaultValue: "left"
    }
  ],

  workflowTriggers: {
    onChange: ["validateTextLineProps", "updatePreview"],
    onSave: ["saveTextLineConfiguration"],
    onContextChange: ["refreshTextContent"]
  }
};