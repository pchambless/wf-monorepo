/**
 * Admin EventTypes Index
 * Exports all admin event type definitions
 */

// Import all individual event types
import { acctList } from './acctList.js';
import { userList } from './userList.js';
import { userLogin } from './userLogin.js';

// Create EVENTS array
export const EVENTS = [
  acctList,
  userList,
  userLogin
];

// Helper functions
export function getEventType(eventType) {
  return EVENTS.find(e => e.eventType === eventType);
}

export function getChildEntities(eventType) {
  return getEventType(eventType)?.children || [];
}

export function getEventParams(eventType) {
  return getEventType(eventType)?.params || [];
}

export function getSafeEventTypes() {
  return EVENTS.map(event => {
    const { qrySQL, ...clientSafeEvent } = event;
    return clientSafeEvent;
  });
}