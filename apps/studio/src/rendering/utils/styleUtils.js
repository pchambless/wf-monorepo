/**
 * Convert position object to CSS grid properties
 */
export function getGridPosition(position) {
  if (!position || !position.row || !position.col) return {};

  const { row, col } = position;
  return {
    gridRow: `${row.start} / span ${row.span}`,
    gridColumn: `${col.start} / span ${col.span}`
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
