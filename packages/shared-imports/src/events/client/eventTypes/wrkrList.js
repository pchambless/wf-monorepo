 
 export const wrkrList = {
    eventID: 32,
    eventType: "wrkrList",
    category: "page:CrudLayout",
    title: "Workers",
    cluster: "REFERENCE",
    routePath: "/workers/:acctID/wrkrList",
    dbTable: "workers",
    selWidget: "SelWrkr",
    navChildren: [],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.wrkrList
      WHERE acctID = :acctID
      ORDER BY wrkrName
    `,
    params: [":acctID"],
    primaryKey: "wrkrID",
    purpose: "Get workers for an account"
  };