import logger from '../utils/logger.js';
import { buildHTMXAttributesFromObject } from '../utils/htmxBuilders/index.js';

function renderGrid(component) {
  logger.debug(`[renderGrid] Rendering: ${component.id}`);

  const { props, triggers, css_style } = component;
  const className = css_style || 'grid';

  let htmxAttrs = '';
  if (triggers && Object.keys(triggers).length > 0) {
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
