import logger from './logger.js';

const codeName = '[htmxBuilder.js]';

export function buildHTMXAttributes(triggers = [], actions = {}, componentType = 'unknown') {
  if (!triggers || triggers.length === 0) {
    return '';
  }

  if (!Array.isArray(triggers)) {
    logger.warn(`${codeName} Triggers is not an array for ${componentType}. Received: ${typeof triggers}`);
    return '';
  }

  logger.debug(`${codeName} Building HTMX for ${componentType} with ${triggers.length} trigger(s): ${triggers.map(t => t.class).join(', ')}`);

  const triggersByClass = {};
  triggers.forEach((trigger, index) => {
    const trigClass = trigger.class;
    if (!trigClass) {
      logger.warn(`${codeName} Trigger missing 'class' property at index ${index}`);
      return;
    }

    if (!triggersByClass[trigClass]) {
      triggersByClass[trigClass] = [];
    }
    triggersByClass[trigClass].push(trigger);
  });

  const htmxParts = [];

  Object.entries(triggersByClass).forEach(([trigClass, classTriggers]) => {
    logger.debug(`${codeName} [${trigClass}] ${classTriggers.length} action(s): ${classTriggers.map(t => t.action).join(' → ')}`);

    const firstTrigger = classTriggers[0];
    const action = actions[firstTrigger.action];

    if (!action) {
      logger.warn(`${codeName} Action not found: ${firstTrigger.action}`);
      return;
    }

    if (!action.endpoint) {
      logger.debug(`${codeName} [${trigClass}] Client-side action "${firstTrigger.action}" - skipping HTMX (needs JS handler)`);
      htmxParts.push(`data-action="${firstTrigger.action}"`);
      htmxParts.push(`data-trigger="${trigClass}"`);
      if (firstTrigger.params) {
        htmxParts.push(`data-params='${JSON.stringify(firstTrigger.params)}'`);
      }
      return;
    }

    const htmxVerb = action.htmx_verb;
    let endpoint = action.endpoint;

    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
      logger.debug(`${codeName} [${trigClass}] Added leading / to endpoint: ${endpoint}`);
    }

    logger.debug(`${codeName} [${trigClass}] → ${htmxVerb}="${endpoint}"`);
    htmxParts.push(`${htmxVerb}="${endpoint}"`);

    logger.debug(`${codeName} [${trigClass}] → hx-trigger="${trigClass}"`);
    htmxParts.push(`hx-trigger="${trigClass}"`);

    if (firstTrigger.params && Object.keys(firstTrigger.params).length > 0) {
      const hxVals = JSON.stringify(firstTrigger.params).replace(/"/g, '&quot;');
      logger.debug(`${codeName} [${trigClass}] → hx-vals="${hxVals}"`);
      htmxParts.push(`hx-vals="${hxVals}"`);
    }

    if (action.content_type === 'object') {
      logger.debug(`${codeName} [${trigClass}] → hx-headers='{"Content-Type": "application/json"}'`);
      htmxParts.push(`hx-headers='{"Content-Type": "application/json"}'`);
    }

    if (trigClass === 'load') {
      logger.debug(`${codeName} [${trigClass}] → hx-swap="innerHTML"`);
      htmxParts.push('hx-swap="innerHTML"');
    }
  });

  const result = htmxParts.join(' ');
  logger.debug(`${codeName} ✓ Final: ${result}`);

  return result;
}

export function buildHTMXAttributesFromObject(triggerObj = {}) {
  const htmxParts = [];

  Object.entries(triggerObj).forEach(([trigClass, attrs]) => {
    logger.debug(`${codeName} Processing pre-built HTMX for class: ${trigClass}`, attrs);

    Object.entries(attrs).forEach(([key, value]) => {
      if (key.startsWith('hx-')) {
        htmxParts.push(`${key}="${value}"`);
        logger.debug(`${codeName} Added attribute: ${key}="${value}"`);
      }
    });
  });

  const result = htmxParts.join(' ');
  logger.debug(`${codeName} Final pre-built HTMX attributes:`, { result });

  return result;
}
