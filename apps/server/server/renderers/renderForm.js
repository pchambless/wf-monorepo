import logger from '../utils/logger.js';
import { buildHTMXAttributes, buildHTMXAttributesFromObject } from '../utils/htmxBuilder.js';

function renderForm(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderForm] Rendering: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const triggers = instanceProps.triggers || [];
  const className = props.className || 'form';
  let children = instanceProps.children || '';

  // Generate form fields if formFields prop exists
  if (props.formFields && Array.isArray(props.formFields)) {
    const fieldsHTML = props.formFields.map(field => {
      const fieldType = field.type || 'text';
      const fieldName = field.name;
      const fieldLabel = field.label || field.name;
      const placeholder = field.placeholder || '';
      const required = field.required ? 'required' : '';

      return `
        <div style="margin-bottom: 16px;">
          <label for="${fieldName}" style="display: block; margin-bottom: 6px; font-weight: 500;">${fieldLabel}</label>
          <input
            type="${fieldType}"
            id="${fieldName}"
            name="${fieldName}"
            placeholder="${placeholder}"
            ${required}
            style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"
          />
        </div>
      `;
    }).join('');

    const submitText = props.submitText || 'Submit';
    const submitButton = `
      <button type="submit" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer;">
        ${submitText}
      </button>
    `;

    children = fieldsHTML + submitButton;
  }

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
