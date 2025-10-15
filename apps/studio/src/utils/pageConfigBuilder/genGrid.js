export const generateGridComponents = (props, componentId) => {
  const { columns, rowKey = 'id', selectable = false } = props;

  if (!columns || columns.length === 0) {
    return [];
  }

  const visibleColumns = columns.filter(col => !col.hidden);

  const headerCells = visibleColumns.map(col => ({
    id: `header_${col.name}`,
    type: 'th',
    textContent: col.label || col.name.charAt(0).toUpperCase() + col.name.slice(1).replace(/_/g, ' '),
    style: {
      padding: '12px 8px',
      textAlign: 'left',
      borderBottom: '1px solid #e0e0e0',
      fontWeight: '600',
      width: col.width || 'auto'
    }
  }));

  const placeholderCells = visibleColumns.map(col => ({
    id: `placeholder_${col.name}`,
    type: 'td',
    textContent: `{${col.name}}`,
    style: {
      padding: '6px 12px',
      borderBottom: '1px solid #e1e4e8',
      fontSize: '14px',
      cursor: 'pointer'
    }
  }));

  const tableComponent = {
    id: 'table',
    type: 'table',
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      border: '1px solid #e0e0e0'
    },
    components: [
      {
        id: 'thead',
        type: 'thead',
        style: { backgroundColor: '#f5f5f5' },
        components: [
          {
            id: 'headerRow',
            type: 'tr',
            components: headerCells
          }
        ]
      },
      {
        id: 'tbody',
        type: 'tbody',
        props: {
          dataSource: componentId,
          rowKey,
          selectable,
          columns: visibleColumns.map(col => ({
            field: col.name,
            header: col.label || col.name,
            width: col.width || 'auto',
            ...(col.hidden && { hidden: true })
          }))
        },
        components: [
          {
            id: 'placeholderRow',
            type: 'tr',
            style: {},
            components: placeholderCells
          }
        ]
      }
    ]
  };

  return [tableComponent];
};
