export const planDtl = {
  category: "detail",
  title: "Plan Detail",
  cluster: "PLANS",
  dbTable: "api_wf.plans",
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
          assigned_to,
          created_at,
          created_by
        FROM api_wf.plans
        WHERE id = :planID
      `,
  params: [":planID"],
  primaryKey: "id",
  purpose: "Get detailed data for a specific plan",
}