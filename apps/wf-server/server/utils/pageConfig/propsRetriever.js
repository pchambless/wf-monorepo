/**
 * Props Retrieval Module
 * Fetches component props from eventProps table
 */

import { executeQuery } from '../dbUtils.js';
import { setValsDirect } from '../../controller/setVals.js';
import logger from '../logger.js';

const codeName = '[propsRetriever.js]';

/**
 * Get component props from eventProps table
 */
export async function getComponentProps(xrefId, userEmail = 'pc7900@gmail.com') {
  try {
    logger.debug(`${codeName} Getting props for xref_id: ${xrefId}`);

    // Set context
    await setValsDirect(userEmail, [{paramName: 'xrefID', paramVal: xrefId.toString()}]);

    // Execute xrefPropList query (eventSQL.id = 7)
    const propsSQL = 'SELECT qrySQL FROM api_wf.eventSQL WHERE id = 7 AND active = 1';
    const propsQuery = await executeQuery(propsSQL, 'GET');

    if (!propsQuery || propsQuery.length === 0) {
      logger.warn(`${codeName} xrefPropList query not found in eventSQL`);
      return {};
    }

    const finalSQL = propsQuery[0].qrySQL.replace(':xrefID', xrefId);
    const propsResult = await executeQuery(finalSQL, 'GET');

    // Transform to props object
    const props = {};
    if (propsResult && propsResult.length > 0) {
      propsResult.forEach(prop => {
        // Filter out workflowTriggers - they belong in triggersRetriever.js
        if (prop.paramName === 'workflowTriggers') {
          logger.debug(`${codeName} Skipping workflowTriggers in props for xref_id: ${xrefId} (should come from eventTrigger table)`);
          return;
        }
        
        try {
          props[prop.paramName] = JSON.parse(prop.paramVal);
        } catch {
          props[prop.paramName] = prop.paramVal;
        }
      });
      logger.debug(`${codeName} Found ${Object.keys(props).length} props for xref_id: ${xrefId}`);
    }

    return props;
  } catch (error) {
    logger.error(`${codeName} Error getting props for xref_id ${xrefId}:`, error);
    return {};
  }
}