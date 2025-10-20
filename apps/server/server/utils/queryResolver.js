import logger from "./logger.js";

const codeName = "[queryResolver.js]";

const replacePlaceholder = (qrySQL, paramName, paramValue) => {
  // Handle parameters that include : prefix - escape special regex characters
  const escapedParamName = paramName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedParamName, "g");
  return qrySQL.replace(regex, paramValue);
};

const convertQuery = (qrySQL, params) => {
  try {
    // Log the original query with sanitized parameters
    logger.debug(`${codeName} Original query:`, {
      qrySQL,
      params,
    });

    // Check for nested params and flatten if necessary
    if (params.params) {
      params = params.params;
    }

    // Directly replace placeholders in qrySQL with actual values from params
    for (const [paramName, paramValue] of Object.entries(params)) {
      // Skip logging individual parameters - reduces noise
      // Check if paramName ends with _json (for JSON type parameters - use raw value)
      const isJsonParam = paramName.toLowerCase().endsWith("_json");
      const formattedValue = isJsonParam
        ? paramValue // JSON parameters: use raw value (SQL should have quotes around parameter)
        : typeof paramValue === "string"
        ? `'${paramValue}'`
        : paramValue; // Others: quote strings
      qrySQL = replacePlaceholder(qrySQL, paramName, formattedValue);
    }

    return qrySQL;
  } catch (error) {
    logger.error(`${codeName} Error converting query:`, error);
    throw new Error(`${codeName} Failed to convert query`);
  }
};

const createRequestBody = (qrySQL, params) => {
  return convertQuery(qrySQL, params);
};

export { createRequestBody };
