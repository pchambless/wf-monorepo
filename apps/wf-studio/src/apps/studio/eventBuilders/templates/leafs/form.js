export const formTemplate = {
  category: "form",

  // Cards to show in Component Detail tab for form eventTypes
  detailCards: [
    "basics",           // Basic Properties (category, title, cluster, purpose)
    "dbQuery",          // Query setup + field generation + execEvent workflow
    "formOverrides",    // Customize auto-generated form fields (row/col/label/required)
    "workflowTriggers", // Event-based triggers (onSubmit, onChange, onCreate)
    "workflows"         // Standalone workflows (validateData, submitForApproval)
  ],
};