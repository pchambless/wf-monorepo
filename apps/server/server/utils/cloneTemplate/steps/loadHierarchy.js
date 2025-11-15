import logger from '../../logger.js';
import * as sessionManager from '../sessionManager.js';
import execEventController from '../../../controller/execEvent.js';

const codeName = '[loadHierarchy.js]';

/**
 * Helper: Set pageID in context_store for claude@whatsfresh.ai
 */
async function setPageIDContext(pageID) {
  const setValsReq = {
    method: 'POST',
    originalUrl: '/api/setVals (internal)',
    body: {
      values: [{ paramName: 'pageID', paramVal: pageID }],
      userEmail: 'claude@whatsfresh.ai'
    }
  };
  const setValsRes = {
    json: () => {},
    status: () => ({ json: () => {} })
  };

  const { default: setValsController } = await import('../../../controller/setVals.js');
  await setValsController(setValsReq, setValsRes);
}

/**
 * Step 1: Load template hierarchy
 * Fetches component structure from template page
 *
 * @param {Object} session - Clone session object
 * @returns {Promise<Object>} Result with componentCount and hierarchy
 */
export async function loadHierarchy(session) {
  logger.info(`${codeName} Loading hierarchy for template ${session.template_id}`);

  // Set pageID in context_store for template queries
  await setPageIDContext(session.template_id);

  // Create mock request/response objects for execEvent controller
  const mockReq = {
    method: 'POST',
    originalUrl: '/api/execEvent (internal)',
    body: {
      eventSQLId: 'studio-xrefHierarchy',
      userEmail: 'claude@whatsfresh.ai'
    }
  };

  let hierarchyResult;
  const mockRes = {
    json: (data) => { hierarchyResult = data; },
    status: (code) => ({
      json: (data) => {
        const error = new Error(data.message || 'Failed to load hierarchy');
        error.status = code;
        error.code = data.error;
        throw error;
      }
    })
  };

  await execEventController(mockReq, mockRes);

  if (!hierarchyResult || !hierarchyResult.data || !hierarchyResult.data[0]) {
    throw new Error('Failed to load template hierarchy');
  }

  // studio-xrefHierarchy returns data[0] as the component array
  const hierarchy = hierarchyResult.data[0];
  logger.info(`${codeName} Loaded ${hierarchy.length} components from template`);

  // Update session with hierarchy
  await sessionManager.updateSession(session.session_id, {
    current_step: 'hierarchy',
    template_hierarchy: hierarchy
  });

  return {
    componentCount: hierarchy.length,
    hierarchy
  };
}
