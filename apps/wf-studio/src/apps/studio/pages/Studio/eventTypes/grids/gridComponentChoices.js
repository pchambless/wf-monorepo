/**
 * Component Choices Grid
 * Displays available component templates in grid format for selection
 */
export const gridComponentChoices = {
  eventType: "gridComponentChoices", 
  category: "grid",
  title: "Available Components",
  cluster: "Studio",
  purpose: "Grid showing all available component templates organized by category",

  qry: "componentTemplates", // Query to load available templates

  // Auto-generated fields from template registry
  fields: [
    {
      name: "category",
      label: "Type",
      type: "text",
      width: "80px"
    },
    {
      name: "title", 
      label: "Template Name",
      type: "text",
      width: "150px"
    },
    {
      name: "purpose",
      label: "Description", 
      type: "text",
      width: "200px"
    },
    {
      name: "detailCards",
      label: "Cards",
      type: "array",
      width: "100px"
    }
  ],

  workflowTriggers: {
    onRefresh: ["execEvent:componentTemplates"],
    onRowSelect: ["selectTemplate", "showTemplateDetail"]
  }
};