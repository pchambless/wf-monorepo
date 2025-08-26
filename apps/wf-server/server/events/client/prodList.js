export const prodList = {
  eventID: 21,
  category: "page:CrudLayout",
  title: "Products",
  cluster: "PRODUCTS",
  routePath: "/products/:prodTypeID/prodList",
  dbTable: "products",
  selWidget: "SelProd",
  navChildren: ["prodBtchList", "rcpeList"],
  method: "GET",
  qrySQL: `
      SELECT *
      FROM api_wf.prodList
      WHERE prodTypeID = :prodTypeID
      ORDER BY prodName
    `,
  params: [":prodTypeID"],
  primaryKey: "prodID",
  purpose: "Get products for an Product Type"
};