export const formTemplate = {
  category: "form",

  // Cards to show in Component Detail tab for form eventTypes
  detailCards: [
    "cardBasics",           // Basic Properties (category, title, cluster, purpose)
    "cardDataBinding",      // qry + "Generate Fields" button
    "cardFormOverrides",    // Customize auto-generated form fields
    "cardWorkflowTriggers", // Event-based triggers (onSubmit, onChange, onCreate)
    "cardWorkflows"         // Standalone workflows (validateData, submitForApproval)
  ],

  // What PageRenderer expects for form eventTypes
  expectedStructure: {
    category: "form",
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
      enum: ["form"]
    },
    "qry": {
      type: "string",
      minLength: 1
    }
  }
};