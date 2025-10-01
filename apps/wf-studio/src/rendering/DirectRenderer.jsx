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

  // Data store for grid/component data keyed by componentId
  const [dataStore, setDataStore] = React.useState({});

  // Callback for triggers to store data
  const setData = React.useCallback((componentId, data) => {
    console.log(`📦 Storing data for ${componentId}:`, data);
    setDataStore(prev => ({ ...prev, [componentId]: data }));
  }, []);

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
   * Build event handlers from workflowTriggers - only for DOM events
   */
  const buildEventHandlers = (workflowTriggers) => {
    if (!workflowTriggers) return {};

    const handlers = {};
    Object.entries(workflowTriggers).forEach(([eventType, triggers]) => {
      // Check if any trigger in this eventType is a DOM event
      const hasDomEventTrigger = triggers.some(trigger => trigger.is_dom_event);

      if (!hasDomEventTrigger) {
        console.log(`⏭️ Skipping ${eventType} - workflow callback, not DOM event`);
        return;
      }

      const handlerName = {
        'onSubmit': 'onSubmit', 'onClick': 'onClick', 'onChange': 'onChange', 'onLoad': 'onLoad'
      }[eventType] || 'onClick';

      console.log(`🔧 Building DOM handler: ${handlerName} for eventType: ${eventType}, triggers:`, triggers);

      handlers[handlerName] = async (e) => {
        console.log(`🎯 DOM Handler fired: ${handlerName}`, e.target);
        // Prevent default for form submissions and button clicks inside forms
        if (eventType === 'onSubmit' || eventType === 'onClick') {
          e.preventDefault();
        }

        const context = {
          event: e,
          form: e.target.closest('form'),
          formData: e.target.closest('form') ?
            Object.fromEntries(new FormData(e.target.closest('form'))) : null,
          workflowTriggers, // Pass all triggers for success/error callbacks
          pageConfig: config, // Add pageConfig for refresh action
          setData // Add setData callback for execEvent
        };

        // Only execute DOM event triggers, TriggerEngine will handle callbacks
        const domTriggers = triggers.filter(trigger => trigger.is_dom_event);
        console.log(`🔄 Executing DOM triggers:`, domTriggers, context);
        await triggerEngine.executeTriggers(domTriggers, context);
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

    // Handle tbody with dataSource - dynamic row rendering
    let children;
    if (type === 'tbody' && props.dataSource) {
      const gridId = findParentGridId(component, config);
      const data = dataStore[gridId];

      if (data && data.length > 0 && components.length > 0) {
        // Clone placeholder row for each data item
        const placeholder = components[0];
        children = data.map((row, idx) => renderRow(placeholder, row, idx));
      } else {
        // No data yet or placeholder not found
        children = components.map(child => renderComponent(child));
      }
    } else {
      // Normal rendering
      children = textContent ||
        (components.length > 0 ? components.map(child => renderComponent(child)) :
         (props.label || props.title || null));
    }

    return React.createElement(
      htmlElement,
      {
        key: id,
        id: id,
        style: style,        // FROM pageConfig
        ...domProps,         // FROM pageConfig (filtered)
        ...eventHandlers     // FROM pageConfig via TriggerEngine
      },
      children
    );
  };

  /**
   * Find parent grid ID for tbody
   */
  const findParentGridId = (component, pageConfig) => {
    // Look for a grid component in the config tree
    // For now, simple approach: find grid with tbody as descendant
    const findGrid = (comp) => {
      if (comp.type === 'grid') return comp.id;
      if (comp.components) {
        for (const child of comp.components) {
          const found = findGrid(child);
          if (found) return found;
        }
      }
      return null;
    };

    for (const root of pageConfig.components || []) {
      const gridId = findGrid(root);
      if (gridId) return gridId;
    }
    return null;
  };

  /**
   * Render row from placeholder, replacing {tokens} with data
   */
  const renderRow = (placeholder, rowData, idx) => {
    const cloneWithData = (comp) => {
      let textContent = comp.textContent;

      // Replace {fieldName} tokens with actual values
      if (textContent && textContent.includes('{')) {
        Object.entries(rowData).forEach(([field, value]) => {
          textContent = textContent.replace(`{${field}}`, value);
        });
      }

      return {
        ...comp,
        id: `${comp.id}_${idx}`,
        key: `${comp.id}_${idx}`,
        textContent,
        components: comp.components?.map(child => cloneWithData(child))
      };
    };

    return renderComponent(cloneWithData(placeholder));
  };

  return (
    <div className="direct-renderer" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {config.components?.map(component => renderComponent(component))}
    </div>
  );
};

export default DirectRenderer;