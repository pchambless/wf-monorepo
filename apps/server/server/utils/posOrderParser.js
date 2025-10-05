/**
 * posOrder Parser - Flex-only layout system
 *
 * Format: "row,order,width,align"
 * Examples:
 *   "1,1,100"        - Row 1, first component, full width, left-aligned (default)
 *   "1,1,50"         - Row 1, first component, 50% width, left-aligned
 *   "1,2,50"         - Row 1, second component, 50% width, left-aligned
 *   "1,1,25,right"   - Row 1, first component, 25% width, right-aligned
 *   "1,1,50,center"  - Row 1, first component, 50% width, centered
 */

const parsePosOrder = (posOrder) => {
  if (!posOrder || posOrder === '0,0,auto') {
    return { row: 0, order: 0, width: 'auto', align: 'left' };
  }

  // Format: "row,order,width,align" (e.g., "1,1,50,right")
  const parts = posOrder.split(',').map(p => p.trim());

  if (parts.length >= 3) {
    // Parse width - add % if not present
    const widthValue = parts[2];
    const width = widthValue.includes('%') ? widthValue : `${widthValue}%`;

    // Parse alignment (optional, defaults to 'left')
    const align = parts[3] || 'left';

    return {
      row: parseInt(parts[0]) || 0,
      order: parseInt(parts[1]) || 0,
      width,
      align
    };
  }

  // Fallback: invalid format
  console.warn(`Invalid posOrder format: ${posOrder}`);
  return { row: 0, order: 0, width: 'auto', align: 'left' };
};

const formatPosOrder = (row, order, width, align = 'left') => {
  if (align === 'left') {
    return `${row},${order},${width}`;
  }
  return `${row},${order},${width},${align}`;
};

const groupComponentsByRow = (components) => {
  const rows = {};

  components.forEach(comp => {
    const { row, order, width } = parsePosOrder(comp.posOrder);

    if (!rows[row]) {
      rows[row] = [];
    }

    rows[row].push({
      ...comp,
      _layout: { row, order, width }
    });
  });

  // Sort components within each row by order
  Object.keys(rows).forEach(rowKey => {
    rows[rowKey].sort((a, b) => a._layout.order - b._layout.order);
  });

  return rows;
};

module.exports = {
  parsePosOrder,
  formatPosOrder,
  groupComponentsByRow
};
