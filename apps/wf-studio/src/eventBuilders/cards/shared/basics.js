export const basics = {
  category: "card",
  title: "Basic Properties",
  cluster: "Shared",
  purpose: "Basic eventType properties - category, title, cluster",
  workflowTriggers: {
    onCategoryChange: ["genMermaidFile"],
  },
  fields: [
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      percentage: "50%",
      options: "getCategoryOptions"
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
      percentage: "50%",
      breakAfter: true,
      placeholder: "User-friendly display name"
    },
    {
      name: "purpose",
      label: "Purpose",
      type: "textarea",
      percentage: "100%",
      breakAfter: true,
      placeholder: "Describe what this component does..."
    },
    {
      name: "cluster",
      label: "Cluster",
      type: "text",
      percentage: "100%",
      placeholder: "PLANS, USERS, etc."
    }
  ]
};