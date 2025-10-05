export const ingrList = {
  eventID: 11,
  category: "page:CrudLayout",
  title: "Ingredients",
  cluster: "INGREDIENTS",
  routePath: "/ingredients/:ingrTypeID/ingrList",
  dbTable: "ingredients",
  selWidget: "SelIngr",
  navChildren: ["ingrBtchList"],
  method: "GET",
  qrySQL: `
      SELECT *
      FROM api_wf.ingrList
      WHERE (ingrTypeID = :ingrTypeID OR ingrTypeID IS NULL)
      and acctID = :acctID
    `,
  params: [":acctID", ":ingrTypeID"],
  primaryKey: "ingrID",
  purpose: "Get ingredients for an account"
}