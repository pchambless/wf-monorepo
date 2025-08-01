export const gridPlanImpactList = {
    eventID: 103,
    eventType: "grid-planImpactList",
    category: "grid",
    title: "Plan Impacts",
    cluster: "PLANS",

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
    purpose: "Get file impacts for a specific plan",
}