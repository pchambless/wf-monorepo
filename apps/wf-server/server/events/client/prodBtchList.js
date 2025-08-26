export const prodBtchList = {
  eventID: 22,
  category: "page:CrudLayout",
  title: "Product Batches",
  cluster: "PRODUCTS",
  routePath: "/products/:prodID/prodBtchList",
  dbTable: "product_batches",
  navChildren: ["btchMapping"],
  selWidget: "SelProdBtch",
  method: "GET",
  qrySQL: `
      SELECT *
      FROM api_wf.prodBtchList
      WHERE prodID = :prodID
      ORDER BY prodBtchID DESC
    `,
  params: [":prodID"],
  primaryKey: "prodBtchID",
  purpose: "Get product batches for a product"
};