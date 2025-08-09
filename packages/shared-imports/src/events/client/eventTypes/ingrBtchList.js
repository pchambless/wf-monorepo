export const ingrBtchList =    {
    eventID: 12,
    eventType: "ingrBtchList",
    category: "page:CrudLayout",
    title: "Ingredient Batches",
    cluster: "INGREDIENTS",
    routePath: "/ingredients/:ingrID/ingrBtchList",
    dbTable: "ingredient_batches",
    navChildren: [],
    selWidget: "SelIngrBtch",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.ingrBtchList
      WHERE ingrID = :ingrID
      ORDER BY ingrBtchID DESC
    `,
    params: [":ingrID"],
    primaryKey: "ingrBtchID",
    purpose: "Get ingredient batches for a product"
  }