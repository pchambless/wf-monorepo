/**
 * DirectRenderer - Ultra-Simple PageConfig Renderer
 *
 * Pure component tree rendering - no hardcoded cases or special logic
 * All styling, props, and behavior come from pageConfig
 * Uses TriggerEngine for workflowTriggers execution
 */

import React from 'react';
import { triggerEngine } from './WorkflowEngine/TriggerEngine.js';

const DirectRenderer = ({ config }) => {
  if (!config) {
    return <div>No config provided</div>;
  }

  // Initialize TriggerEngine once
  React.useEffect(() => {
    triggerEngine.initialize(null); // TODO: Wire up contextStore for visibility
  }, []);

  /**
   * Map component type to HTML element
   */
  const getHtmlElement = (type) => {
    const elementMap = {
      'page': 'div', 'form': 'form', 'button': 'button', 'select': 'select',
      'input': 'input', 'label': 'label', 'div': 'div', 'span': 'span',
      'h1': 'h1', 'h2': 'h2', 'h3': 'h3', 'p': 'p',
      'modal': 'div', 'section': 'section', 'nav': 'nav', 'header': 'header',
      'grid': 'div', 'table': 'table', 'thead': 'thead', 'tbody': 'tbody',
      'tr': 'tr', 'th': 'th', 'td': 'td'
    };
    return elementMap[type] || 'div';
  };

  /**
   * Build event handlers from workflowTriggers
   */
  const buildEventHandlers = (workflowTriggers) => {
    if (!workflowTriggers) return {};

    const handlers = {};
    Object.entries(workflowTriggers).forEach(([eventType, triggers]) => {
      const handlerName = {
        'onSubmit': 'onSubmit', 'onClick': 'onClick', 'onChange': 'onChange'
      }[eventType] || 'onClick';

      console.log(`🔧 Building handler: ${handlerName} for eventType: ${eventType}, triggers:`, triggers);

      handlers[handlerName] = async (e) => {
        console.log(`🎯 Handler fired: ${handlerName}`, e.target);
        if (eventType === 'onSubmit') e.preventDefault();

        const context = {
          event: e,
          form: e.target.closest('form'),
          formData: e.target.closest('form') ?
            Object.fromEntries(new FormData(e.target.closest('form'))) : null
        };

        console.log(`🔄 Executing triggers:`, triggers, context);
        await triggerEngine.executeTriggers(triggers, context);
      };
    });

    return handlers;
  };

  /**
   * Ultra-simple component renderer - pure pageConfig driven
   */
  const renderComponent = (component) => {
    const {
      type,
      id,
      props = {},
      style = {},
      workflowTriggers,
      components = [],
      textContent
    } = component;

    // Debug logging
    if (id === 'LoginForm') {
      console.log('🔍 LoginForm component:', { id, type, componentsCount: components.length, components });
    }

    // Get HTML element and event handlers from pageConfig
    const htmlElement = getHtmlElement(type);
    const eventHandlers = buildEventHandlers(workflowTriggers);

    // Filter out non-DOM props before spreading (React-specific and custom props)
    const {
      workflowTriggers: _wt,
      components: _c,
      textContent: _tc,
      dataSource: _ds,
      rowKey: _rk,
      selectable: _sel,
      columns: _cols,
      ...domProps
    } = props;
    
    // Pure pageConfig rendering - no special cases
    return React.createElement(
      htmlElement,
      {
        key: id,
        id: id,
        style: style,        // FROM pageConfig
        ...domProps,         // FROM pageConfig (filtered)
        ...eventHandlers     // FROM pageConfig via TriggerEngine
      },
      // Content: textContent, children components, or props content
      textContent ||
      (components.length > 0 ? components.map(child => renderComponent(child)) :
       (props.label || props.title || null))
    );
  };

  return (
    <div className="direct-renderer" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {config.components?.map(component => renderComponent(component))}
    </div>
  );
};

export default DirectRenderer;