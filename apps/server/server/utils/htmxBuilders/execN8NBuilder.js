import logger from '../logger.js';

const codeName = '[execN8NBuilder.js]';

export function buildExecN8NBody(trigger) {
  if (!trigger || !['execN8N', 'execDML', 'execEvent'].includes(trigger.action)) {
    return null;
  }

  const bodyData = {};
  if (trigger.workflowName) bodyData.workflowName = trigger.workflowName;
  if (trigger.method) bodyData.method = trigger.method;
  if (trigger.params) bodyData.params = trigger.params;
  if (trigger.contextParams) bodyData.contextParams = trigger.contextParams;
  if (trigger.eventSQLId) bodyData.eventSQLId = trigger.eventSQLId;
  if (trigger.table) bodyData.table = trigger.table;

  logger.debug(`${codeName} Built body for ${trigger.action}: ${Object.keys(bodyData).join(', ')}`);
  return { type: 'json', data: bodyData };
}
