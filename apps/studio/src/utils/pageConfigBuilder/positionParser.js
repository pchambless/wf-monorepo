export const parsePosOrder = (posOrder) => {
  if (!posOrder || posOrder === '0,0,auto') {
    return { row: 0, order: 0, width: 'auto', align: 'left' };
  }

  const parts = posOrder.split(',').map(p => p.trim());

  if (parts.length >= 3) {
    const widthValue = parts[2];
    const width = widthValue.includes('%') ? widthValue : `${widthValue}%`;
    const align = parts[3] || 'left';

    return {
      row: parseInt(parts[0]) || 0,
      order: parseInt(parts[1]) || 0,
      width,
      align
    };
  }

  return { row: 0, order: 0, width: 'auto', align: 'left' };
};
