import logger from '../../logger.js';
import * as sessionManager from '../sessionManager.js';
import { executeQuery } from '../../dbUtils.js';
import execEventTypeController from '../../../controller/execEventType.js';
import { replaceTokensInJSON } from '../helpers/replaceTokens.js';
import { buildBulkInsertSQL } from '../helpers/buildSQL.js';

const codeName = '[cloneTriggers.js]';

/**
 * Helper: Set pageID in context_store
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
 * Step 5: Clone triggers with token replacement
 * MUST run AFTER eventSQL step (triggers reference eventSQL qryName in content)
 * Stages triggers and commits immediately to eventTrigger table
 *
 * @param {Object} session - Clone session object
 * @returns {Promise<Object>} Result with triggersCount, committed count, and stagedTriggers
 */
export async function cloneTriggers(session) {
  logger.info(`${codeName} Cloning triggers for template pageID ${session.template_id}`);

  if (!session.template_hierarchy) {
    throw new Error('Template hierarchy not loaded. Run hierarchy step first.');
  }

  if (!session.id_mapping) {
    throw new Error('ID mapping not found. Run components step first.');
  }

  const idMap = session.id_mapping;
  const targetPageName = session.metadata?.targetPageName;
  const stagedTriggers = [];

  // Set pageID in context_store for template queries
  await setPageIDContext(session.template_id);

  // Load ALL triggers for the template page in one query
  const mockReq = {
    method: 'POST',
    originalUrl: '/api/execEventType (internal)',
    body: {
      eventSQLId: 'pageTriggers',
      userEmail: 'claude@whatsfresh.ai'
    }
  };

  let triggersResult;
  const mockRes = {
    json: (data) => { triggersResult = data; },
    status: (code) => ({
      json: (data) => {
        throw new Error(`Failed to load triggers for pageID ${session.template_id}: ${data.message}`);
      }
    })
  };

  await execEventTypeController(mockReq, mockRes);

  if (!triggersResult || !triggersResult.data || triggersResult.data.length === 0) {
    logger.info(`${codeName} No triggers found for template`);
    await sessionManager.updateSession(session.session_id, {
      current_step: 'triggers',
      staged_triggers: [],
      triggers_committed: true
    });
    return { triggersCount: 0, committed: 0, stagedTriggers: [] };
  }

  const allTriggers = triggersResult.data;
  logger.info(`${codeName} Loaded ${allTriggers.length} triggers from template`);

  // Clone each trigger with token replacement and new xref_id
  for (const trigger of allTriggers) {
    const oldXrefID = trigger.xref_id;
    const newXrefID = idMap[oldXrefID];

    if (!newXrefID) {
      logger.warn(`${codeName} No ID mapping found for xref_id ${oldXrefID}, skipping trigger`);
      continue;
    }

    const newTrigger = {
      xref_id: newXrefID,
      class: trigger.class,
      action: trigger.action,
      ordr: trigger.ordr,
      content: replaceTokensInJSON(trigger.content, targetPageName),
      comp_name: trigger.comp_name,
      comp_type: trigger.comp_type
    };

    stagedTriggers.push(newTrigger);
  }

  logger.info(`${codeName} Staged ${stagedTriggers.length} triggers`);

  // Commit triggers to database immediately
  const triggersToInsert = stagedTriggers.map(trigger => {
    // Filter out metadata fields (comp_name, comp_type)
    const { comp_name, comp_type, ...insertData } = trigger;
    return insertData;
  });

  const triggersSql = buildBulkInsertSQL('api_wf.eventTrigger', triggersToInsert);
  logger.debug(`${codeName} Committing ${triggersToInsert.length} triggers`);
  const triggersResult2 = await executeQuery(triggersSql);
  const affectedRows = triggersResult2.affectedRows || triggersResult2[0]?.affectedRows || 0;
  logger.info(`${codeName} Committed ${affectedRows} triggers to eventTrigger`);

  // Update session with staged triggers and commit status
  await sessionManager.updateSession(session.session_id, {
    current_step: 'triggers',
    staged_triggers: stagedTriggers,
    triggers_committed: true
  });

  return {
    triggersCount: stagedTriggers.length,
    committed: affectedRows,
    stagedTriggers
  };
}
