export const buttonProps = {
  category: "button",
  title: "Button Properties",
  cluster: "cards",
  purpose: "Configure button appearance and behavior",

  fields: [
    {
      id: "label",
      type: "text",
      label: "Label",
      required: true,
      placeholder: "Enter button text"
    },
    {
      id: "size",
      type: "select",
      label: "Button Size",
      options: ["small", "medium", "large"],
      defaultValue: "medium"
    },
    {
      id: "disabled",
      type: "checkbox",
      label: "Disabled",
      defaultValue: false
    }
  ],

  workflowTriggers: {
    onChange: ["validateButtonProps", "updatePreview"],
    onSave: ["saveButtonConfiguration"]
  }
};