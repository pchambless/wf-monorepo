export const gridPlanComms =
{
  category: "grid",
  title: "Communications",
  qry: "planCommList",
  cluster: "COMMUNICATE",
  workflowTriggers: {
    onRefresh: ["execEvent"],
    onSelect: ["validateAccess", "refreshContext"],
    onCreate: ["createRecord"],
  },
  workflows: ["createCommunication"],

  displayConfig: "/home/paul/wf-monorepo-new/analysis-n-document/genOps/workflows/output/plans/gridPlanComms-display.js",
  purpose: "Get communications for a specific plan",

};
