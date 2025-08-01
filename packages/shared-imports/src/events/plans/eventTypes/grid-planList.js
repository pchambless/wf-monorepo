export const gridPlanList = {
  eventID: 101,
  eventType: "planList",
  category: "grid",
  title: "Plans",
  cluster: "PLANS",
  dbTable: "api_wf.plans",
  navChildren: ["planDetailTab", "planCommunicationTab", "planImpactTab"],
  workflows: ["updatePlan", "createPlan"],

  // Standard 3-trigger pattern
  workflowTriggers: {
    onSelect: ["validateAccess", "refreshContext"],
    onUpdate: ["updateRecord", "trackImpact"],
    onCreate: ["createRecord", "trackImpact"],
  },

  selWidget: "SelPlan",
  method: "GET",
  qrySQL: `
        SELECT 
          id,
          name
        FROM api_wf.plans
        WHERE status = :planStatus
        ORDER BY id DESC
      `,
  params: [":planStatus"],
  primaryKey: "id",
  purpose: "Get all plans given a specific status",
}