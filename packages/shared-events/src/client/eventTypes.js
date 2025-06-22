/**
 * WhatsFresh Shared Event Types
 * Single source of truth for event definitions and relationships
 */

/**
 * All event definitions including SQL and relationships
 */
const CLIENT_EVENTS = [
  // Root entity (virtual) to organize hierarchy
  
  // LOGIN
  {
    eventID: 1,
    eventType: "userLogin",
    category: "auth", // Add this line
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
    category: "select",
    children: [
      "ingrTypeList",
      "prodTypeList", 
      "brndList", 
      "vndrList", 
      "wrkrList", 
      "measList"
      // Removed acctList as it's now in adminEvents
    ],
    selWidget: "SelUserAcct", // Add this line
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.userAcctList
      WHERE userID = :userID
      ORDER BY acctName
    `,
    params: [":userID"],
    purpose: "Get accounts accessible to user"
  },
  
  // INGREDIENTS
  {
    eventID: 10,
    eventType: "ingrTypeList",
    category: "crud",
    dbTable: "ingredient_types",
    selWidget: "SelIngrType",  // Add this line
    children: ["ingrList"], // Types contain ingredients
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.ingrTypeList
      WHERE acctID = :acctID
      ORDER BY ingrTypeName
    `,
    params: [":acctID"],
    purpose: "Get ingredient types for an account"
  },
  {
    eventID: 11,
    eventType: "ingrList",
    category: "crud",
    dbTable: "ingredients",
    selWidget: "SelIngr",  // Add this line
    children: ["ingrBtchList"], // Parent of batches
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.ingrList
      WHERE (ingrTypeID = :ingrTypeID OR :ingrTypeID IS NULL)
      AND acctID = :acctID
    `,
    params: [":acctID", ":ingrTypeID"],
    purpose: "Get ingredients for an account"
  },
  {
    eventID: 12,
    eventType: "ingrBtchList",
    category: "crud",
    dbTable: "ingredient_batches",
    children: ["btchmapAvailable", "btchMapMapped"],
    selWidget: "SelIngrBtch",  
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.ingrBtchList
      WHERE ingrID = :ingrID
      ORDER BY ingrBtchID DESC
    `,
    params: [":ingrID"],
    purpose: "Get ingredient batches for a product"
  },
  
  // PRODUCTS
  {
    eventID: 20,
    eventType: "prodTypeList",
    category: "crud",
    dbTable: "product_types",
    selWidget: "SelProdType",  // Add this line
    children: ["prodList", "taskList"], // Types contain products and tasks
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.prodTypeList
      WHERE acctID = :acctID
      ORDER BY prodTypeName
    `,
    params: [":acctID"],
    purpose: "Get product types for an account"
  },
  {
    eventID: 21,
    eventType: "prodList",
    category: "crud",
    dbTable: "products",
    selWidget: "SelProd",  // Add this line
    children: ["prodBtchList", "rcpeList"], // Parent of batches and recipes
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.prodList
      (prodTypeID = :prodTypeID OR :prodTypeID IS NULL)
      and acctID = :acctID
    `,
    params: [":acctID", ":prodTypeID"],
    purpose: "Get products for an account"
  },
   {
    eventID: 41,
    eventType: "taskList",
    category: "crud",
    dbTable: "tasks",
    children: ["prodBtchTaskList"], // Tasks for batches
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.taskList
      WHERE prodTypeID = :prodTypeID
      ORDER BY taskID DESC
    `,
    params: [":prodTypeID"],
    purpose: "Get tasks for batches"
  },
  {
    eventID: 22,
    eventType: "prodBtchList",
    category: "crud",
    dbTable: "product_batches",
    children: ["btchMapList", "prodBtchTaskList"],
    selWidget: "SelProdBtch", 
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.prodBtchList
      WHERE prodID = :prodID
      ORDER BY prodBtchID DESC
    `,
    params: [":prodID"],
    purpose: "Get product batches for a product"
  },
  
  // REFERENCE
  {
    eventID: 30,
    eventType: "brndList",
    category: "crud",
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
    purpose: "Get brands for an account"
  },
  {
    eventID: 31,
    eventType: "vndrList",
    category: "crud",
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
    purpose: "Get vendors for an account"
  },
  {
    eventID: 32,
    eventType: "wrkrList",
    category: "crud",
    dbTable: "workers",
    selWidget: "SelWrkr",  // Add this line
    children: ["prodBtchTaskList"], // No children
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.wrkrList
      WHERE acctID = :acctID
      ORDER BY wrkrName
    `,
    params: [":acctID"],
    purpose: "Get workers for an account"
  },
  {
    eventID: 63,
    eventType: "measList",
    category: "crud",
    dbTable: "measures",
    children: [], // No children
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.measList
      WHERE acctID = :acctID
      ORDER BY name
    `,
    params: [":acctID"],
    purpose: "Get measurement units"
  },
  // RECIPES
  {
    eventID: 42,
    eventType: "rcpeList",
    category: "rcpe",
    dbTable: "product_recipes",
    children: ["btchMapList"],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.rcpeList
      WHERE prodID = :prodID
      ORDER BY rcpeID DESC
    `,
    params: [":prodID"],
    purpose: "Get recipes for an account"
  },
    // MAPPING 
  {
    eventID: 100,
    eventType: "btchMapList",
    children: ["btchMapIngrList", "btchMapMapped", "btchMapAvailable"],
    method: "GET",
    params: [":prodbtchID"],
    purpose: "Main batch mapping page"
  },
  {
    eventID: 101,
    eventType: "btchMapIngrList",
    parent: "btchMapList",
    method: "GET",
    qrySQL: `
      SELECT a.ingr_ordr, a.ingr_name, a.ingr_id, a.prd_rcpe_id
      FROM api_wf.v_prd_rcpe_dtl a
      WHERE prd_id = :prodID
      AND a.prd_rcpe_actv = 'Y'
      ORDER BY a.ingr_ordr
    `,
    params: [":prodID"],
    purpose: "Get recipe ingredients for a product"
  },
  {
    eventID: 102,
    eventType: "btchMapMapped",
    parent: "btchMapPage",
    method: "GET",
    qrySQL: `
      SELECT a.ingr_btch_nbr, a.purch_date, a.vndr_name, a.prd_btch_ingr_id
      FROM api_wf.v_prd_btch_ingr_dtl a
      WHERE a.ingr_id = :ingrID
      AND prd_btch_id = :prodBtchID
      ORDER BY purch_date DESC
    `,
    params: [":acctID", ":prodBtchID", ":ingrID"],
    purpose: "Ingr batches mapped to an ingredient for a product batch"
  },
  {
    eventID: 103,
    eventType: "btchMapAvailable",
    method: "GET",
    qrySQL: `
      SELECT ingr_name, a.ingr_btch_nbr, a.purch_date, a.vndr_name, a.ingr_btch_id, ingr_id
      FROM api_wf.v_ingr_btch_dtl a
      WHERE a.ingr_id = :ingrID
      AND a.ingr_btch_id NOT IN (
        SELECT ingr_btch_id
        FROM api_wf.v_prd_btch_ingr_dtl
        WHERE prd_btch_id = :prodBtchID
        AND ingr_id = :ingrID
      )
      ORDER BY ingr_btch_id DESC
    `,
    params: [":acctID", ":prodBtchID", ":ingrID"],
    purpose: "Ingr batches available for mapping to a product batch"
  },

];

/**
 * Get an event by type
 */
function getEventType(eventType) {
  return CLIENT_EVENTS.find(e => e.eventType === eventType); // Changed from EVENT_TYPES
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
function getClientSafeEventTypes() {
  return CLIENT_EVENTS.map(event => { // Changed from EVENT_TYPES
    const { qrySQL, ...clientSafeEvent } = event;
    return clientSafeEvent;
  });
}

module.exports = {
  CLIENT_EVENTS,
  getEventType,
  getChildEntities,
  getEventParams,
  getClientSafeEventTypes
};