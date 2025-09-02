export const gridTemplate = {
  category: "grid",

  // Cards to show in Component Detail tab for grid eventTypes
  detailCards: [
    "cardBasics",           // Basic Properties (category, title, cluster, purpose)
    "cardDataBinding",      // qry + "Generate Fields" button
    "cardGridOverrides",    // Customize auto-generated grid columns
    "cardWorkflowTriggers", // Event-based triggers (onRowSelect, onRefresh, etc.)
    "cardWorkflows"         // Standalone workflows (exportData, bulkActions)
  ],

  // What PageRenderer expects for grid eventTypes
  expectedStructure: {
    category: "grid",
    title: "string",
    cluster: "string",
    purpose: "string",
    qry: "string",              // Data binding query
    fields: "array",            // Auto-generated + override attributes
    workflowTriggers: "object", // Event-based triggers (optional)
    workflows: "array"          // Standalone workflows (optional)
  },

  // Basic validation rules for eventType creation
  required: ["category", "title", "qry"],

  validation: {
    "category": {
      type: "string",
      enum: ["grid"]
    },
    "qry": {
      type: "string",
      minLength: 1
    }
  }
};