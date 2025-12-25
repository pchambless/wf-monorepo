import logger from '../utils/logger.js';

function renderContainer(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderContainer] Rendering: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const className = props.className || '';
  const children = instanceProps.children || '';

  return `<div class="${className}">${children}</div>`;
}
export default renderContainer;
