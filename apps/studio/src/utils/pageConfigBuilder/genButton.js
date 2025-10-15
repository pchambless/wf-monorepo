export const generateButtonComponents = (props, componentId) => {
  const { label = 'Submit', type = 'submit', variant = 'primary' } = props;

  return [
    {
      id: `${componentId}_label`,
      type: 'span',
      textContent: label
    }
  ];
};
