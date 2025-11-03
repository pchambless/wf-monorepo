import logger from '../../logger.js';
import * as sessionManager from '../sessionManager.js';
import { executeQuery } from '../../dbUtils.js';
import { replaceTokens } from '../helpers/replaceTokens.js';
import { buildBulkInsertSQL } from '../helpers/buildSQL.js';

const codeName = '[cloneComponents.js]';

/**
 * Step 2: Clone components with AUTO_INCREMENT ID generation
 * Uses comp_name as intermediate key for building idMap after MySQL generates IDs
 *
 * @param {Object} session - Clone session object
 * @returns {Promise<Object>} Result with componentCount, committed count, idMap, and stagedComponents
 */
export async function cloneComponents(session) {
  logger.info(`${codeName} Cloning components`);

  if (!session.template_hierarchy) {
    throw new Error('Template hierarchy not loaded. Run hierarchy step first.');
  }

  if (!session.metadata || !session.metadata.targetPageName) {
    throw new Error('Target page name not found in session metadata');
  }

  const hierarchy = session.template_hierarchy;
  const targetPageName = session.metadata.targetPageName;

  logger.info(`${codeName} Target page: ${targetPageName} (ID: ${session.target_id})`);

  // First pass: Build components WITHOUT id field (let MySQL AUTO_INCREMENT)
  const componentsToInsert = [];
  const oldIDToCompName = {};

  for (const comp of hierarchy) {
    oldIDToCompName[comp.id] = comp.comp_name;

    const newComp = {
      pageID: session.target_id,
      parent_id: null,
      comp_name: comp.comp_name,
      comp_type: comp.comp_type,
      title: replaceTokens(comp.title, targetPageName),
      description: replaceTokens(comp.description, targetPageName),
      posOrder: comp.posOrder,
      style: comp.override_styles
    };

    componentsToInsert.push(newComp);
  }

  logger.info(`${codeName} Staged ${componentsToInsert.length} components`);

  // Commit components to database - MySQL generates IDs
  const componentsSql = buildBulkInsertSQL('api_wf.eventComp_xref', componentsToInsert);
  logger.debug(`${codeName} Committing ${componentsToInsert.length} components`);
  const componentResult = await executeQuery(componentsSql);
  const affectedRows = componentResult.affectedRows || componentResult[0]?.affectedRows || 0;
  logger.info(`${codeName} Committed ${affectedRows} components to eventComp_xref`);

  // Query back to get auto-generated IDs
  const lookupQuery = `
    SELECT id, comp_name
    FROM api_wf.eventComp_xref
    WHERE pageID = ${session.target_id} AND active = 1
  `;
  const lookupResult = await executeQuery(lookupQuery);

  // Build comp_name → newID mapping
  const compNameToNewID = {};
  lookupResult.forEach(row => {
    compNameToNewID[row.comp_name] = row.id;
  });

  // Build oldID → newID mapping (for props/triggers)
  const idMap = {};
  for (const comp of hierarchy) {
    const oldID = comp.id;
    const newID = compNameToNewID[comp.comp_name];

    if (!newID) {
      throw new Error(`Failed to find new ID for comp_name: ${comp.comp_name}`);
    }

    idMap[oldID] = newID;
    logger.debug(`${codeName} ID mapping: ${oldID} → ${newID} (${comp.comp_name})`);
  }

  // Second pass: Update parent_id references
  for (const comp of hierarchy) {
    const newID = compNameToNewID[comp.comp_name];
    const newParentID = comp.parent_id === comp.id
      ? newID
      : idMap[comp.parent_id];

    const updateQuery = `
      UPDATE api_wf.eventComp_xref
      SET parent_id = ${newParentID}
      WHERE id = ${newID}
    `;
    await executeQuery(updateQuery);
    logger.debug(`${codeName} Updated parent_id for ${comp.comp_name} (${newID}) → ${newParentID}`);
  }

  logger.info(`${codeName} Updated parent_id references for ${hierarchy.length} components`);

  // Build staged components for session storage
  const stagedComponents = lookupResult.map(row => ({
    id: row.id,
    comp_name: row.comp_name,
    pageID: session.target_id
  }));

  // Update session with ID mapping and commit status
  await sessionManager.updateSession(session.session_id, {
    current_step: 'components',
    id_mapping: idMap,
    staged_components: stagedComponents,
    components_committed: true
  });

  return {
    componentCount: stagedComponents.length,
    committed: affectedRows,
    idMap,
    stagedComponents
  };
}
