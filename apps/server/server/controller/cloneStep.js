import logger from '../utils/logger.js';
import * as sessionManager from '../utils/cloneTemplate/sessionManager.js';
import execEventTypeController from './execEventType.js';
import { executeQuery } from '../utils/dbUtils.js';

const codeName = '[cloneStep.js]';

/**
 * Helper: Set pageID in context_store for claude@whatsfresh.ai
 */
async function setPageIDContext(pageID) {
  const setValsReq = {
    body: {
      values: [{ paramName: 'pageID', paramVal: pageID }],
      userEmail: 'claude@whatsfresh.ai'
    }
  };
  const setValsRes = {
    json: () => {},
    status: () => ({ json: () => {} })
  };

  const { default: setValsController } = await import('./setVals.js');
  await setValsController(setValsReq, setValsRes);
}

/**
 * Clone Step API Handler
 * Executes individual steps of the template cloning workflow
 *
 * Body params:
 * - sessionID: string (required) - Session identifier
 * - step: string (required) - Step name: 'hierarchy' | 'components' | 'props' | 'triggers' | 'eventSQL'
 * - templateID: number (optional) - Template page ID (for new sessions)
 * - targetID: number (optional) - Target page ID (for new sessions)
 * - targetPageName: string (optional) - Target page name for token replacement (for new sessions)
 *
 * Staged Data Notes:
 * - Props and Triggers include comp_name and comp_type for debugging
 * - These metadata fields should be filtered out before INSERT (in commit function)
 * - Only xref_id, paramName, paramVal are inserted for props
 * - Only xref_id, class, action, ordr, content are inserted for triggers
 */
const cloneStep = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  try {
    const { sessionID, step, templateID, targetID, targetPageName } = req.body;

    // Validate required params
    if (!step) {
      return res.status(400).json({
        error: 'MISSING_STEP',
        message: 'Step parameter is required'
      });
    }

    let session;

    // If no sessionID, create new session
    if (!sessionID) {
      if (!templateID || !targetID) {
        return res.status(400).json({
          error: 'MISSING_PARAMS',
          message: 'templateID and targetID required for new session'
        });
      }

      const newSessionID = await sessionManager.createSession(templateID, targetID, 'claude');
      session = await sessionManager.loadSession(newSessionID);
      logger.info(`${codeName} Created new session: ${newSessionID}`);
    } else {
      session = await sessionManager.loadSession(sessionID);
      logger.info(`${codeName} Loaded existing session: ${sessionID}`);
    }

    // Execute the requested step
    let result;
    switch (step) {
      case 'hierarchy':
        result = await loadHierarchy(session);
        break;
      case 'components':
        result = await cloneComponents(session);
        break;
      case 'props':
        result = await cloneProps(session);
        break;
      case 'triggers':
        result = await cloneTriggers(session);
        break;
      case 'eventSQL':
        result = await cloneEventSQL(session);
        break;
      case 'commit':
        result = await commitClone(sessionID || session.session_id);
        break;
      default:
        return res.status(400).json({
          error: 'INVALID_STEP',
          message: `Unknown step: ${step}. Valid steps: hierarchy, components, props, triggers, eventSQL, commit`
        });
    }

    logger.info(`${codeName} Step '${step}' completed successfully`);
    res.json({
      success: true,
      sessionID: session.session_id,
      step,
      result
    });

  } catch (error) {
    logger.error(`${codeName} Clone step failed:`, error);

    const status = error.status || 500;
    res.status(status).json({
      error: error.code || 'CLONE_STEP_FAILED',
      message: error.message,
      ...(error.details && { details: error.details })
    });
  }
};

/**
 * Step 1: Load template hierarchy
 */
