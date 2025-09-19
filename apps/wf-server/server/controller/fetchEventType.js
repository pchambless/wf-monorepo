import { executeQuery } from '../utils/dbUtils.js';
import logger from '../utils/logger.js';

const codeName = `[fetchEventType.js]`;

/**
 * Fetch eventType_xref record by xrefId for editing
 * Returns minimal fields needed for Studio component editing
 */
const fetchEventType = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { xrefId } = req.params;

  if (!xrefId) {
    return res.status(400).json({
      error: 'MISSING_XREF_ID',
      message: 'xrefId parameter is required'
    });
  }

  try {
    // Use vw_hier_components for minimal eventType data
    const fetchSQL = `
      SELECT
        id,
        comp_name,
        posOrder,
        props,
        tmplt_def
      FROM vw_hier_components
      WHERE id = ?
    `;

    logger.debug(`${codeName} Fetching eventType from vw_hier_components with xrefId: ${xrefId}`);

    const result = await executeQuery(fetchSQL.replace('?', xrefId), 'GET');

    if (!result || result.length === 0) {
      return res.status(404).json({
        error: 'EVENTTYPE_NOT_FOUND',
        message: `No eventType found with xrefId: ${xrefId}`
      });
    }

    const eventType = result[0];

    // Parse JSON fields safely
    let parsedProps = null;
    let parsedTmpltDef = null;

    try {
      parsedProps = eventType.props ? JSON.parse(eventType.props) : {};
    } catch (e) {
      logger.warn(`${codeName} Invalid JSON in props field for xrefId ${xrefId}: ${e.message}`);
      parsedProps = eventType.props; // Return as string if invalid JSON
    }

    try {
      parsedTmpltDef = eventType.tmplt_def ? JSON.parse(eventType.tmplt_def) : {};
    } catch (e) {
      logger.warn(`${codeName} Invalid JSON in tmplt_def field for xrefId ${xrefId}: ${e.message}`);
      parsedTmpltDef = eventType.tmplt_def; // Return as string if invalid JSON
    }

    const response = {
      id: eventType.id,
      comp_name: eventType.comp_name,
      posOrder: eventType.posOrder,
      props: parsedProps,
      tmplt_def: parsedTmpltDef
    };

    logger.info(`${codeName} EventType fetched: ${eventType.comp_name} (xrefId: ${xrefId})`);

    res.json(response);

  } catch (error) {
    logger.error(`${codeName} EventType fetch failed for xrefId ${xrefId}:`, error);

    res.status(500).json({
      error: 'EVENTTYPE_FETCH_FAILED',
      message: error.message,
      xrefId: xrefId
    });
  }
};

export default fetchEventType;