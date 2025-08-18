export const planList = {
    eventID: 101.3,
    eventType: "planList",
    category: "list",
    cluster: "PLANS",
    dbTable: "api_wf.plans",
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
    purpose: "Get all plans given a specific status"
}