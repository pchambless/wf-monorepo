import React from 'react';

/**
 * Render text-based components (H1-H4, Text, Label)
 * @param {Object} component - Component configuration
 * @param {Function} getHtmlElement - Function to get HTML element
 * @param {Function} buildEventHandlers - Function to build event handlers
 * @param {Object} context - Rendering context
 * @returns {React.Element} Rendered text component
 */
export function renderTextComponent(component, getHtmlElement, buildEventHandlers, context) {
  const { comp_type, props = {}, style = {}, id } = component;

  // Determine HTML tag based on comp_type
  const tagMap = {
    'H1': 'h1',
    'H2': 'h2',
    'H3': 'h3',
    'H4': 'h4',
    'Text': 'p',
    'Label': 'label'
  };

  const tag = tagMap[comp_type] || 'span';

  // Get text content from props or textContent
  let text = props.text || props.textContent || component.textContent || '';

  // Resolve template tokens like {{pageConfig.props.pageTitle}}, {{dataStore.X.Y}}, {{contextStore.X}}
  if (text && text.includes('{{')) {
    const { pageConfig, contextStore, formData, dataStore } = context;

    // Replace {{dataStore.componentId.property}} tokens
    text = text.replace(/\{\{dataStore\.(\w+)\.(\w+)\}\}/g, (match, componentId, propName) => {
      const componentData = dataStore?.[componentId];
      return componentData?.[propName] !== undefined ? String(componentData[propName]) : '';
    });

    // Replace {{contextStore.X}} tokens
    text = text.replace(/\{\{contextStore\.(\w+)\}\}/g, (match, propName) => {
      return contextStore?.[propName] !== undefined ? contextStore[propName] : match;
    });

    // Replace {{formData.X}} tokens
    text = text.replace(/\{\{formData\.(\w+)\}\}/g, (match, propName) => {
      return formData?.[propName] || match;
    });

    // Replace {{pageConfig.props.X}} tokens
    text = text.replace(/\{\{pageConfig\.props\.(\w+)\}\}/g, (match, propName) => {
      return pageConfig?.props?.[propName] || match;
    });

    // Replace {{pageConfig.X}} tokens
    text = text.replace(/\{\{pageConfig\.(\w+)\}\}/g, (match, propName) => {
      return pageConfig?.[propName] || match;
    });
  }

  // Build event handlers from workflowTriggers
  const eventHandlers = buildEventHandlers(
    component.workflowTriggers,
    context.pageConfig,
    context.setData,
    context.contextStore
  );

  // Get the React element type
  const Element = getHtmlElement(tag);

  return (
    <Element
      key={id}
      id={id}
      style={style}
      {...eventHandlers}
      {...(props.htmlFor && { htmlFor: props.htmlFor })} // For label elements
    >
      {text}
    </Element>
  );
}

/**
 * Check if component type is a text component
 * @param {string} comp_type - Component type
 * @returns {boolean} True if text component
 */
export function isTextComponent(comp_type) {
  return ['H1', 'H2', 'H3', 'H4', 'Text', 'Label'].includes(comp_type);
}
