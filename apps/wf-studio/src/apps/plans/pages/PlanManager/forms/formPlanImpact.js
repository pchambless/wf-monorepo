export const formPlanImpact = {
  qry: "planImpactDtl",
  category: "form",
  title: "Plan Impact Detail",
  cluster: "IMPACTS",
  // Standard 3-trigger pattern
  workflowTriggers: {
    onRefresh: ["execEvent"],
    onSelect: ["validateAccess", "refreshContext"],
    onCreate: ["createRecord"]
  },
  purpose: "Get detailed information for a specific plan impact",
}