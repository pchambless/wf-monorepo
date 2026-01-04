import logger from '../utils/logger.js';

function renderAppBar(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderAppBar] Rendering: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const className = props.className || 'appbar';
  const title = props.title || 'WhatsFresh Studio';
  const showUserMenu = props.showUserMenu !== false;

  const userMenu = showUserMenu ? `
    <div class="user-menu">
      <button class="user-menu-button">User</button>
    </div>
  ` : '';

  return `
    <div class="${className}">
      <div class="appbar-title">${title}</div>
      ${userMenu}
    </div>
  `;
}
export default renderAppBar;
