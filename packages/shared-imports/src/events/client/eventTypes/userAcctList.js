 export const userAcctList = {
    eventID: 2,
    eventType: "userAcctList",
    category: "ui:select",
    cluster: "AUTH",
    navChildren: ["ingrTypeList",
      "prodTypeList",
      "brndList",
      "vndrList",
      "wrkrList",
      "measList"],
    selWidget: "SelUserAcct",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.userAcctList
      WHERE userID = :userID
      ORDER BY acctName
    `,
    params: [":userID"],
    primaryKey: "acctID",
    purpose: "Get accounts accessible to user"
  }