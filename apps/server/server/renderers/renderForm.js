import logger from '../utils/logger.js';
import { buildHTMXAttributesFromObject } from '../utils/htmxBuilders/index.js';

function renderForm(component) {
  logger.debug(`[renderForm] Rendering: ${component.id}`);

  const { props, triggers, css_style } = component;
  const className = css_style || 'form';
  let children = '';

  // Generate form fields if formFields prop exists
  if (props.formFields && Array.isArray(props.formFields)) {
    const fieldsHTML = props.formFields.map(field => {
      const fieldType = field.type || 'text';
      const fieldName = field.name;
      const fieldLabel = field.label || field.name;
      const placeholder = field.placeholder || '';
      const required = field.required ? 'required' : '';

      return `
        <div class="login-field">
          <label for="${fieldName}" class="login-field-label">${fieldLabel}</label>
          <input
            type="${fieldType}"
            id="${fieldName}"
            name="${fieldName}"
            placeholder="${placeholder}"
            ${required}
            class="login-field-input"
          />
        </div>
      `;
    }).join('');

    const submitText = props.submitText || 'Submit';
    const submitButton = `
      <button type="submit" class="login-submit-btn">
        ${submitText}
      </button>
    `;

    children = fieldsHTML + submitButton;
  }

  // Build HTMX attributes from pageStructure triggers
  let htmxAttrs = '';
  if (triggers && Object.keys(triggers).length > 0) {
    htmxAttrs = buildHTMXAttributesFromObject(triggers);
    htmxAttrs += ' hx-target="this" hx-swap="outerHTML"';
  }

  return `<form class="${className}" ${htmxAttrs}>${children}</form>`;
}

export default renderForm;
