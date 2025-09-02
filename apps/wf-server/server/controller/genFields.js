/**
 * genFields Controller
 * Extract table and field names from eventType for schema analysis
 * POST /api/studio/genFields
 */

import { getEventType } from "../events/index.js";
import logger from "../utils/logger.js";

const codeName = "[genFields.js]";

/**
 * Extract db_table and fieldNames from eventType
 * POST /api/studio/genFields
 * Body: { qry: "planDtl" }
 */
async function genFields(req, res) {
  try {
    const { qry } = req.body;

    if (!qry) {
      return res.status(400).json({
        success: false,
        message: "qry parameter is required",
      });
    }

    logger.debug(`${codeName} Extracting schema info for: ${qry}`);

    // Get the eventType definition
    const eventType = getEventType(qry);
    
    if (!eventType) {
      return res.status(404).json({
        success: false,
        message: `EventType not found: ${qry}`,
      });
    }

    if (!eventType.qrySQL || !eventType.dbTable) {
      return res.status(400).json({
        success: false,
        message: `EventType ${qry} missing qrySQL or dbTable`,
      });
    }

    // Extract field names from SELECT statement
    const fieldNames = extractFieldsFromSQL(eventType.qrySQL);

    const result = {
      success: true,
      data: {
        dbTable: eventType.dbTable,
        fieldNames: fieldNames,
        primaryKey: eventType.primaryKey
      }
    };

    logger.debug(`${codeName} Extracted ${fieldNames.length} fields from ${eventType.dbTable}`);
    res.json(result);

  } catch (error) {
    logger.error(`${codeName} Error extracting schema info:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to extract schema info",
      error: error.message
    });
  }
}

/**
 * Extract field names from SQL SELECT statement
 */
function extractFieldsFromSQL(qrySQL) {
  // Find the SELECT clause
  const selectMatch = qrySQL.match(/SELECT\s+([\s\S]*?)\s+FROM/i);
  if (!selectMatch) {
    throw new Error("Could not parse SELECT statement");
  }

  const selectClause = selectMatch[1];
  
  // Split by commas and clean up field names
  const fieldNames = selectClause
    .split(',')
    .map(field => {
      // Remove whitespace and extract just the field name (handle aliases)
      const cleaned = field.trim();
      const parts = cleaned.split(/\s+as\s+/i);
      return parts[parts.length - 1].replace(/[`"']/g, '');
    })
    .filter(field => field.length > 0);

  return fieldNames;
}

export { genFields };