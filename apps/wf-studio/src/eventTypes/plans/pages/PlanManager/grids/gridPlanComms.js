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
  purpose: "Get communications for a specific plan",

};
