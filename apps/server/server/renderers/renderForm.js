import logger from '../utils/logger.js';
import { buildHTMXAttributes, buildHTMXAttributesFromObject } from '../utils/htmxBuilder.js';

function renderForm(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderForm] Rendering: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const triggers = instanceProps.triggers || [];
  const className = props.className || 'form';
  const children = instanceProps.children || '';

  let htmxAttrs = '';

  if (Array.isArray(triggers) && triggers.length > 0) {
    htmxAttrs = buildHTMXAttributes(triggers, actions, 'Form');
  } else if (typeof triggers === 'object' && !Array.isArray(triggers)) {
    htmxAttrs = buildHTMXAttributesFromObject(triggers);
  }

  if (htmxAttrs) {
    htmxAttrs += ' hx-target="this" hx-swap="outerHTML"';
  }

  return `<form class="${className}" ${htmxAttrs}>${children}</form>`;
}
export default renderForm;
