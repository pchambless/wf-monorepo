export const formPlan = {
  category: "form",
  title: "Plan Detail",
  cluster: "PLANS",
  qry: "planDtl",
  displayConfig: "/home/paul/wf-monorepo-new/analysis-n-document/genOps/workflows/output/plans/formPlan-display.js",
  purpose: "Form layout for plan details",
  workflowTriggers: {
    onRefresh: ["execEvent"],
    onSelect: ["validateAccess", "refreshContext"],
    onCreate: ["createRecord"],
    onUpdate: ["updateRecord"]
  },
  validation: {
    name: { required: true, minLength: 3, maxLength: 100 },
    cluster: { required: true },
    status: { required: true },
    priority: { required: true }
  }
};