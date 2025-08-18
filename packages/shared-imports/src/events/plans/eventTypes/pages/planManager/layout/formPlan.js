export const formPlan = {
  eventID: 105,
  eventType: "formPlan",
  category: "form",
  title: "Plan Detail",
  cluster: "PLANS",
  event: "queryPlan",
  displayConfig: "/home/paul/wf-monorepo-new/analysis-n-document/genOps/workflows/output/plans/formPlan-display.js",
  purpose: "Form layout for plan details",

  fields: [
    { name: "id", type: "number", label: "ID", readonly: true, width: "50%" },
    { name: "cluster", type: "select", label: "Cluster", required: true, width: "50%" },
    { name: "name", type: "text", label: "Plan Name", required: true, width: "100%" },
    { name: "status", type: "select", label: "Status", required: true, width: "50%" },
    { name: "priority", type: "select", label: "Priority", required: true, width: "50%" },
    { name: "description", type: "textarea", label: "Description", rows: 4, width: "100%" },
    { name: "comments", type: "textarea", label: "Comments", rows: 3, width: "100%" },
    { name: "assigned_to", type: "select", label: "Assigned To", width: "50%" }
  ],

  validation: {
    name: { required: true, minLength: 3, maxLength: 100 },
    cluster: { required: true },
    status: { required: true },
    priority: { required: true }
  },

  layout: {
    columns: 2,
    spacing: "medium"
  }
}