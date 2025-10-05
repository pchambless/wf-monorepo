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

  // Template store for eventType definitions (components + containers)
  const [templates, setTemplates] = React.useState({});
  const [templatesLoaded, setTemplatesLoaded] = React.useState(false);

  // Modal state management
  const [openModals, setOpenModals] = React.useState(new Set());

  // Callback for triggers to store data
  const setData = React.useCallback((componentId, data) => {
    console.log(`📦 Storing data for ${componentId}:`, data);
    setDataStore(prev => ({ ...prev, [componentId]: data }));
  }, []);

  // Load eventType templates on mount
  React.useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/eventTypes');
        const eventTypes = await response.json();

        const templateMap = {};
        eventTypes.forEach(et => {
          templateMap[et.name] = {
            style: et.style,
            config: et.config,
            category: et.category,
            title: et.title
          };
        });

        console.log('📐 Loaded eventType templates:', Object.keys(templateMap));
        setTemplates(templateMap);
        setTemplatesLoaded(true);
      } catch (error) {
        console.error('❌ Failed to load eventType templates:', error);
        setTemplatesLoaded(true); // Continue even if load fails
      }
    };

    loadTemplates();
  }, []);

  // Initialize TriggerEngine once
  React.useEffect(() => {
    triggerEngine.initialize(null); // TODO: Wire up contextStore for visibility
  }, []);

  // Listen for modal open/close events
  React.useEffect(() => {
    const handleOpenModal = (event) => {
      const { modalId } = event.detail;
      console.log('🔓 Modal opened:', modalId);
      setOpenModals(prev => new Set([...prev, modalId]));
    };

    const handleCloseModal = (event) => {
      const { modalId } = event.detail;
      if (modalId) {
        console.log('🔒 Modal closed:', modalId);
        setOpenModals(prev => {
          const next = new Set(prev);
          next.delete(modalId);
          return next;
        });
      } else {
        console.log('🔒 All modals closed');
        setOpenModals(new Set());
      }
    };

    window.addEventListener('openModal', handleOpenModal);
    window.addEventListener('closeModal', handleCloseModal);

    return () => {
      window.removeEventListener('openModal', handleOpenModal);
      window.removeEventListener('closeModal', handleCloseModal);
    };
  }, []);

  // Execute page-level onLoad triggers
  React.useEffect(() => {
    if (config.workflowTriggers?.onLoad) {
      console.log('🚀 Executing page-level onLoad triggers:', config.workflowTriggers.onLoad);

      const context = {
        pageConfig: config,
        setData,
        workflowTriggers: config.workflowTriggers
      };

      triggerEngine.executeTriggers(config.workflowTriggers.onLoad, context);
    }
  }, [config, setData]);

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
   * Convert position to CSS grid properties
   */
  const getGridPosition = (position) => {
    if (!position || !position.row || !position.col) return {};

    const { row, col } = position;
    return {
      gridRow: `${row.start} / span ${row.span}`,
      gridColumn: `${col.start} / span ${col.span}`
    };
  };

  /**
   * Ultra-simple component renderer - pure pageConfig driven
   */
  const renderComponent = (component) => {
    const {
      comp_type,
      type: legacyType,
      id,
      props = {},
      style: legacyStyle = {},
      override_styles = {},
      position,
      workflowTriggers,
      components = [],
      textContent
    } = component;

    // Look up template from eventTypes if comp_type exists
    const template = comp_type ? templates[comp_type] : null;
    if (!template && comp_type) {
      console.warn(`⚠️ No template found for comp_type: ${comp_type}`);
    }

    // Merge styles: template style (if exists) + override_styles + legacy style
    const style = {
      ...(template?.style || {}),
      ...override_styles,
      ...legacyStyle
    };

    // Use comp_type or fall back to legacy type field
    const type = (comp_type || legacyType || 'div').toLowerCase();

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
      _onClick,
      ...domProps
    } = props;

    // Add _onClick to eventHandlers if present (for grid rows)
    const finalEventHandlers = {
      ...eventHandlers,
      ...(_onClick && { onClick: _onClick })
    };

    // Handle tbody with dataSource - dynamic row rendering
    let children;
    if (type === 'tbody' && props.dataSource) {
      const gridId = props.dataSource; // dataSource IS the grid component ID
      const data = dataStore[gridId];

      console.log(`🔍 tbody rendering - gridId: ${gridId}, data:`, data);

      // Find grid component to get its onChange triggers
      const gridComponent = config.components?.find(c => c.id === gridId);
      const gridOnChangeTriggers = gridComponent?.workflowTriggers?.onChange;

      if (data && data.length > 0 && components.length > 0) {
        // Clone placeholder row for each data item
        const placeholder = components[0];
        children = data.map((row, idx) => renderRow(placeholder, row, idx, gridOnChangeTriggers, props.rowKey));
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

    // Ultra-simple data binding: check dataStore for any matching data
    let inputKey = id;
    if (type === 'input' && domProps.name) {
      // Check all dataStore entries for data with this field
      Object.entries(dataStore).forEach(([storeKey, data]) => {
        if (data && data.length > 0 && data[0][domProps.name] !== undefined) {
          domProps.defaultValue = data[0][domProps.name];
          inputKey = `${id}_${data[0][domProps.name]}`;
        }
      });
    }

    // Merge position-based grid CSS with component style
    const gridPosition = getGridPosition(position);
    const mergedStyle = { ...style, ...gridPosition };

    // Debug: log grid positioning for Grid and Form
    if (comp_type === 'Grid' || comp_type === 'Form') {
      console.log(`📐 ${comp_type} positioning:`, { position, gridPosition, mergedStyle });
    }


    return React.createElement(
      htmlElement,
      {
        key: inputKey,
        id: id,
        style: mergedStyle,       // FROM pageConfig + grid position
        ...domProps,              // FROM pageConfig (filtered)
        ...finalEventHandlers     // FROM pageConfig via TriggerEngine + row clicks
      },
      children
    );
  };

  /**
   * Find parent grid ID - simple upward search
   */
  const findParentGridId = (component, pageConfig) => {
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
  const renderRow = (placeholder, rowData, idx, onChangeTriggers, rowKey = 'id') => {
    const cloneWithData = (comp) => {
      let textContent = comp.textContent;

      // Replace {fieldName} tokens with actual values
      if (textContent && textContent.includes('{')) {
        Object.entries(rowData).forEach(([field, value]) => {
          textContent = textContent.replace(`{${field}}`, value);
        });
      }

      const clonedComp = {
        ...comp,
        id: `${comp.id}_${idx}`,
        key: `${comp.id}_${idx}`,
        textContent,
        components: comp.components?.map(child => cloneWithData(child))
      };

      // Add onClick handler to row (tr) if grid has onChange triggers
      if (comp.type === 'tr' && onChangeTriggers) {
        // Grid onChange becomes row onClick
        const rowValue = rowData[rowKey];

        // Add alternating row backgrounds (zebra striping) + cursor pointer
        const bgColor = idx % 2 === 0 ? '#ffffff' : '#f5f5f5'; // Subtle gray striping

        clonedComp.style = {
          ...(comp.style || {}),
          backgroundColor: bgColor,
          cursor: 'pointer',
          transition: 'background-color 0.15s ease'
        };

        // Add onClick handler to props
        clonedComp.props = {
          ...(comp.props || {}),
          _onClick: async (e) => {
            console.log(`🎯 Row clicked: ${rowValue}`, rowData);

            const context = {
              event: e,
              componentId: comp.id,
              this: { value: rowValue },  // Template {{this.value}} resolves to rowValue
              selected: rowData,           // Template {{selected.id}} resolves to rowData.id
              rowData: rowData,
              pageConfig: config,
              setData,
              workflowTriggers: { onChange: onChangeTriggers }
            };

            await triggerEngine.executeTriggers(onChangeTriggers, context);
          }
        };
      }

      return clonedComp;
    };

    return renderComponent(cloneWithData(placeholder));
  };

  // Determine container layout style
  const containerStyle = {
    fontFamily: 'system-ui, sans-serif',
    ...(config.layout === 'flex' && {
      display: 'grid',
      gap: '16px',
      gridTemplateColumns: 'repeat(12, 1fr)', // 12-column grid
      gridTemplateRows: 'auto',
      width: '100%',
      height: '100%'
    })
  };

  // Wait for templates to load before rendering
  if (!templatesLoaded) {
    return <div style={{ padding: '20px' }}>Loading templates...</div>;
  }

  // Separate modal and regular components
  const regularComponents = config.components?.filter(c => c.container !== 'Modal') || [];
  const modalComponents = config.components?.filter(c => c.container === 'Modal') || [];

  return (
    <>
      <div className="direct-renderer" style={containerStyle}>
        {regularComponents.map(component => renderComponent(component))}
      </div>

      {/* Render modals that are open */}
      {modalComponents.map(modalComp => {
        if (!openModals.has(modalComp.id)) return null;

        const modalTemplate = templates['Modal'];
        const modalStyle = {
          ...(modalTemplate?.style || {}),
          ...modalComp.override_styles
        };

        return (
          <React.Fragment key={modalComp.id}>
            {/* Modal backdrop */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => {
                const event = new CustomEvent('closeModal', {
                  detail: { modalId: modalComp.id }
                });
                window.dispatchEvent(event);
              }}
            >
              {/* Modal content */}
              <div
                style={modalStyle}
                onClick={(e) => e.stopPropagation()} // Prevent backdrop click
              >
                {renderComponent(modalComp)}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default DirectRenderer;