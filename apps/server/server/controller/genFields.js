/**
 * genFields Controller
 * Extract table and field names from eventType for schema analysis
 * OR generate field configurations using AI stored procedure
 * POST /api/studio/genFields
 */

import { getEventType } from "../events/index.js";
import { executeQuery } from "../utils/dbUtils.js";
import logger from "../utils/logger.js";

const codeName = "[genFields.js]";

/**
 * Dual-purpose field generation endpoint:
 * 1. Extract fields from eventType SQL: { qry: "planDtl" }
 * 2. Generate fields from schema: { tableName: "ingredient_types", componentType: "Form" }
 * POST /api/studio/genFields
 */
async function genFields(req, res) {
  try {
    const { qry, tableName, componentType } = req.body;

    // Route 1: Generate fields from table schema using stored procedure
    if (tableName && componentType) {
      return await generateFieldsFromSchema(req, res);
    }

    // Route 2: Extract fields from eventType SQL (legacy)
    if (!qry) {
      return res.status(400).json({
        success: false,
        message: "Either 'qry' or 'tableName+componentType' required",
      });
    }

    logger.debug(`${codeName} Extracting schema info for: ${qry}`);

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
 * Generate field configurations using sp_ai_generate_fields
 * Body: { tableName: "ingredient_types", componentType: "Form" }
 */
async function generateFieldsFromSchema(req, res) {
  try {
    const { tableName, componentType } = req.body;

    if (!['Form', 'Grid', 'Select'].includes(componentType)) {
      return res.status(400).json({
        success: false,
        message: 'componentType must be Form, Grid, or Select',
      });
    }

    logger.debug(`${codeName} Calling sp_ai_generate_fields for: ${tableName}, type: ${componentType}`);

    const query = `CALL api_wf.sp_ai_generate_fields('${tableName}', '${componentType}')`;
    const results = await executeQuery(query, 'GET');

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No columns found for table: ${tableName}`,
      });
    }

    logger.info(`${codeName} Generated ${results.length} field configurations`);

    res.json({
      success: true,
      data: results,
      count: results.length,
      tableName,
      componentType
    });

  } catch (error) {
    logger.error(`${codeName} Error generating fields from schema:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate fields',
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