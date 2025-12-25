import logger from '../utils/logger.js';

function renderText(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderText] Rendering: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const className = props.className || '';
  const text = props.text || props.content || '';
  const variant = props.variant || 'p';

  const Tag = variant;
  return `<${Tag} class="${className}">${text}</${Tag}>`;
}
export default renderText;
