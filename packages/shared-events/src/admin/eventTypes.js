/**
 * WhatsFresh Admin Event Types
 * Events related to account/user management and system administration
 * These events are intended for admin applications only
 */

/**
 * All admin event definitions
 */
const ADMIN_EVENTS = [
  // Root entity (virtual) to organize hierarchy
  // Auth events
  {
    eventID: 1,
    eventType: "userLogin",
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
    dbTable: "accounts", // Add this line
    selWidget: "SelAcct", // Add this line
    parent: ["userLogin"],
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
    dbTable: "users", // Add this line
    parent: "userLogin",
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
function getAdminEventType(eventType) {
  return ADMIN_EVENTS.find(e => e.eventType === eventType);
}

/**
 * Get parent entity for an admin event type
 */
function getAdminParentEntity(eventType) {
  return getAdminEventType(eventType)?.parent;
}

/**
 * Get child entities for an admin event type
 */
function getAdminChildEntities(eventType) {
  return getAdminEventType(eventType)?.children || [];
}

/**
 * Get parameters for an admin event
 */
function getAdminEventParams(eventType) {
  return getAdminEventType(eventType)?.params || [];
}

/**
 * Get client-safe admin event types (without SQL)
 */
function getClientSafeAdminEventTypes() {
  return ADMIN_EVENTS.map(event => {
    const { qrySQL, ...clientSafeEvent } = event;
    return clientSafeEvent;
  });
}

module.exports = {
  ADMIN_EVENTS,
  getAdminEventType,
  getAdminParentEntity,
  getAdminChildEntities,
  getAdminEventParams,
  getClientSafeAdminEventTypes
};