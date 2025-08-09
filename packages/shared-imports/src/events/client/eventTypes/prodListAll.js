export const prodListAll = {
    eventID: 21.1,
    eventType: "prodListAll",
    category: "ui:Select",
    title: "Acct Products",
    cluster: "SELECT",
    dbTable: "products",
    selWidget: "SelProd",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.prodList
      WHERE acctID = :acctID
      ORDER BY prodName
    `,
    params: [":acctID"],
    primaryKey: "prodID",
    purpose: "Get all products for an account"
  };