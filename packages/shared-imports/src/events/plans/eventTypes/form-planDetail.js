export const formPlanDetail = {
  eventID: 105,
  eventType: "form-planDetail",
  category: "form",
  title: "Plan Detail",
  cluster: "PLANS",
  dbTable: "api_wf.plans",

  // Standard 3-trigger pattern
  workflowTriggers: {
    onSelect: ["validateAccess", "refreshContext"],
    onUpdate: ["updateRecord", "trackImpact"],
    onCreate: ["createRecord", "trackImpact"],
  },

  method: "GET",
  qrySQL: `
        SELECT  
          id,
          cluster,
          name,
          status,
          priority,
          description,
          comments,
          assigned_to
        FROM api_wf.plans
        WHERE id = :planID
      `,
  params: [":planID"],
  primaryKey: "id",
  purpose: "Get detailed information for a specific plan",
}