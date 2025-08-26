export const acctList =  {
    eventID: 61,
    eventType: "acctList",
    category: "page:Crud",
    cluster: "ADMIN",
    dbTable: "accounts", // Add this line
    routePath: "/acctList",
    selWidget: "SelAcct",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.acctList
      ORDER BY acctName
    `,
    params: [],
    purpose: "Get the list of WF Accounts"
  };
  