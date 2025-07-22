/**
 * WhatsFresh Shared Event Types
 * Single source of truth for event definitions and relationships
 */

/**
 * All event definitions including SQL and relationships
 * Using cluster attribute instead of separate eventCategory
 */

const EVENTS = [
  // Root entity (virtual) to organize hierarchy

  // LOGIN
  {
    eventID: 1,
    eventType: "userLogin",
    category: "page:AuthLayout",
    cluster: "AUTH",
    routePath: "/login",
    dbTable: "users", // Add this line
    children: ["userAcctList"],
    navChildren: ["dashboard"],
    method: "GET",
    qrySQL: `
      SELECT *, :enteredPassword
      FROM api_wf.userList
      WHERE userEmail = :userEmail
    `,
    params: [":userEmail", ":enteredPassword"],
    purpose: "Authenticate user login"
  },
  {
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
  },
  {
    eventID: 2.1,
    eventType: "archDashboard",
    routePath: "/architecture",
    category: "page:development",
    cluster: "DEVELOPMENT",
    description: "Architectural Intelligence Dashboard"
  },

  // INGREDIENTS
  {
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
  },
  {
    eventID: 11,
    eventType: "ingrList",
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
  },
  {
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
  },

  // PRODUCTS
  {
    eventID: 20,
    eventType: "prodTypeList",
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
  },
  {
    eventID: 21,
    eventType: "prodList",
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
  },
  {
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
  },
  {
    eventID: 41,
    eventType: "taskList",
    category: "page:CrudLayout",
    title: "Product Types Tasks",
    cluster: "PRODUCTS",
    routePath: "/products/:prodTypeID/taskList",
    dbTable: "tasks",
    selWidget: "SelTask",
    navChildren: [],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.taskList
      WHERE prodTypeID = :prodTypeID
      ORDER BY taskID DESC
    `,
    params: [":prodTypeID"],
    primaryKey: "taskID",
    purpose: "Get tasks for batches"
  },
  {
    eventID: 22,
    eventType: "prodBtchList",
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
  },

  // REFERENCE
  {
    eventID: 30,
    eventType: "brndList",
    category: "page:CrudLayout",
    title: "Brands",
    cluster: "REFERENCE",
    routePath: "/brands/:acctID/brndList",
    dbTable: "brands",
    selWidget: "SelBrnd",
    navChildren: [],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.brndList
      WHERE acctID = :acctID
      ORDER BY brndName
    `,
    params: [":acctID"],
    primaryKey: "brndID",
    purpose: "Get brands for an account"
  },
  {
    eventID: 31,
    eventType: "vndrList",
    category: "page:CrudLayout",
    title: "Vendors",
    cluster: "REFERENCE",
    routePath: "/vendors/:acctID/vndrList",
    dbTable: "vendors",
    selWidget: "SelVndr",
    navChildren: [],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.vndrList
      WHERE acctID = :acctID
      ORDER BY vndrName
    `,
    params: [":acctID"],
    primaryKey: "vndrID",
    purpose: "Get vendors for an account"
  },
  {
    eventID: 32,
    eventType: "wrkrList",
    category: "page:CrudLayout",
    title: "Workers",
    cluster: "REFERENCE",
    routePath: "/workers/:acctID/wrkrList",
    dbTable: "workers",
    selWidget: "SelWrkr",
    navChildren: [],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.wrkrList
      WHERE acctID = :acctID
      ORDER BY wrkrName
    `,
    params: [":acctID"],
    primaryKey: "wrkrID",
    purpose: "Get workers for an account"
  },
  {
    eventID: 63,
    eventType: "measList",
    category: "page:CrudLayout",
    title: "Measures",
    cluster: "REFERENCE",
    routePath: "/measures/:acctID/measList",
    dbTable: "measures",
    selWidget: "SelMeas",
    navChildren: [],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.measList
      WHERE acctID = :acctID
      ORDER BY name
    `,
    params: [":acctID"],
    primaryKey: "measID",
    purpose: "Get measurement units"
  },
  // RECIPES
  {
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
  },
  // MAPPING DETAIL
  {
    eventID: 100,
    eventType: "btchMapping",
    category: "page:MappingLayout",
    title: "Batch Mapping",
    cluster: "MAPPING",
    navChildren: [],
    routePath: "/mapping/:prodBtchID/btchMapping",
    params: [":prodBtchID"],
    purpose: "Main batch mapping page"
  },
  {
    eventID: 101,
    eventType: "gridRcpe",
    category: "data:Grid",
    cluster: "MAPPING",
    method: "GET",
    qrySQL: `
      SELECT * 
      from api_wf.gridRcpe a
      WHERE prodID = :prodID
      ORDER BY a.ingrOrdr
    `,
    params: [":prodID"],
    primaryKey: "prodRcpeID",
    purpose: "Get recipe ingredients for a product"
  },
  {
    eventID: 102,
    eventType: "gridMapped",
    category: "ui:Grid",
    cluster: "MAPPING",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.gridMapped a
      WHERE a.ingrID = :ingrID
      AND a.prodBtchID = :prodBtchID
      ORDER BY purchDate DESC
    `,
    params: [":prodBtchID", ":ingrID", "prodRcpeID"],
    primaryKey: "mapID",
    purpose: "Ingr batches mapped to a product batch"
  },
  {
    eventID: 103,
    eventType: "gridAvailable",
    category: "ui:Grid",
    cluster: "MAPPING",
    method: "GET",
    qrySQL: `
      select a.ingr_btch_id ingrBtchID, ingr_name ingrName, a.ingr_btch_nbr ingrBtchNbr
      , a.purch_date purchDate, a.vndr_name vndrName, a.ingr_id ingrID
      from v_ingr_btch_dtl a
      where a.ingr_id = :ingrID 
      and a.ingr_btch_id not in 
      (select ingr_btch_id 
      from v_prd_btch_ingr_dtl 
      where prd_btch_id = :prodBtchID 
      and ingr_id = :ingrID) 
      order by ingr_btch_id desc
      limit 20
    `,
    params: [":prodBtchID", ":ingrID"],
    primaryKey: "ingrBtchID",
    purpose: "Ingr batches available to map to a product batch"
  },

  // WORKSHEET GENERATION
  {
    eventID: 300,
    eventType: "rpt-WrkSht-Ingr",
    category: "report:worksheet",
    title: "Worksheet Ingredients",
    cluster: "REPORTS",
    method: "GET",
    qrySQL: `
      SELECT ingr_ordr Ordr, 
             ingr_name Ingredient, 
             ingrMaps 'Ingr Batch(es): Vendor', 
             prd_ingr_desc Description
      FROM whatsfresh.v_prdBtchIngr_Map
      WHERE prd_btch_id = :prodBtchID
      ORDER BY ingr_ordr
    `,
    params: [":prodBtchID"],
    primaryKey: "ingr_ordr",
    purpose: "Worksheet ingredients section data"
  },
  {
    eventID: 301,
    eventType: "rpt-WrkSht-Task",
    category: "report:worksheet",
    title: "Worksheet Tasks",
    cluster: "REPORTS",
    method: "GET",
    qrySQL: `
      SELECT ordr Ordr, 
             task_name Task, 
             taskWrkrs Workers, 
             measure_value Measure, 
             comments Comments
      FROM whatsfresh.v_prd_btch_task_dtl
      WHERE prd_btch_id = :prodBtchID
      ORDER BY ordr
    `,
    params: [":prodBtchID"],
    primaryKey: "ordr",
    purpose: "Worksheet tasks section data"
  }

];

/**
 * Get an event by type
 */
function getEventType(eventType) {
  return EVENTS.find(e => e.eventType === eventType); // Changed from EVENT_TYPES
}

/**
 * Get child entities for an event type
 */
function getChildEntities(eventType) {
  return getEventType(eventType)?.children || [];
}

/**
 * Get parameters for an event
 */
function getEventParams(eventType) {
  return getEventType(eventType)?.params || [];
}

/**
 * Get client-safe event types (without SQL)
 */
function getSafeEventTypes() {
  return EVENTS.map(event => {
    const { qrySQL, ...clientSafeEvent } = event;
    return clientSafeEvent;
  });
}

// ES module exports
export {
  EVENTS,
  getEventType,
  getChildEntities,
  getEventParams,
  getSafeEventTypes
};