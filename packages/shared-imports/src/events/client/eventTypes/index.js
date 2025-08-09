/**
 * Client EventTypes Index
 * Exports all client event type definitions
 */

// Import all individual event types
import { brndList } from './brndList.js';
import { btchMapping } from './btchMapping.js';
import { gridAvailable } from './gridAvailable.js';
import { gridMapped } from './gridMapped.js';
import { gridRcpe } from './gridRcpe.js';
import { ingrBtchList } from './ingrBtchList.js';
import { ingrList } from './ingrList.js';
import { ingrTypeList } from './ingrTypeList.js';
import { measList } from './measList.js';
import { prodBtchList } from './prodBtchList.js';
import { prodList } from './prodList.js';
import { prodListAll } from './prodListAll.js';
import { prodTypeList } from './prodTypeList.js';
import { rcpeList } from './rcpeList.js';
import { rptWrkShtIngr } from './rptWrkShtIngr.js';
import { rptWrkShtTask } from './rptWrkShtTask.js';
import { taskList } from './taskList.js';
import { userAcctList } from './userAcctList.js';
import { userLogin } from './userLogin.js';
import { vndrList } from './vndrList.js';
import { wrkrList } from './wrkrList.js';

// Create EVENTS array
export const EVENTS = [
  brndList,
  btchMapping,
  gridAvailable,
  gridMapped,
  gridRcpe,
  ingrBtchList,
  ingrList,
  ingrTypeList,
  measList,
  prodBtchList,
  prodList,
  prodListAll,
  prodTypeList,
  rcpeList,
  rptWrkShtIngr,
  rptWrkShtTask,
  taskList,
  userAcctList,
  userLogin,
  vndrList,
  wrkrList
];

// Helper functions (matching the old eventTypes.js interface)
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