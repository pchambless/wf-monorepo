export const gridPlans = {
  category: "grid",
  title: "Plans",
  qry: "planList",
  cluster: "PLANS",
  workflowTriggers: {
    onRefresh: ["execEvent"],
    onRowSelect: [
      { action: "setContext", param: "selectedPlan" },
      { action: "refresh", targets: ["formPlan", "gridPlanComms", "gridPlanImpacts"] }
    ],
    onCreate: ["createRecord"],
    onUpdate: ["updateRecord"]
  },
  workflows: ["createPlan"],
  purpose: "Display all plans given a specific status"
}