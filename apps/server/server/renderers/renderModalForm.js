import logger from '../utils/logger.js';

function renderModalForm(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderModalForm] Rendering Modal Form: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const modalId = props.modalId || 'modal-form';
  const title = props.title || 'Form';

  // Stub: Placeholder for modal form - will render form inside modal overlay
  return `
    <div id="${modalId}" class="modal-form" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    ">
      <div style="
        background: white;
        padding: 24px;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      ">
        <h2 style="margin-top: 0; margin-bottom: 16px; color: #333;">${title}</h2>
        <div style="text-align: center; color: #999; padding: 40px 0;">
          <p>Modal Form stub - will render form fields and submit/cancel buttons</p>
        </div>
      </div>
    </div>
  `;
}

export default renderModalForm;
