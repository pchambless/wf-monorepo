/**
 * Convert position object to flexbox width
 * Position format: { row, order, width }
 */
export function getFlexPosition(position) {
  if (!position || !position.width) return {};

  return {
    flexBasis: position.width,
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0  // Allows flex items to shrink below content size
  };
}

/**
 * Map component type to HTML element
 */
export function getHtmlElement(type) {
  const elementMap = {
    'page': 'div', 'form': 'form', 'button': 'button', 'select': 'select',
    'input': 'input', 'label': 'label', 'div': 'div', 'span': 'span',
    'h1': 'h1', 'h2': 'h2', 'h3': 'h3', 'p': 'p',
    'modal': 'div', 'section': 'section', 'nav': 'nav', 'header': 'header',
    'grid': 'div', 'table': 'table', 'thead': 'thead', 'tbody': 'tbody',
    'tr': 'tr', 'th': 'th', 'td': 'td'
  };
  return elementMap[type] || 'div';
}
