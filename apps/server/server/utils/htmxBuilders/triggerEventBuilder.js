import logger from '../logger.js';

const codeName = '[triggerEventBuilder.js]';

export function buildHxTriggerAttribute(trigClass, trigger) {
  if (!trigClass) {
    logger.warn(`${codeName} No trigger class provided`);
    return '';
  }

  // Support event delegation: source property specifies which element to listen to
  if (trigger && trigger.source) {
    // HTMX syntax: "change from #sourceId"
    const delegation = `${trigClass} from #${trigger.source}`;
    logger.debug(`${codeName} Event delegation: "${delegation}"`);
    return `hx-trigger="${delegation}"`;
  }

  // Standard trigger
  logger.debug(`${codeName} Standard trigger: "${trigClass}"`);
  return `hx-trigger="${trigClass}"`;
}
