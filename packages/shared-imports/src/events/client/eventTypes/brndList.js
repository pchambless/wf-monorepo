 export const brndList = {
    eventID: 30,
    eventType: "brndList",
    category: "page:CrudLayout",
    title: "Brands",
    cluster: "REFERENCE",
    routePath: "/brands/:acctID/brndList",
    dbTable: "brands",
    selWidget: "SelBrnd",
    navChildren: [],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.brndList
      WHERE acctID = :acctID
      ORDER BY brndName
    `,
    params: [":acctID"],
    primaryKey: "brndID",
    purpose: "Get brands for an account - hook test"
  };