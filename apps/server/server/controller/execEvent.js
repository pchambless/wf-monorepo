import { executeQuery } from "../utils/dbUtils.js";
import { createRequestBody } from "../utils/queryResolver.js";
import { getValDirect } from "./getVal.js";
import logger from "../utils/logger.js";
import { getUserEmail } from "../utils/getUserEmail.js";

const codeName = `[execEvent.js]`;

/**
 * Execute SQL query from eventSQL table by eventSQL ID
 * Database-driven query execution using eventSQL architecture
 */
const execEvent = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { eventSQLId, params } = req.body;

  if (!eventSQLId) {
    return res.status(400).json({
      error: "MISSING_EVENTSQL_ID",
      message: "eventSQLId is required",
    });
  }

  try {
    // Determine if eventSQLId is a name (string) or ID (number)
    const isName = isNaN(eventSQLId);
    const lookupField = isName ? "qryName" : "id";
    const lookupValue = isName ? `'${eventSQLId}'` : eventSQLId;

    // Fetch SQL query from eventSQL table
    const fetchSQL = `
      SELECT id, qryName, qrySQL, description
      FROM api_wf.eventSQL
      WHERE ${lookupField} = ${lookupValue} AND active = 1
    `;

    logger.debug(
      `${codeName} Fetching eventSQL by ${lookupField}: ${eventSQLId}`
    );

    // Execute query to get the SQL from eventSQL table
    const fetchResult = await executeQuery(fetchSQL, "GET");

    if (!fetchResult || fetchResult.length === 0) {
      return res.status(404).json({
        error: "EVENTSQL_NOT_FOUND",
        message: `No active eventSQL found with ID: ${eventSQLId}`,
      });
    }

    const eventSQLData = fetchResult[0];
    const { id, qryName, qrySQL } = eventSQLData;

    logger.debug(`${codeName} Found eventSQL: ${qryName} (ID: ${id})`);

    // Auto-resolve context parameters
    let finalSQL = qrySQL;
    const paramMatches = finalSQL.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);

    if (paramMatches) {
      // Get user email using centralized function
      const userEmail = getUserEmail(req);

      for (const paramMatch of paramMatches) {
        const paramName = paramMatch.substring(1);

        try {
          let resolvedValue = null;

          // First check if param was passed directly in request
          if (params && params[paramName] !== undefined) {
            const rawValue = String(params[paramName]);
            // Format for SQL - handle JSON params (ending in _json), numbers, and strings
            const isJsonParam = paramName.toLowerCase().endsWith("_json");
            if (isJsonParam) {
              // JSON: properly quote for MySQL JSON parameter type
              resolvedValue = `'${rawValue.replace(/'/g, "\\'")}'`;
            } else if (/^[0-9]+$/.test(rawValue)) {
              resolvedValue = rawValue; // Numbers: unquoted
            } else {
              resolvedValue = `'${rawValue.replace(/'/g, "\\'")}'`; // Strings: quoted and escaped
            }
            logger.debug(
              `${codeName} Using passed param :${paramName} → ${resolvedValue.substring(
                0,
                100
              )}...`
            );
          } else {
            // Fall back to context_store
            resolvedValue = await getValDirect(userEmail, paramName, "sql");
            if (resolvedValue !== null) {
              logger.debug(
                `${codeName} Resolved from context :${paramName} → ${resolvedValue}`
              );
            }
          }

          if (resolvedValue !== null) {
            // Use replaceAll with string literal to avoid regex issues with special characters
            finalSQL = finalSQL.replaceAll(`:${paramName}`, resolvedValue);
          } else {
            logger.warn(
              `${codeName} No value found for parameter: ${paramName}`
            );
          }
        } catch (error) {
          logger.error(
            `${codeName} Error resolving parameter ${paramName}:`,
            error
          );
        }
      }
    }

    logger.debug(`${codeName} Executing SQL: ${finalSQL}`);

    // Execute the query using GET method
    const result = await executeQuery(finalSQL, "GET");

    logger.info(
      `${codeName} EventSQL executed successfully: ${qryName} (ID: ${id})`
    );

    res.json({
      qryName: qryName,
      eventSQLId: id,
      data: result,
    });
  } catch (error) {
    logger.error(
      `${codeName} EventSQL execution failed for ID ${eventSQLId}:`,
      error
    );

    const status = error.status || 500;

    res.status(status).json({
      error: error.code || "EVENTSQL_EXECUTION_FAILED",
      message: error.message,
      eventSQLId: eventSQLId,
    });
  }
};

export default execEvent;
