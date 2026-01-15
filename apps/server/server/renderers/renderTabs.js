import logger from '../utils/logger.js';

function renderTabs(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderTabs] Rendering Tabs: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const tabs = props.tabs || [];
  const id = props.id || 'tabs-container';

  if (!tabs || tabs.length === 0) {
    return `<div id="${id}" style="padding: 16px; color: #999;">No tabs configured</div>`;
  }

  // Stub: Placeholder for tabs - will render tab headers and content
  const tabHeaders = tabs.map((tab, idx) => `
    <button
      class="tab-header ${idx === 0 ? 'active' : ''}"
      data-tab-id="${tab.id || idx}"
      style="
        padding: 12px 16px;
        border: none;
        background: ${idx === 0 ? 'var(--color-primary, #0078b4)' : 'transparent'};
        color: ${idx === 0 ? 'white' : 'var(--text-primary, #333)'};
        cursor: pointer;
        font-weight: 500;
        border-bottom: 2px solid ${idx === 0 ? 'var(--color-primary, #0078b4)' : 'transparent'};
      "
    >
      ${tab.label || `Tab ${idx + 1}`}
    </button>
  `).join('');

  return `
    <div id="${id}" class="tabs-container">
      <div style="display: flex; border-bottom: 1px solid #e0e0e0;">
        ${tabHeaders}
      </div>
      <div style="padding: 16px; color: #999;">Tab content stub</div>
    </div>
  `;
}

export default renderTabs;
