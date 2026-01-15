import logger from '../utils/logger.js';
import { buildHTMXAttributes } from '../utils/htmxBuilders/index.js';

function renderMenu(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderMenu] Rendering: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const orientation = props.orientation || 'vertical';
  const items = props.items || [];
  const className = props.className || 'menu';
  const activeItem = props.activeItem || null;

  const htmxAttrs = props.triggers ?
    buildHTMXAttributes(props.triggers, actions, 'Menu') : '';

  const orientationClass = `menu-${orientation}`;
  const fullClassName = `${className} ${orientationClass}`;

  const itemsHTML = items.map(item => {
    const isActive = activeItem === item.id || activeItem === item.label;
    const activeClass = isActive ? ' active' : '';
    const icon = item.icon ? `<span class="menu-icon">${item.icon}</span>` : '';

    if (item.href || item.path) {
      return `
        <a href="${item.path || item.href}" 
           class="menu-item${activeClass}" 
           data-item-id="${item.id || item.label}">
          ${icon}
          <span class="menu-label">${item.label}</span>
        </a>
      `;
    } else if (item.action) {
      return `
        <button class="menu-item${activeClass}" 
                data-action="${item.action}"
                data-item-id="${item.id || item.label}">
          ${icon}
          <span class="menu-label">${item.label}</span>
        </button>
      `;
    } else if (item.items) {
      const submenu = renderMenu(composite, {
        ...props,
        items: item.items,
        className: 'submenu',
        orientation: 'vertical'
      }, actions);
      return `
        <div class="menu-item has-submenu${activeClass}">
          ${icon}
          <span class="menu-label">${item.label}</span>
          ${submenu}
        </div>
      `;
    } else {
      return `
        <div class="menu-item menu-label-only${activeClass}">
          ${icon}
          <span class="menu-label">${item.label}</span>
        </div>
      `;
    }
  }).join('\n');

  const wrapperTag = orientation === 'horizontal' ? 'nav' : 'div';

  return `
    <${wrapperTag} class="${fullClassName}" ${htmxAttrs}>
      ${itemsHTML}
    </${wrapperTag}>
  `;
}

export default renderMenu;
