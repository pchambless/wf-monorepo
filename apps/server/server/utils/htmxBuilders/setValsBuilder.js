import logger from '../logger.js';

const codeName = '[setValsBuilder.js]';

export function buildSetValsBody(trigger) {
  if (!trigger || trigger.action !== 'setVals') {
    return null;
  }

  // Check if any param contains {{value}}
  const hasValueTemplate = Array.isArray(trigger.params) &&
    trigger.params.some(p => typeof p === 'string' && p.includes('{{value}}'));

  if (hasValueTemplate) {
    // Use HTMX js: syntax for dynamic element values
    const values = [];
    for (let i = 0; i < trigger.params.length; i += 2) {
      const paramName = trigger.params[i];
      const paramVal = trigger.params[i + 1];

      if (paramVal === '{{value}}') {
        values.push(`{paramName: '${paramName}', paramVal: this.value}`);
      } else {
        values.push(`{paramName: '${paramName}', paramVal: '${paramVal}'}`);
      }
    }

    const jsExpression = `{values: [${values.join(', ')}]}`;
    logger.debug(`${codeName} Dynamic values with js: expression`);
    return { type: 'js', expression: jsExpression };
  } else {
    // Static values - use regular JSON format
    const values = [];
    for (let i = 0; i < trigger.params.length; i += 2) {
      values.push({
        paramName: trigger.params[i],
        paramVal: trigger.params[i + 1]
      });
    }
    logger.debug(`${codeName} Static values (${values.length} params)`);
    return { type: 'json', data: { values } };
  }
}
