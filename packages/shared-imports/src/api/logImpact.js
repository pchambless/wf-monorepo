/**
 * Log development impacts for Claude/Kiro coordination
 */

/**
 * Log a single impact
 */
export async function logImpact(impactData, { baseUrl, logger }) {
  try {
    logger.debug("Logging single impact:", impactData);

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${baseUrl}/api/logImpact`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        impacts: impactData,
        single: true,
      }),
    });

    if (!response.ok) {
      const error = new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    logger.debug("Impact logged successfully:", result);
    return result;
  } catch (error) {
    logger.error("logImpact Error:", error);
    throw error;
  }
}

/**
 * Log multiple impacts in a batch
 */
export async function logBatchImpacts(
  impacts,
  planId = 1,
  { baseUrl, logger }
) {
  try {
    logger.debug(`Logging ${impacts.length} impacts in batch:`, impacts);

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${baseUrl}/api/logImpact`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        impacts,
        planId,
      }),
    });

    if (!response.ok) {
      const error = new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    logger.debug("Batch impacts logged successfully:", result);
    return result;
  } catch (error) {
    logger.error("logBatchImpacts Error:", error);
    throw error;
  }
}

/**
 * Get recent impacts for coordination
 */
export async function getRecentImpacts(hours = 24, { baseUrl, logger }) {
  try {
    logger.debug(`Getting recent impacts for last ${hours} hours`);

    const response = await fetch(
      `${baseUrl}/api/impacts/recent?hours=${hours}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    logger.debug(`Retrieved ${result.count} recent impacts`);
    return result.impacts;
  } catch (error) {
    logger.error("getRecentImpacts Error:", error);
    throw error;
  }
}

/**
 * Get impacts by batch ID
 */
export async function getBatchImpacts(batchId, { baseUrl, logger }) {
  try {
    logger.debug(`Getting impacts for batch: ${batchId}`);

    const response = await fetch(`${baseUrl}/api/impacts/batch/${batchId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    logger.debug(`Retrieved ${result.count} impacts for batch ${batchId}`);
    return result.impacts;
  } catch (error) {
    logger.error("getBatchImpacts Error:", error);
    throw error;
  }
}

/**
 * Convenience functions for common scenarios
 */
export const logFileCreate = (
  filePath,
  description,
  affectedApps = [],
  config
) => {
  return logImpact(
    {
      filePath,
      changeType: "create",
      description,
      affectedApps,
      createdBy: "kiro",
    },
    config
  );
};

export const logFileModify = (
  filePath,
  description,
  affectedApps = [],
  config
) => {
  return logImpact(
    {
      filePath,
      changeType: "modify",
      description,
      affectedApps,
      createdBy: "kiro",
    },
    config
  );
};

export const logFileDelete = (
  filePath,
  description,
  affectedApps = [],
  config
) => {
  return logImpact(
    {
      filePath,
      changeType: "delete",
      description,
      affectedApps,
      createdBy: "kiro",
    },
    config
  );
};
