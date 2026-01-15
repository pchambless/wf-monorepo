import logger from '../utils/logger.js';
import { buildHTMXAttributes, buildHTMXAttributesFromObject } from '../utils/htmxBuilders/index.js';

function renderLogin(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderLogin] Rendering login page`);

  const props = { ...composite.props, ...instanceProps };
  const triggers = instanceProps.triggers || composite.triggers || [];
  const endpoint = props.submitEndpoint || '/api/userLogin';
  const formFields = props.formFields || [];

  // Generate form fields
  const fieldsHTML = formFields.map(field => {
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
          class="login-field-input"
          ${required}
        />
      </div>
    `;
  }).join('');

  // Build HTMX attributes for form submit
  let htmxAttrs = '';
  if (Array.isArray(triggers) && triggers.length > 0) {
    htmxAttrs = buildHTMXAttributes(triggers, actions, 'Login');
  } else if (typeof triggers === 'object' && !Array.isArray(triggers)) {
    htmxAttrs = buildHTMXAttributesFromObject(triggers);
  }

  // Default: POST to endpoint if no HTMX triggers configured
  if (!htmxAttrs) {
    htmxAttrs = `hx-post="${endpoint}" hx-target="this" hx-swap="outerHTML"`;
  }

  const submitText = props.submitText || 'Login';
  const submitButton = `
    <button type="submit" class="login-submit-btn">${submitText}</button>
  `;

  const form = `
    <form id="login-form" class="login-form" ${htmxAttrs}>
      ${fieldsHTML}
      ${submitButton}
    </form>
  `;

  return `
    <div class="login-container">
      <div class="login-box">
        <h1 class="login-title">Login</h1>
        ${form}
      </div>
    </div>
  `;
}

export default renderLogin;
