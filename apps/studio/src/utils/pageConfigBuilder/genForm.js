export const generateFormComponents = (props, componentId, existingChildren = []) => {
  const { columns } = props;

  if (!columns || columns.length === 0) {
    return existingChildren;
  }

  const visibleColumns = columns.filter(col => !col.hidden);

  const fieldComponents = visibleColumns.map(col => {
    const inputType = col.inputType || 'text';
    const isRequired = col.required || col.nullable === 'NO';
    const label = col.label || col.name.charAt(0).toUpperCase() + col.name.slice(1).replace(/_/g, ' ');
    const displayLabel = isRequired ? `${label}*` : label;

    const htmlInputType = inputType === 'textarea' ? 'text' : inputType;

    const row = col.row ? parseInt(col.row) : 0;
    const order = col.col ? parseInt(col.col) : 0;

    return {
      id: col.name,
      type: 'div',
      style: { marginBottom: '16px' },
      ...(row > 0 && { position: { row, order } }),
      components: [
        {
          id: `label_${col.name}`,
          type: 'label',
          textContent: displayLabel,
          props: { htmlFor: col.name },
          style: {
            display: 'block',
            marginBottom: '4px',
            fontWeight: '500'
          }
        },
        {
          id: `input_${col.name}`,
          type: inputType === 'textarea' ? 'textarea' : 'input',
          props: {
            name: col.name,
            ...(inputType !== 'textarea' && { type: htmlInputType }),
            placeholder: col.placeholder || '',
            required: isRequired
          },
          style: {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            ...(inputType === 'textarea' && { minHeight: '80px', resize: 'vertical' })
          }
        }
      ]
    };
  });

  return [...fieldComponents, ...existingChildren];
};
