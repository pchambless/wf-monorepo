/**
 * WhatsFresh Shared Event Types
 * Single source of truth for event definitions and relationships
 */

/**
 * All event definitions including SQL and relationships
 */
const CRUD_EVENTS = [
  // Root entity (virtual) to organize hierarchy
  {
    eventID: 0,
    eventType: "acctRoot",
    children: [
      "ingrTypeList",
      "prodTypeList", 
      "brndList", 
      "vndrList", 
      "wrkrList", 
      "measList"
      // Removed acctList as it's now in adminEvents
    ],
    method: "GET",
    params: [],
    purpose: "Root entity for account-related data"
  },
  // Auth events
  {
    eventID: 1,
    eventType: "userLogin",
    children: ["userAcctList"], // Login leads to account selection
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
    selWidget: "SelUserAcct", // Add this line
    parent: "userLogin", // Comes after login
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
  
  // Ingredient section events
  {
    eventID: 10,
    eventType: "ingrTypeList",
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
    selWidget: "SelIngr",  // Add this line
    parent: "ingrTypeList", // Child of ingredient types
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
    selWidget: "SelIngrBtch",  // Add this line
    parent: "ingrList", // Child of ingredients
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
  
  // Product section events
  {
    eventID: 20,
    eventType: "prodTypeList",
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
    selWidget: "SelProd",  // Add this line
    parent: "prodTypeList", // Child of product types
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
    eventID: 22,
    eventType: "prodBtchList",
    selWidget: "SelProdBtch",  // Add this line
    parent: "prodList", // Child of products
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
  
  // Reference section events
  {
    eventID: 30,
    eventType: "brndList",
    selWidget: "SelBrnd",  // Add this line
    children: [], // No children
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
    selWidget: "SelVndr",  // Add this line
    children: [], // No children
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
    selWidget: "SelWrkr",  // Add this line
    children: [], // No children
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
  
  // Mapping section events
  {
    eventID: 40,
    eventType: "btchMap",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.btchMap
      WHERE acctID = :acctID
      ORDER BY btchMapID DESC
    `,
    params: [":acctID"],
    purpose: "Get batch mapping information"
  },
  {
    eventID: 41,
    eventType: "taskList",
    parent: "prodTypeList", // Child of product types
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.taskList
      WHERE acctID = :acctID
      ORDER BY taskID DESC
    `,
    params: [":acctID"],
    purpose: "Get tasks for batches"
  },
  {
    eventID: 42,
    eventType: "rcpeList",
    parent: "prodList", // Child of products
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.rcpeList
      WHERE acctID = :acctID
      ORDER BY rcpeID DESC
    `,
    params: [":acctID"],
    purpose: "Get recipes for an account"
  },
  
  // Admin/utility events - MOVED TO adminEvents.js
  // eventID: 61, eventType: "acctList" - REMOVED
  // eventID: 62, eventType: "userList" - REMOVED

  {
    eventID: 63,
    eventType: "measList",
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
  }
];

/**
 * Get an event by type
 */
function getEventType(eventType) {
  return CRUD_EVENTS.find(e => e.eventType === eventType); // Changed from EVENT_TYPES
}

/**
 * Get parent entity for an event type
 */
function getParentEntity(eventType) {
  return getEventType(eventType)?.parent;
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
  return CRUD_EVENTS.map(event => { // Changed from EVENT_TYPES
    const { qrySQL, ...clientSafeEvent } = event;
    return clientSafeEvent;
  });
}

module.exports = {
  CRUD_EVENTS,
  getEventType,
  getParentEntity,
  getChildEntities,
  getEventParams,
  getClientSafeEventTypes
};