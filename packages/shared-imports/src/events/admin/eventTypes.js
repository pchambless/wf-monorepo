/**
 * WhatsFresh Admin Event Types
 * Events related to account/user management and system administration
 * These events are intended for admin applications only
 */

/**
 * All admin event definitions
 */
// Note: Using cluster attribute in events instead of separate eventCategory

const EVENTS = [
  // Root entity (virtual) to organize hierarchy
  // Auth events
  {
    eventID: 1,
    eventType: "userLogin",
    category: "page:Login", 
    cluster: "AUTH", 
    dbTable: "users", 
    routePath: "/login",
    children: ["acctList", "userList"], // Login leads to account selection
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
    eventID: 61,
    eventType: "acctList",
    category: "page:Crud",
    cluster: "ADMIN",
    dbTable: "accounts", // Add this line
    routePath: "/acctList",
    selWidget: "SelAcct",
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
    category: "page:Crud",
    cluster: "ADMIN",
    dbTable: "users", // Add this line
    routePath: "/userList",
    selWidget: "SelUser",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.userList
      WHERE acctID = :acctID
      ORDER BY userName
    `,
    params: [":acctID"],
    purpose: "Get users for an account"
  }
];

/**
 * Get an admin event by type
 */
function getEventType(eventType) {
  return EVENTS.find(e => e.eventType === eventType);
}

/**
 * Get child entities for an admin event type
 */
function getChildEntities(eventType) {
  return getEventType(eventType)?.children || [];
}

/**
 * Get parameters for an admin event
 */
function getEventParams(eventType) {
  return getEventType(eventType)?.params || [];
}

/**
 * Get safe admin event types (without SQL)
 */
function getSafeEventTypes() {
  return EVENTS.map(event => {
    const { qrySQL, ...safeEvent } = event;
    return safeEvent;
  });
}

export {
  EVENTS,
  getEventType,
  getChildEntities,
  getEventParams,
  getSafeEventTypes
};