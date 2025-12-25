import logger from '../utils/logger.js';

function renderModal(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderModal] Rendering: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const className = props.className || 'modal';
  const title = props.title || '';
  const children = instanceProps.children || '';

  return `
    <div class="modal-overlay" id="modal-overlay"></div>
    <div class="${className}" id="${props.id || 'modal'}">
      ${title ? `<h2>${title}</h2>` : ''}
      ${children}
    </div>
  `;
}
export default renderModal;
