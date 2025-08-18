export const gridPlanImpacts = {
  eventID: 103,
  eventType: "gridPlanImpacts",
  category: "grid",
  title: "Plan Impacts",
  cluster: "PLANS",
  workflows: ["createPlanImpact"],
  dbTable: "api_wf.plan_impacts",
  method: "GET",
  qrySQL: `
        SELECT id, change_type, fileFolder, fileName, description, created_at, created_by
        FROM api_wf.plan_impacts
        WHERE plan_id = :planID
        ORDER BY created_at DESC
      `,
  params: [":planID"],
  primaryKey: "id",
  parentKey: "plan_id",
  purpose: "Get file impacts for a specific plan",
  // Component layout with explicit mapping
    components: [
        {
            id: "formPlanImpact",
            type: "form",
            event: "formPlanImpact",           // ← Explicit reference to query eventType
            position: { row: 1, col: 1 },
            span: { cols: 1, rows: 1 },
            props: {
                title: "grid.row.name",
                allowCreate: true
            }
        }
    ]
}