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
    category: "page:Login",
    cluster: "AUTH",
    routePath: "/login",
    dbTable: "users", // Add this line
    children: ["userAcctList"],
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
    children: [
      "ingrTypeList",
      "prodTypeList",
      "brndList",
      "vndrList",
      "wrkrList",
      "measList"
    ],
    selWidget: "SelUserAcct",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.userAcctList
      WHERE userID = :userID
      ORDER BY acctName
    `,
    params: [":userID"],
    primaryKey: "",
    purpose: "Get accounts accessible to user"
  },

  // INGREDIENTS
  {
    eventID: 10,
    eventType: "ingrTypeList",
    category: "page:Crud",
    cluster: "INGREDIENTS",
    routePath: "/ingredients/:acctID/ingrTypeList",
    dbTable: "ingredient_types",
    selWidget: "SelIngrType",
    children: ["ingrList"],
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
    category: "page:Crud",
    cluster: "INGREDIENTS",
    routePath: "/ingredients/:ingrTypeID/ingrList",
    dbTable: "ingredients",
    selWidget: "SelIngr",
    children: ["ingrBtchList"],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.ingrList
      WHERE (ingrTypeID = :ingrTypeID OR :ingrTypeID IS NULL)
      AND acctID = :acctID
    `,
    params: [":acctID", ":ingrTypeID"],
    primaryKey: "ingrID",
    purpose: "Get ingredients for an account"
  },
  {
    eventID: 12,
    eventType: "ingrBtchList",
    category: "page:Crud",
    cluster: "INGREDIENTS",
    routePath: "/ingredients/:ingrID/ingrBtchList",
    dbTable: "ingredient_batches",
    children: ["btchMapAvailable", "btchMapMapped"],
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
    category: "page:Crud",
    cluster: "PRODUCTS",
    routePath: "/products/:acctID/prodTypeList",
    dbTable: "product_types",
    selWidget: "SelProdType",
    children: ["prodList", "taskList"],
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
    category: "page:Crud",
    cluster: "PRODUCTS",
    routePath: "/products/:prodTypeID/prodList",
    dbTable: "products",
    selWidget: "SelProd",
    children: ["prodBtchList", "rcpeList", "btchMapRcpeList"],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.prodList
      (prodTypeID = :prodTypeID OR :prodTypeID IS NULL)
      and acctID = :acctID
    `,
    params: [":acctID", ":prodTypeID"],
    primaryKey: "prodID",
    purpose: "Get products for an account"
  },
  {
    eventID: 41,
    eventType: "taskList",
    category: "page:Crud",
    cluster: "PRODUCTS",
    routePath: "/products/:prodTypeID/taskList",
    dbTable: "tasks",
    children: ["prodBtchTaskList"],
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
    category: "page:Crud",
    cluster: "PRODUCTS",
    routePath: "/products/:prodID/prodBtchList",
    dbTable: "product_batches",
    children: ["btchMapDetail"],
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
    category: "page:Crud",
    cluster: "REFERENCE",
    routePath: "/brands/:acctID/brndList",
    dbTable: "brands",
    selWidget: "SelBrnd",
    children: ["ingrBtchList"],
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
    category: "page:Crud",
    cluster: "REFERENCE",
    routePath: "/vendors/:acctID/vndrList",
    dbTable: "vendors",
    selWidget: "SelVndr",
    children: ["ingrBtchList"],
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
    category: "page:Crud",
    cluster: "REFERENCE",
    routePath: "/workers/:acctID/wrkrList",
    dbTable: "workers",
    selWidget: "SelWrkr",
    children: ["prodBtchTaskList"],
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
    category: "page:Crud",
    cluster: "REFERENCE",
    routePath: "/measures/:acctID/measList",
    dbTable: "measures",
    children: [],
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
    category: "page:Recipe",
    cluster: "PRODUCTS",
    routePath: "/recipes/:prodID/rcpeList",
    dbTable: "product_recipes",
    children: ["btchMapRcpeList"],
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
    eventType: "btchMapDetail",
    category: "page:Mapping",
    cluster: "MAPPING",
    children: ["btchMapRcpeList", "btchMapMapped", "btchMapAvailable"],
    routePath: "/mapping/:prodBtchID/btchMapDetail",
    params: [":prodBtchID"],
    purpose: "Main batch mapping page"
  },
  {
    eventID: 101,
    eventType: "btchMapRcpeList",
    category: "data:Grid",
    cluster: "MAPPING",
    method: "GET",
    qrySQL: `
      SELECT * 
      from api_wf.btchMapRcpeList a
      WHERE prd_id = :prodID
      ORDER BY a.ingrOrdr
    `,
    params: [":prodID"],
    primaryKey: "rcpeID",
    purpose: "Get recipe ingredients for a product"
  },
  {
    eventID: 102,
    eventType: "btchMapMapped",
    category: "data:Grid",
    cluster: "MAPPING",
    method: "GET",
    qrySQL: `
      SELECT a.ingr_btch_nbr, a.purch_date, a.vndr_name, a.prd_btch_ingr_id mapID
      FROM api_wf.v_prd_btch_ingr_dtl a
      WHERE a.ingr_id = :ingrID
      AND prd_btch_id = :prodBtchID
      ORDER BY purch_date DESC
    `,
    params: [":prodBtchID", ":ingrID"],
    primaryKey: "mapID",
    purpose: "Ingr batches mapped to an ingredient for a product batch"
  },
  {
    eventID: 103,
    eventType: "btchMapAvailable",
    category: "data:Grid",
    cluster: "MAPPING",
    method: "GET",
    qrySQL: `
      SELECT a.ingr_btch_id ingrBtchID, ingr_name ingrName, a.ingr_btch_nbr btchNbr
      , a.purch_date purchDate, a.vndr_name vndrName
      ,  ingr_id ingrID
      FROM whatsfresh.v_ingr_btch_dtl a
      WHERE a.ingr_id = :ingrID
      AND a.ingr_btch_id NOT IN (
        SELECT ingr_btch_id
        FROM whatsfresh.v_prd_btch_ingr_dtl
        WHERE prd_btch_id = :prodBtchID
        AND ingr_id = :ingrID
      )
      ORDER BY ingr_btch_id DESC
    `,
    params: [":prodBtchID", ":ingrID"],
    primaryKey: "ingrBtchID",
    purpose: "Ingr batches available for mapping to a product batch"
  },

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