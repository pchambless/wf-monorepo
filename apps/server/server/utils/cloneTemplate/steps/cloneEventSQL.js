import logger from '../../logger.js';
import * as sessionManager from '../sessionManager.js';
import { executeQuery } from '../../dbUtils.js';
import execEventController from '../../../controller/execEvent.js';
import { replaceTokens } from '../helpers/replaceTokens.js';
import { buildBulkInsertSQL } from '../helpers/buildSQL.js';

const codeName = '[cloneEventSQL.js]';

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
 * Step 4: Clone EventSQL queries with token replacement
 * MUST run BEFORE triggers step (triggers reference eventSQL qryName)
 * Stages eventSQL queries and commits immediately to eventSQL table
 *
 * @param {Object} session - Clone session object
 * @returns {Promise<Object>} Result with eventSQLCount, committed count, and stagedEventSQL
 */
export async function cloneEventSQL(session) {
  logger.info(`${codeName} Cloning eventSQL for template pageID ${session.template_id}`);

  if (!session.metadata || !session.metadata.targetPageName) {
    throw new Error('Target page name not found in session metadata');
  }

  if (!session.id_mapping) {
    throw new Error('ID mapping not found. Run components step first.');
  }

  const idMap = session.id_mapping;
  const targetPageName = session.metadata.targetPageName;
  const targetAppName = session.metadata.targetAppName || 'unknown';
  const stagedEventSQL = [];

  logger.info(`${codeName} Using targetAppName from session metadata: ${targetAppName}`);

  // Set pageID in context_store for template queries
  await setPageIDContext(session.template_id);

  // Load ALL eventSQL for the template page in one query
  const mockReq = {
    method: 'POST',
    originalUrl: '/api/execEvent (internal)',
    body: {
      eventSQLId: 'pageSQL',
      userEmail: 'claude@whatsfresh.ai'
    }
  };

  let sqlResult;
  const mockRes = {
    json: (data) => { sqlResult = data; },
    status: (code) => ({
      json: (data) => {
        throw new Error(`Failed to load eventSQL for pageID ${session.template_id}: ${data.message}`);
      }
    })
  };

  await execEventController(mockReq, mockRes);

  if (!sqlResult || !sqlResult.data || sqlResult.data.length === 0) {
    logger.info(`${codeName} No eventSQL found for template`);
    await sessionManager.updateSession(session.session_id, {
      current_step: 'eventSQL',
      staged_eventsql: [],
      eventsql_committed: true
    });
    return { eventSQLCount: 0, committed: 0, stagedEventSQL: [] };
  }

  const allSQL = sqlResult.data;
  logger.info(`${codeName} Loaded ${allSQL.length} eventSQL from template`);

  // Clone each eventSQL with token replacement
  for (const sql of allSQL) {
    const oldXrefID = sql.xref_id;
    const newXrefID = idMap[oldXrefID];

    if (!newXrefID) {
      logger.warn(`${codeName} No ID mapping found for xref_id ${oldXrefID}, skipping eventSQL`);
      continue;
    }

    const newSQL = {
      grp: targetAppName,
      qryName: replaceTokens(sql.qryName, targetPageName),
      qrySQL: 'Create SQL',
      xref_id: newXrefID,
      comp_name: sql.comp_name,
      comp_type: sql.comp_type
    };

    stagedEventSQL.push(newSQL);
  }

  logger.info(`${codeName} Staged ${stagedEventSQL.length} eventSQL queries`);

  // Commit eventSQL to database immediately
  const eventsqlToInsert = stagedEventSQL.map(sql => {
    // Filter out metadata fields (xref_id, comp_name, comp_type)
    const { xref_id, comp_name, comp_type, ...insertData } = sql;
    return insertData;
  });

  const eventsqlSql = buildBulkInsertSQL('api_wf.eventSQL', eventsqlToInsert);
  logger.debug(`${codeName} Committing ${eventsqlToInsert.length} eventSQL queries`);
  const eventsqlResult = await executeQuery(eventsqlSql);
  const affectedRows = eventsqlResult.affectedRows || eventsqlResult[0]?.affectedRows || 0;
  logger.info(`${codeName} Committed ${affectedRows} eventSQL queries to eventSQL table`);

  // Update session with staged eventSQL and commit status
  await sessionManager.updateSession(session.session_id, {
    current_step: 'eventSQL',
    staged_eventsql: stagedEventSQL,
    eventsql_committed: true
  });

  return {
    eventSQLCount: stagedEventSQL.length,
    committed: affectedRows,
    stagedEventSQL
  };
}
