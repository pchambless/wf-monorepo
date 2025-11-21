import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger.js';

const codeName = '[sessionManager.js]';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'api_wf',
  port: process.env.DB_PORT || 3306,
  charset: process.env.DB_CHARSET || 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Session Manager for Clone Template Workflow
 * Handles CRUD operations for clone_session table
 */

/**
 * Create a new clone session
 * Looks up target page name and appName from page_registry
 */
async function createSession(templateID, targetID, createdBy = 'claude', targetPageName = null) {
  // Query page_registry for target page info
  const pageQuery = `
    SELECT id, appName, pageName FROM api_wf.page_registry
    WHERE id = ?
  `;
  const [pageRows] = await pool.query(pageQuery, [targetID]);

  if (!pageRows || pageRows.length === 0) {
    throw new Error(`Target page not found in page_registry: ${targetID}`);
  }

  const targetAppName = pageRows[0].appName;
  const actualPageName = pageRows[0].pageName;

  // Use actual pageName from page_registry, not the parameter
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace('T', '-').replace(/:/g, '');
  const sessionID = `${actualPageName}-${timestamp}`;

  const metadata = JSON.stringify({
    targetPageName: actualPageName,
    targetAppName
  });

  const query = `
    INSERT INTO api_wf.clone_session
    (session_id, template_id, target_id, current_step, status, metadata, created_by)
    VALUES (?, ?, ?, 'init', 'in_progress', ?, ?)
  `;

  await pool.query(query, [sessionID, templateID, targetID, metadata, createdBy]);

  logger.info(`${codeName} Created clone session: ${sessionID} (targetAppName: ${targetAppName})`);
  return sessionID;
}

/**
 * Load session by sessionID
 */
async function loadSession(sessionID) {
  const query = `
    SELECT * FROM api_wf.clone_session
    WHERE session_id = ? AND active = 1
  `;

  const [rows] = await pool.query(query, [sessionID]);

  if (rows.length === 0) {
    throw new Error(`Session not found: ${sessionID}`);
  }

  const session = rows[0];

  // Parse JSON columns (if they're strings)
  session.template_hierarchy = typeof session.template_hierarchy === 'string' ? JSON.parse(session.template_hierarchy) : session.template_hierarchy;
  session.staged_components = typeof session.staged_components === 'string' ? JSON.parse(session.staged_components) : session.staged_components;
  session.staged_props = typeof session.staged_props === 'string' ? JSON.parse(session.staged_props) : session.staged_props;
  session.staged_triggers = typeof session.staged_triggers === 'string' ? JSON.parse(session.staged_triggers) : session.staged_triggers;
  session.staged_eventsql = typeof session.staged_eventsql === 'string' ? JSON.parse(session.staged_eventsql) : session.staged_eventsql;
  session.id_mapping = typeof session.id_mapping === 'string' ? JSON.parse(session.id_mapping) : (session.id_mapping || {});
  session.metadata = typeof session.metadata === 'string' ? JSON.parse(session.metadata) : session.metadata;

  return session;
}

/**
 * Update session with new data
 */
async function updateSession(sessionID, updates, updatedBy = 'claude') {
  const allowedFields = [
    'current_step',
    'status',
    'template_hierarchy',
    'staged_components',
    'staged_props',
    'staged_triggers',
    'staged_eventsql',
    'id_mapping',
    'error_message',
    'committed_at'
  ];

  const setClauses = [];
  const values = [];

  Object.keys(updates).forEach(field => {
    if (allowedFields.includes(field)) {
      setClauses.push(`${field} = ?`);

      // Stringify JSON fields
      if (['template_hierarchy', 'staged_components', 'staged_props',
           'staged_triggers', 'staged_eventsql', 'id_mapping'].includes(field)) {
        values.push(JSON.stringify(updates[field]));
      } else {
        values.push(updates[field]);
      }
    }
  });

  if (setClauses.length === 0) {
    logger.warn(`${codeName} No valid fields to update for session: ${sessionID}`);
    return;
  }

  // Add updated_by
  setClauses.push('updated_by = ?');
  values.push(updatedBy);

  values.push(sessionID);

  const query = `
    UPDATE api_wf.clone_session
    SET ${setClauses.join(', ')}
    WHERE session_id = ?
  `;

  try {
    const [result] = await pool.query(query, values);
    logger.info(`${codeName} Updated session: ${sessionID}`, {
      affectedRows: result.affectedRows,
      fields: Object.keys(updates)
    });

    if (result.affectedRows === 0) {
      logger.warn(`${codeName} No rows updated for session: ${sessionID}`);
    }
  } catch (error) {
    logger.error(`${codeName} Failed to update session: ${sessionID}`, error);
    throw error;
  }
}

/**
 * Get session status
 */
async function getSessionStatus(sessionID) {
  const query = `
    SELECT session_id, current_step, status, error_message
    FROM api_wf.clone_session
    WHERE session_id = ? AND active = 1
  `;

  const [rows] = await pool.query(query, [sessionID]);
  return rows[0] || null;
}

/**
 * List all active sessions
 */
async function listSessions(limit = 10) {
  const query = `
    SELECT
      session_id,
      template_id,
      target_id,
      current_step,
      status,
      created_at,
      created_by
    FROM api_wf.clone_session
    WHERE active = 1
    ORDER BY created_at DESC
    LIMIT ?
  `;

  const [rows] = await pool.query(query, [limit]);
  return rows;
}

/**
 * Delete (soft delete) a session
 */
async function deleteSession(sessionID, deletedBy = 'claude') {
  const query = `
    UPDATE api_wf.clone_session
    SET deleted_at = NOW(), deleted_by = ?
    WHERE session_id = ?
  `;

  await pool.query(query, [deletedBy, sessionID]);
  logger.info(`${codeName} Soft deleted session: ${sessionID}`);
}

export {
  createSession,
  loadSession,
  updateSession,
  getSessionStatus,
  listSessions,
  deleteSession
};
