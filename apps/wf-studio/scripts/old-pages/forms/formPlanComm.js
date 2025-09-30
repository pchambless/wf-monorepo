export const formPlanComm = {
  category: "form",
  title: "Plan Communication Detail",
  qry: "planCommDtl",
  displayConfig: "/home/paul/wf-monorepo-new/analysis-n-document/genOps/workflows/output/plans/formPlanComm-display.js",
  cluster: "COMMUNICATE",
  // Standard 3-trigger pattern
  workflowTriggers: {
    onRefresh: ["execEvent"],
    onSelect: ["validateAccess", "refreshContext"],
    onCreate: ["createRecord"],
  },
  purpose: "Get detailed information for a specific plan communication",
}