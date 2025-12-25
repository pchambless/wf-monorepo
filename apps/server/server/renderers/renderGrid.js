import logger from '../utils/logger.js';
import { buildHTMXAttributes, buildHTMXAttributesFromObject } from '../utils/htmxBuilder.js';

function renderGrid(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderGrid] Rendering: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const triggers = instanceProps.triggers || [];
  const className = props.className || 'grid';

  let htmxAttrs = '';

  if (Array.isArray(triggers) && triggers.length > 0) {
    htmxAttrs = buildHTMXAttributes(triggers, actions, 'Grid');
  } else if (typeof triggers === 'object' && !Array.isArray(triggers)) {
    htmxAttrs = buildHTMXAttributesFromObject(triggers);
  }

  const columns = props.columns || [];

  return `
    <div class="${className}">
      <table class="table">
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label || col.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody ${htmxAttrs}>
          <tr><td colspan="${columns.length}" class="loading">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  `;
}
export default renderGrid;
