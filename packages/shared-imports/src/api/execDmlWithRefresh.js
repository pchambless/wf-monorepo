/**
 * Execute DML operation followed by automatic table refresh (client-side)
 * @param {string} operation - DML operation type
 * @param {Object} data - DML data payload
 * @param {string} listEvent - Event to call for refresh (optional)
 * @returns {Object} Combined result with DML result and fresh table data
 */
export async function execDmlWithRefresh(operation, data = {}, listEvent = null, { baseUrl, logger, execDml, execEvent }) {
  try {
    logger.debug(`Executing DML with refresh: ${operation}`, {
      data,
      listEvent,
    });

    // Step 1: Execute the DML operation (server-side)
    const dmlResult = await execDml(operation, data, { baseUrl, logger });

    if (!dmlResult.success) {
      logger.error(`DML operation failed: ${operation}`, dmlResult);
      return dmlResult;
    }

    // Step 2: If successful and listEvent provided, refresh the table data (client-side)
    let refreshData = null;
    if (listEvent) {
      try {
        logger.debug(`Refreshing table data with event: ${listEvent}`);
        // Assume client has already resolved params - API layer doesn't handle contextStore
        refreshData = await execEvent(listEvent, {}, { baseUrl, logger });
        logger.debug(`Table refresh successful for: ${listEvent}`);
      } catch (refreshError) {
        logger.warn(`Table refresh failed for: ${listEvent}`, refreshError);
        // Don't fail the whole operation if refresh fails
      }
    }

    // Step 3: Return combined result
    return {
      ...dmlResult,
      refreshData,
      refreshSuccess: !!refreshData,
    };
  } catch (error) {
    logger.error(`DML with refresh failed: ${operation}`, error);
    throw error;
  }
}