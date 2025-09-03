export const planImpactList = {
    category: "grid",
    title: "Plan Status List",
    cluster: "PLANS",
    dbTable: "select_vals",
    method: "GET",
    qrySQL: `
        SELECT value id, label
        FROM select_vals
        WHERE colName  = 'planStatus'
        ORDER BY ordr
      `,
    params: [],
    primaryKey: "id",
    purpose: "Get all statuses for plans",

}