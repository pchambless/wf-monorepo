
import logger from '../utils/logger.js';
import renderMenu from './renderMenu.js';

function renderSidebar(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderSidebar] Rendering: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const className = props.className || 'sidebar';
  const collapsed = props.collapsed || false;
  const collapsedClass = collapsed ? ' collapsed' : '';

  let menuHTML = '';

  if (props.sections) {
    // Convert sections to menu items with section headers
    const menuItems = [];
    props.sections.forEach(section => {
      menuItems.push({
        label: section.title,
        className: 'section-title'
      });
      section.items.forEach(item => {
        menuItems.push(item);
      });
    });

    menuHTML = renderMenu(
      { name: 'Menu', props: {} },
      {
        orientation: 'vertical',
        items: menuItems,
        className: 'sidebar-menu'
      },
      actions
    );
  } else if (props.menuItems) {
    menuHTML = renderMenu(
      { name: 'Menu', props: {} },
      {
        orientation: 'vertical',
        items: props.menuItems,
        className: 'sidebar-menu'
      },
      actions
    );
  }

  return `
    <nav class="${className}${collapsedClass}">
      ${menuHTML}
    </nav>
  `;
}
export default renderSidebar;
