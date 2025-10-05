import { validateAccess } from './core/validateAccess.js';
import { refreshContext } from './core/refreshContext.js';
import { createRecord } from './core/createRecord.js';
import { updateRecord } from './core/updateRecord.js';
import { execEvent } from './core/execEvent.js';
import { createCommunication } from './createCommunication.js';
import { createPlanImpact } from './createPlanImpact.js';

export const planManagerWorkflows = {
  validateAccess,
  refreshContext,
  createRecord,
  updateRecord,
  execEvent,
  createCommunication,
  createPlanImpact
};

// Export individual workflows for direct import
export {
  validateAccess,
  refreshContext,
  createRecord,
  updateRecord,
  execEvent,
  createCommunication,
  createPlanImpact
};