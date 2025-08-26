export const planCommList =
{
  category: "list",
  title: "Plan Communications",
  cluster: "PLANS",
  method: "GET",
  dbTable: "api_wf.plan_communications",
  qrySQL: `
        SELECT id,
        from_agent,
        to_agent,
        type,
        subject
        FROM api_wf.plan_communications
        WHERE plan_id = :planID
        ORDER BY created_at DESC
      `,
  params: [":planID"],
  primaryKey: "id",
  purpose: "Get communications for a specific plan"
}
  ;