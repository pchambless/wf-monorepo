import logger from '../utils/logger.js';
import { buildHTMXAttributes, buildHTMXAttributesFromObject } from '../utils/htmxBuilders/index.js';

function renderSelect(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderSelect] Rendering: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const triggers = instanceProps.triggers || [];
  const className = props.className || 'select';

  let htmxAttrs = '';

  if (Array.isArray(triggers) && triggers.length > 0) {
    htmxAttrs = buildHTMXAttributes(triggers, actions, 'Select');
  } else if (typeof triggers === 'object' && !Array.isArray(triggers)) {
    htmxAttrs = buildHTMXAttributesFromObject(triggers);
  }

  const options = (props.options || []).map(opt =>
    `<option value="${opt.value}">${opt.label}</option>`
  ).join('');

  const idAttr = instanceProps.id ? `id="${instanceProps.id}"` : '';
  return `<select ${idAttr} class="${className}" ${htmxAttrs}>${options || '<option>Loading...</option>'}</select>`;
}
export default renderSelect;
