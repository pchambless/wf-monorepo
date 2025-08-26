export const prodTypeList = {
  eventID: 20,
  category: "page:CrudLayout",
  title: "Product Types",
  cluster: "PRODUCTS",
  routePath: "/products/:acctID/prodTypeList",
  dbTable: "product_types",
  selWidget: "SelProdType",
  navChildren: ["prodList", "taskList"],
  method: "GET",
  qrySQL: `
      SELECT *
      FROM api_wf.prodTypeList
      WHERE acctID = :acctID
      ORDER BY prodTypeName
    `,
  params: [":acctID"],
  primaryKey: "prodTypeID",
  purpose: "Get product types for an account"
}