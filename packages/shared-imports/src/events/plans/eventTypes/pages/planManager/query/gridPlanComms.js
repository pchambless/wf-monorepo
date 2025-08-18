export const gridPlanComms =
{
  eventID: 102,
  eventType: "gridPlanComms",
  category: "grid",
  title: "Communications",
  cluster: "PLANS",
  workflows: ["createCommunication"],

  dbTable: "api_wf.plan_communications",
  method: "GET",
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
  parentKey: "plan_id",
  purpose: "Get communications for a specific plan",
  // Component layout with explicit mapping
    components: [
        {
            id: "formPlanComm",
            type: "form",
            event: "formPlanComm",           // ← Explicit reference to query eventType
            position: { row: 1, col: 1 },
            span: { cols: 1, rows: 1 },
            props: {
                title: "grid.row.name",
                allowCreate: true
            }
        }
    ]
}
  ;