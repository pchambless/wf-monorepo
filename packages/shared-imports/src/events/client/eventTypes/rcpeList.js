export const rcpeList = {
    eventID: 42,
    eventType: "rcpeList",
    category: "page:RecipeLayout",
    title: "Product Recipes",
    cluster: "PRODUCTS",
    routePath: "/recipes/:prodID/rcpeList",
    dbTable: "product_recipes",
    selWidget: "SelRcpe",
    navChildren: [],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.rcpeList
      WHERE prodID = :prodID
      ORDER BY rcpeID DESC
    `,
    params: [":prodID"],
    primaryKey: "rcpeID",
    purpose: "Get recipes for an account"
  };