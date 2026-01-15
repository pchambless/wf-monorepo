import logger from '../utils/logger.js';

function renderContainer(component) {
  logger.debug(`[renderContainer] Rendering: ${component.id}`);

  const { props, css_style } = component;
  const className = css_style || 'container';
  const children = component.children || '';

  return `<div class="${className}">${children}</div>`;
}
export default renderContainer;
