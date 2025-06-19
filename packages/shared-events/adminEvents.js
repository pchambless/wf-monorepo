/**
 * WhatsFresh Admin Event Types
 * Events related to account/user management and system administration
 * These events are intended for admin applications only
 */

/**
 * All admin event definitions
 */
const ADMIN_EVENTS = [
  {
    eventID: 61,
    eventType: "acctList",
    selWidget: "SelAcct", // Add this line
    children: ["userList"],
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
    parent: "acctList",
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