async function loadHierarchy(session) {
  logger.info(`${codeName} Loading hierarchy for template ${session.template_id}`);

  // Set pageID in context_store for template queries
  await setPageIDContext(session.template_id);

  // Create mock request/response objects for execEventType controller
  const mockReq = {
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

  await execEventTypeController(mockReq, mockRes);

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

/**
 * Step 2: Clone components with ID mapping
 */
async function cloneComponents(session) {
  logger.info(`${codeName} Cloning components`);

  if (!session.template_hierarchy) {
    throw new Error('Template hierarchy not loaded. Run hierarchy step first.');
  }

  if (!session.metadata || !session.metadata.targetPageName) {
    throw new Error('Target page name not found in session metadata');
  }

  const hierarchy = session.template_hierarchy;
  const targetPageName = session.metadata.targetPageName;
  const idMap = {};
  const stagedComponents = [];

  logger.info(`${codeName} Target page: ${targetPageName} (ID: ${session.target_id})`);

  // First pass: Generate new IDs and create ID mapping
  let nextID = await getNextComponentID();

  for (const comp of hierarchy) {
    const oldID = comp.id;
    const newID = nextID++;
    idMap[oldID] = newID;
    logger.debug(`${codeName} ID mapping: ${oldID} → ${newID}`);
  }

  // Second pass: Clone components with mapped IDs and token replacement
  for (const comp of hierarchy) {
    const newComp = {
      id: idMap[comp.id],
      pageID: session.target_id,
      parent_id: comp.parent_id === comp.id ? idMap[comp.id] : idMap[comp.parent_id],
      comp_name: comp.comp_name,
      comp_type: comp.comp_type,
      title: replaceTokens(comp.title, targetPageName),
      description: replaceTokens(comp.description, targetPageName),
      posOrder: comp.posOrder,
      style: comp.override_styles
      // Note: 'active' is a generated/virtual column - do not include in INSERT
    };

    stagedComponents.push(newComp);
  }

  logger.info(`${codeName} Staged ${stagedComponents.length} components`);

  // Update session with staged components and ID mapping
  await sessionManager.updateSession(session.session_id, {
    current_step: 'components',
    id_mapping: idMap,
    staged_components: stagedComponents
  });

  return {
    componentCount: stagedComponents.length,
    idMap,
    stagedComponents
  };
}

/**
 * Get next available component ID from database
 */
async function getNextComponentID() {
  const mockReq = {
    body: {
      eventSQLId: 'nextXrefID'
    }
  };

  let result;
  const mockRes = {
    json: (data) => { result = data; },
    status: (code) => ({
      json: (data) => { throw new Error(data.message || 'Failed to get next ID'); }
    })
  };

  await execEventTypeController(mockReq, mockRes);

  if (!result || !result.data || !result.data[0]) {
    throw new Error('Failed to get next component ID');
  }

  const nextID = result.data[0].nextID;
  return nextID;
}

/**
 * Replace {pageName} tokens in strings
 */
function replaceTokens(str, pageName) {
  if (!str) return str;
  return str.replace(/\{pageName\}/g, pageName);
}

/**
 * Step 3: Clone props with token replacement
 */
async function cloneProps(session) {
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
      staged_props: []
    });
    return { propsCount: 0, stagedProps: [] };
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

  // Update session with staged props
  await sessionManager.updateSession(session.session_id, {
    current_step: 'props',
    staged_props: stagedProps
  });

  return {
    propsCount: stagedProps.length,
    stagedProps
  };
}

/**
 * Step 4: Clone triggers with token replacement
 */
async function cloneTriggers(session) {
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
      staged_triggers: []
    });
    return { triggersCount: 0, stagedTriggers: [] };
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

  // Update session with staged triggers
  await sessionManager.updateSession(session.session_id, {
    current_step: 'triggers',
    staged_triggers: stagedTriggers
  });

  return {
    triggersCount: stagedTriggers.length,
    stagedTriggers
  };
}

/**
 * Replace tokens in JSON content (for triggers)
 */
function replaceTokensInJSON(content, pageName) {
  if (!content) return content;

  // If content is a string, try to parse it
  let obj = content;
  if (typeof content === 'string') {
    try {
      obj = JSON.parse(content);
    } catch (e) {
      // If not JSON, just do string replacement
      return replaceTokens(content, pageName);
    }
  }

  // Recursively replace tokens in object
  const replaced = JSON.stringify(obj);
  const result = replaceTokens(replaced, pageName);

  try {
    return JSON.parse(result);
  } catch (e) {
    return result;
  }
}

/**
 * Step 6: Commit staged data to production tables
 * Filters out metadata fields and performs bulk INSERTs
 */
