export const ComponentLayout = {
  category: "card",
  title: "Component Layout",
  cluster: "Component",
  purpose: "Edit components array for container eventTypes",

  workflowTriggers: {
    onComponentAdd: ["addComponentToArray", "refreshPreview"],
    onComponentRemove: ["removeComponentFromArray", "refreshPreview"],
    onComponentReorder: ["updateComponentsArray", "refreshPreview"]
  },

  fields: [
    {
      name: "components",
      label: "Components",
      type: "componentsArray", // Custom field type for editing components array
      required: false,
      percentage: "100%",
      placeholder: "No components added yet",
      hint: "Add and configure child components for this container"
    }
  ]
};