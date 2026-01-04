import logger from "../utils/logger.js";

const codeName = `[studioWorkflow.js]`;
const N8N_BASE_URL = process.env.N8N_BASE_URL || "http://localhost:5678";

const execWorkflow = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  let { workflowName, method, params } = req.body;

  // Parse params if it's a string (from HTMX form data)
  if (typeof params === 'string') {
    try {
      params = JSON.parse(params);
    } catch (e) {
      params = {};
    }
  }

  if (!workflowName) {
    return res.status(400).json({
      error: "MISSING_WORKFLOW_NAME",
      message: "workflowName is required",
    });
  }

  // Default to POST if no method specified, validate allowed methods
  const httpMethod = (method || "POST").toUpperCase();
  const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  
  if (!allowedMethods.includes(httpMethod)) {
    return res.status(400).json({
      error: "INVALID_HTTP_METHOD",
      message: `Method must be one of: ${allowedMethods.join(", ")}`,
      providedMethod: method,
    });
  }

  try {
    // Build webhook URL from workflow name
    const webhookUrl = `${N8N_BASE_URL}/webhook/${workflowName}`;

    logger.debug(
      `${codeName} Calling n8n workflow: ${workflowName} (${httpMethod}) with params:`,
      params
    );

    // Prepare fetch options
    const fetchOptions = {
      method: httpMethod,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // For GET requests, append params as query string; for others, use body
    let finalUrl = webhookUrl;
    if (httpMethod === "GET" && params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      finalUrl = `${webhookUrl}?${queryString}`;
    } else if (httpMethod !== "GET") {
      fetchOptions.body = JSON.stringify(params || {});
    }

    // Call n8n webhook
    const response = await fetch(finalUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(
        `n8n workflow failed with status ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    logger.info(
      `${codeName} Workflow executed successfully: ${workflowName} (${httpMethod})`
    );

    res.json({
      workflowName,
      method: httpMethod,
      data,
    });
  } catch (error) {
    logger.error(
      `${codeName} Workflow execution failed for ${workflowName}:`,
      error
    );

    const status = error.status || 500;

    res.status(status).json({
      error: error.code || "WORKFLOW_EXECUTION_FAILED",
      message: error.message,
      workflowName,
      method: httpMethod,
    });
  }
};

export default execWorkflow;
