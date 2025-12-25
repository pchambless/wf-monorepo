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

  // Only handle GET requests (SELECT queries)
  const { qryName, eventSQLId, params } = req.query;
  const queryName = qryName || eventSQLId;

  if (!queryName) {
    return res.status(400).json({
      error: "MISSING_QUERY_NAME",
      message: "qryName is required",
    });
  }

  try {
    // Lookup by qryName only (HTMX architecture uses names like "ingrTypeGrid")
    const fetchSQL = `
      SELECT qryName, qrySQL
      FROM api_wf.vw_execEvents
      WHERE qryName = ? 
    `;

    logger.debug(
      `${codeName} Fetching eventSQL by qryName: ${queryName}`
    );

    // Execute query to get the SQL from eventSQL table
    const fetchResult = await executeQuery(fetchSQL, "GET", [queryName]);

    if (!fetchResult || fetchResult.length === 0) {
      return res.status(404).json({
        error: "EVENTSQL_NOT_FOUND",
        message: `No active eventSQL found with qryName: ${queryName}`,
      });
    }

    const eventSQLData = fetchResult[0];
    const { qryName, qrySQL } = eventSQLData;

    logger.debug(`${codeName} Found eventSQL: ${qryName}`);

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

          // Always use context_store - single source of truth
          resolvedValue = await getValDirect(userEmail, paramName, "sql");
          if (resolvedValue !== null) {
            logger.debug(
              `${codeName} Resolved from context_store :${paramName} → ${resolvedValue}`
            );
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
      `${codeName} EventSQL executed successfully: ${qryName}`
    );

    // Check if this is an HTMX request
    const isHTMX = req.headers['hx-request'] === 'true';

    if (isHTMX) {
      // Return HTML table rows for HTMX
      const rows = result.map(row => {
        const cells = Object.values(row).map(val =>
          `<td style="padding: 8px; border: 1px solid #ddd;">${val || ''}</td>`
        ).join('');

        return `<tr>${cells}<td style="padding: 8px; border: 1px solid #ddd;">
          <button style="margin: 2px; padding: 4px 8px;">Edit</button>
          <button style="margin: 2px; padding: 4px 8px;">Delete</button>
        </td></tr>`;
      }).join('');

      res.send(rows);
    } else {
      // Return JSON for API calls
      res.json({
        qryName: qryName,
        data: result,
      });
    }
  } catch (error) {
    logger.error(
      `${codeName} EventSQL execution failed for qryName ${queryName}:`,
      error
    );

    const status = error.status || 500;

    res.status(status).json({
      error: error.code || "EVENTSQL_EXECUTION_FAILED",
      message: error.message,
      qryName: queryName,
    });
  }
};

export default execEvent;
