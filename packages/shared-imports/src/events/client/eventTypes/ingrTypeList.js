export const ingrTypeList = {
    eventID: 10,
    eventType: "ingrTypeList",
    category: "page:CrudLayout",
    title: "Ingredient Types",
    cluster: "INGREDIENTS",
    routePath: "/ingredients/:acctID/ingrTypeList",
    dbTable: "ingredient_types",
    selWidget: "SelIngrType",
    navChildren: ["ingrList"],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.ingrTypeList
      WHERE acctID = :acctID
      ORDER BY ingrTypeName
    `,
    params: [":acctID"],
    primaryKey: "ingrTypeID",
    purpose: "Get ingredient types for an account"
  }