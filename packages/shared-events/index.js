/**
 * WhatsFresh Shared Event Types
 * Single source of truth for event definitions used by both client and server
 */

/**
 * All event definitions including SQL
 * Client applications can filter out SQL when needed
 */
const EVENT_TYPES = [
  // Auth events
  {
    eventID: 1,
    eventType: "userLogin",
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
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.ingrList
      WHERE acctID = :acctID
      ORDER BY ingrName
    `,
    params: [":acctID"],
    purpose: "Get ingredients for an account"
  },
  {
    eventID: 12,
    eventType: "ingrBtchList",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.ingrBtchList
      WHERE acctID = :acctID
      ORDER BY ingrBtchID DESC
    `,
    params: [":acctID"],
    purpose: "Get ingredient batches for an account"
  },
  
  // Product section events
  {
    eventID: 20,
    eventType: "prodTypeList",
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
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.prodList
      WHERE acctID = :acctID
      ORDER BY prodName
    `,
    params: [":acctID"],
    purpose: "Get products for an account"
  },
  {
    eventID: 22,
    eventType: "prodBtchList",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.prodBtchList
      WHERE acctID = :acctID
      ORDER BY prodBtchID DESC
    `,
    params: [":acctID"],
    purpose: "Get product batches for an account"
  },
  
  // Reference section events
  {
    eventID: 30,
    eventType: "brndList",
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
  
  // Admin/utility events
  {
    eventID: 61,
    eventType: "acctList",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.acctList
      ORDER BY acctName
    `,
    params: [],
    purpose: "Get the list of WF Accounts"
  },
  {
    eventID: 62,
    eventType: "userList",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.userList
      WHERE acctID = :acctID
      ORDER BY userName
    `,
    params: [":acctID"],
    purpose: "Get users for an account"
  },
  {
    eventID: 63,
    eventType: "measList",
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
  return EVENT_TYPES.find(e => e.eventType === eventType);
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
  return EVENT_TYPES.map(event => {
    const { qrySQL, ...clientSafeEvent } = event;
    return clientSafeEvent;
  });
}

module.exports = {
  EVENT_TYPES,
  getEventType,
  getEventParams,
  getClientSafeEventTypes
};