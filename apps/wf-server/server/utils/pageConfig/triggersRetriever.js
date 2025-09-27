/**
 * Triggers Retrieval Module
 * Fetches component triggers from eventTrigger table
 */

import { executeQuery } from '../dbUtils.js';
import { setValsDirect } from '../../controller/setVals.js';
import logger from '../logger.js';

const codeName = '[triggersRetriever.js]';

/**
 * Get component triggers from eventTrigger table
 */
export async function getComponentTriggers(xrefId, userEmail = 'pc7900@gmail.com') {
  try {
    logger.debug(`${codeName} Getting triggers for xref_id: ${xrefId}`);

    // Set context
    await setValsDirect(userEmail, [{paramName: 'xrefID', paramVal: xrefId.toString()}]);

    // Execute xrefTriggerList query (eventSQL.id = 6)
    const triggersSQL = 'SELECT qrySQL FROM api_wf.eventSQL WHERE id = 6 AND active = 1';
    const triggersQuery = await executeQuery(triggersSQL, 'GET');

    if (!triggersQuery || triggersQuery.length === 0) {
      logger.warn(`${codeName} xrefTriggerList query not found in eventSQL`);
      return null;
    }

    const finalSQL = triggersQuery[0].qrySQL.replace(':xrefID', xrefId);
    const triggersResult = await executeQuery(finalSQL, 'GET');

    // Transform to workflowTriggers object
    const workflowTriggers = {};
    if (triggersResult && triggersResult.length > 0) {
      triggersResult.forEach(trigger => {
        if (!workflowTriggers[trigger.class]) {
          workflowTriggers[trigger.class] = [];
        }
        workflowTriggers[trigger.class].push({
          action: trigger.action,
          ordr: trigger.ordr,
          content: trigger.content
        });
      });

      const triggerCount = Object.values(workflowTriggers).flat().length;
      logger.debug(`${codeName} Found ${triggerCount} triggers for xref_id: ${xrefId}`);
    }

    return Object.keys(workflowTriggers).length > 0 ? workflowTriggers : null;
  } catch (error) {
    logger.error(`${codeName} Error getting triggers for xref_id ${xrefId}:`, error);
    return null;
  }
}