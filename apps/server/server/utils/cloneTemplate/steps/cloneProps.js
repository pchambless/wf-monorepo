import logger from '../../logger.js';
import * as sessionManager from '../sessionManager.js';
import { executeQuery } from '../../dbUtils.js';
import execEventTypeController from '../../../controller/execEventType.js';
import { replaceTokens } from '../helpers/replaceTokens.js';
import { buildBulkInsertSQL } from '../helpers/buildSQL.js';

const codeName = '[cloneProps.js]';

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
 * Step 3: Clone props with token replacement
 * Stages props with new xref_ids and commits immediately to eventProps
 *
 * @param {Object} session - Clone session object
 * @returns {Promise<Object>} Result with propsCount, committed count, and stagedProps
 */
export async function cloneProps(session) {
  logger.info(`${codeName} Cloning props for template pageID ${session.template_id}`);

  if (!session.template_hierarchy) {
    throw new Error('Template hierarchy not loaded. Run hierarchy step first.');
  }

  if (!session.id_mapping) {
    throw new Error('ID mapping not found. Run components step first.');
  }

  const idMap = session.id_mapping;
  const targetPageName = session.metadata?.targetPageName;
  const stagedProps = [];

  // Set pageID in context_store for template queries
  await setPageIDContext(session.template_id);

  // Load ALL props for the template page in one query
  const mockReq = {
    method: 'POST',
    originalUrl: '/api/execEventType (internal)',
    body: {
      eventSQLId: 'pageProps',
      userEmail: 'claude@whatsfresh.ai'
    }
  };

  let propsResult;
  const mockRes = {
    json: (data) => { propsResult = data; },
    status: (code) => ({
      json: (data) => {
        throw new Error(`Failed to load props for pageID ${session.template_id}: ${data.message}`);
      }
    })
  };

  await execEventTypeController(mockReq, mockRes);

  if (!propsResult || !propsResult.data || propsResult.data.length === 0) {
    logger.info(`${codeName} No props found for template`);
    await sessionManager.updateSession(session.session_id, {
      current_step: 'props',
      staged_props: [],
      props_committed: true
    });
    return { propsCount: 0, committed: 0, stagedProps: [] };
  }

  const allProps = propsResult.data;
  logger.info(`${codeName} Loaded ${allProps.length} props from template`);

  // Clone each prop with token replacement and new xref_id
  for (const prop of allProps) {
    const oldXrefID = prop.xref_id;
    const newXrefID = idMap[oldXrefID];

    if (!newXrefID) {
      logger.warn(`${codeName} No ID mapping found for xref_id ${oldXrefID}, skipping prop`);
      continue;
    }

    const newProp = {
      xref_id: newXrefID,
      paramName: prop.paramName,
      paramVal: replaceTokens(prop.paramVal, targetPageName),
      comp_name: prop.comp_name,
      comp_type: prop.comp_type
    };

    stagedProps.push(newProp);
  }

  logger.info(`${codeName} Staged ${stagedProps.length} props`);

  // Commit props to database immediately
  const propsToInsert = stagedProps.map(prop => {
    // Filter out metadata fields (comp_name, comp_type)
    const { comp_name, comp_type, ...insertData } = prop;
    return insertData;
  });

  const propsSql = buildBulkInsertSQL('api_wf.eventProps', propsToInsert);
  logger.debug(`${codeName} Committing ${propsToInsert.length} props`);
  const propsResult2 = await executeQuery(propsSql);
  const affectedRows = propsResult2.affectedRows || propsResult2[0]?.affectedRows || 0;
  logger.info(`${codeName} Committed ${affectedRows} props to eventProps`);

  // Update session with staged props and commit status
  await sessionManager.updateSession(session.session_id, {
    current_step: 'props',
    staged_props: stagedProps,
    props_committed: true
  });

  return {
    propsCount: stagedProps.length,
    committed: affectedRows,
    stagedProps
  };
}
