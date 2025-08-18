export const formPlanImpact = {
  eventID: 105.2,
  eventType: "formPlanImpact",
  category: "form",
  title: "Plan Impact Detail",
  cluster: "PLANS",
  dbTable: "api_wf.plans_impacts",

  // Standard 3-trigger pattern
  workflowTriggers: {
    onSelect: ["validateAccess", "refreshContext"],
    onCreate: ["createRecord"]
  },

  method: "GET",
  qrySQL: `
        SELECT  
          id,
          plan_id,
          file_path,
          phase,
          change_type,
          description,
          batch_id,
          affected_apps,
          auto_generated,
          cross_app_analysis,
          fileName,
          fileFolder,
          created_at,
          created_by
        FROM api_wf.plan_impacts
        WHERE id = :planImpactID
      `,
  params: [":planImpactID"],
  primaryKey: "id",
  parentKey: "plan_id",
  purpose: "Get detailed information for a specific plan impact",
}