async function commitClone(sessionId) {
  const session = await sessionManager.loadSession(sessionId);

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  if (session.status === 'committed') {
    throw new Error(`Session already committed: ${sessionId}`);
  }

  if (session.current_step !== 'eventSQL') {
    throw new Error(`Cannot commit: session must complete all 5 steps (current: ${session.current_step})`);
  }

  logger.info(`${codeName} Committing session ${sessionId}`);

  const results = {
    components: 0,
    props: 0,
    triggers: 0,
    eventsql: 0
  };

  try {
    // 1. INSERT staged_components → eventComp_xref
    if (session.staged_components && session.staged_components.length > 0) {
      const componentsToInsert = session.staged_components.map(comp => {
        // Filter out metadata fields (comp_name, comp_type)
        const { comp_name, comp_type, ...insertData } = comp;
        return insertData;
      });

      const componentsSql = buildBulkInsertSQL('api_wf.eventComp_xref', componentsToInsert);
      logger.debug(`${codeName} Components SQL: ${componentsSql.substring(0, 200)}...`);
      const componentResult = await executeQuery(componentsSql);
      logger.debug(`${codeName} Component result:`, componentResult);
      results.components = componentResult.affectedRows || componentResult[0]?.affectedRows || 0;
      logger.info(`${codeName} Inserted ${results.components} components`);
    }

    // 2. INSERT staged_props → eventProps
    if (session.staged_props && session.staged_props.length > 0) {
      const propsToInsert = session.staged_props.map(prop => {
        // Filter out metadata fields, keep only: xref_id, paramName, paramVal
        const { comp_name, comp_type, ...insertData } = prop;
        return insertData;
      });

      const propsSql = buildBulkInsertSQL('api_wf.eventProps', propsToInsert);
      const propsResult = await executeQuery(propsSql);
      results.props = propsResult.affectedRows || propsResult[0]?.affectedRows || 0;
      logger.info(`${codeName} Inserted ${results.props} props`);
    }

    // 3. INSERT staged_triggers → eventTrigger
    if (session.staged_triggers && session.staged_triggers.length > 0) {
      const triggersToInsert = session.staged_triggers.map(trigger => {
        // Filter out metadata fields, keep only: xref_id, class, action, ordr, content
        const { comp_name, comp_type, ...insertData } = trigger;
        return insertData;
      });

      const triggersSql = buildBulkInsertSQL('api_wf.eventTrigger', triggersToInsert);
      const triggersResult = await executeQuery(triggersSql);
      results.triggers = triggersResult.affectedRows || triggersResult[0]?.affectedRows || 0;
      logger.info(`${codeName} Inserted ${results.triggers} triggers`);
    }

    // 4. INSERT staged_eventsql → eventSQL
    if (session.staged_eventsql && session.staged_eventsql.length > 0) {
      const eventsqlToInsert = session.staged_eventsql.map(sql => {
        // Filter out metadata fields (xref_id, comp_name, comp_type), keep only: grp, qryName, qrySQL
        const { xref_id, comp_name, comp_type, ...insertData } = sql;
        return insertData;
      });

      const eventsqlSql = buildBulkInsertSQL('api_wf.eventSQL', eventsqlToInsert);
      const eventsqlResult = await executeQuery(eventsqlSql);
      results.eventsql = eventsqlResult.affectedRows || eventsqlResult[0]?.affectedRows || 0;
      logger.info(`${codeName} Inserted ${results.eventsql} eventSQL entries`);
    }

    // 5. Update session status to 'committed'
    await sessionManager.updateSession(sessionId, {
      status: 'committed',
      committed_at: new Date().toISOString()
    });

    logger.info(`${codeName} Session ${sessionId} committed successfully`, results);

    return {
      success: true,
      sessionId,
      results
    };

  } catch (error) {
    logger.error(`${codeName} Commit failed for session ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Build bulk INSERT SQL statement
 * @param {string} table - Table name (schema.table)
 * @param {Array} records - Array of objects to insert
 * @returns {string} SQL statement
 */
function buildBulkInsertSQL(table, records) {
  if (!records || records.length === 0) {
    throw new Error('No records to insert');
  }

  // Get column names from first record
  const columns = Object.keys(records[0]);
  const columnList = columns.join(', ');

  // Build VALUES clause
  const valueRows = records.map(record => {
    const values = columns.map(col => {
      const value = record[col];
      if (value === null || value === undefined) {
        return 'NULL';
      }
      if (typeof value === 'number') {
        return value;
      }
      // Escape single quotes and wrap in quotes
      const escaped = String(value).replace(/'/g, "''");
      return `'${escaped}'`;
    });
    return `(${values.join(', ')})`;
  });

  return `INSERT INTO ${table} (${columnList}) VALUES ${valueRows.join(', ')}`;
}

/**
 * Step 5: Clone EventSQL queries with token replacement
 */
async function cloneEventSQL(session) {
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

  await execEventTypeController(mockReq, mockRes);

  if (!sqlResult || !sqlResult.data || sqlResult.data.length === 0) {
    logger.info(`${codeName} No eventSQL found for template`);
    await sessionManager.updateSession(session.session_id, {
      current_step: 'eventSQL',
      staged_eventsql: []
    });
    return { eventSQLCount: 0, stagedEventSQL: [] };
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

  // Update session with staged eventSQL
  await sessionManager.updateSession(session.session_id, {
    current_step: 'eventSQL',
    staged_eventsql: stagedEventSQL
  });

  return {
    eventSQLCount: stagedEventSQL.length,
    stagedEventSQL
  };
}

export default cloneStep;
