export const formPlanComm = {
  eventID: 105.1,
  eventType: "formPlanComm",
  category: "form",
  title: "Plan Communication Detail",
  cluster: "PLANS",
  dbTable: "api_wf.plans_communications",

  // Standard 3-trigger pattern
  workflowTriggers: {
    onSelect: ["validateAccess", "refreshContext"],
    onCreate: ["createRecord"],
  },

  method: "GET",
  qrySQL: `
        SELECT  
          id,
          plan_id,
          subject,
          from_agent,
          to_agent,
          status,
          type,
          message,
          created_at,
          created_by
        FROM api_wf.plan_communications
        WHERE id = :planCommID
      `,
  params: [":planCommID"],
  primaryKey: "id",
  purpose: "Get detailed information for a specific plan communication",
}