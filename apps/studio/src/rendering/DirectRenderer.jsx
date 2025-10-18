/**
 * DirectRenderer - Modularized PageConfig Renderer (Flex-only Layout)
 *
 * Orchestrates rendering with extracted modules for:
 * - Modal management (useModalManager hook)
 * - Template loading (useTemplateLoader hook)
 * - Style utilities (getFlexPosition, getHtmlElement)
 * - Event handlers (buildEventHandlers)
 * - Row rendering (renderRow)
 */

import React from 'react';
import { triggerEngine } from './WorkflowEngine/TriggerEngine.js';
import { useModalManager } from './hooks/useModalManager.js';
import { useTemplateLoader } from './hooks/useTemplateLoader.js';
import { getFlexPosition, getHtmlElement } from './utils/styleUtils.js';
import { buildEventHandlers } from './utils/eventHandlerBuilder.js';
import { renderRow } from './utils/rowRenderer.js';
import StudioCanvasWrapper from '../components/StudioCanvasWrapper.jsx';

const customComponents = {
  StudioCanvasWrapper
};

const DirectRenderer = ({ config }) => {
  if (!config) {
    return <div>No config provided</div>;
  }

  const [dataStore, setDataStore] = React.useState({});
  const { templates, templatesLoaded } = useTemplateLoader();
  const { openModals } = useModalManager();

  const findComponentById = React.useCallback((components, targetId) => {
    for (const comp of components) {
      if (comp.id === targetId) return comp;
      if (comp.components && comp.components.length > 0) {
        const found = findComponentById(comp.components, targetId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const setData = React.useCallback((componentId, data) => {
    console.log(`📦 Storing data for ${componentId}:`, data);
    setDataStore(prev => ({ ...prev, [componentId]: data }));
  }, []);

  // Runtime context store for visibility and other temporary UI state
  const [contextStore, setContextStore] = React.useState({});

  React.useEffect(() => {
    triggerEngine.initialize({});
  }, []);

  React.useEffect(() => {
    if (config.workflowTriggers?.onLoad) {
      console.log('🚀 Executing page-level onLoad triggers:', config.workflowTriggers.onLoad);
      const context = {
        pageConfig: config,
        setData,
        workflowTriggers: config.workflowTriggers,
        contextStore: contextStore
      };
      triggerEngine.executeTriggers(config.workflowTriggers.onLoad, context);
    }
  }, [config, setData, contextStore]);

  // Group components by row for flex layout
  const groupByRow = (components) => {
    const rows = {};
    components.forEach(comp => {
      const row = comp.position?.row || 0;
      if (!rows[row]) rows[row] = [];
      rows[row].push(comp);
    });

    // Sort components within each row by order
    Object.keys(rows).forEach(rowKey => {
      rows[rowKey].sort((a, b) =>
        (a.position?.order || 0) - (b.position?.order || 0)
      );
    });

    return rows;
  };

  // Get row alignment from first component in row
  const getRowAlignment = (components) => {
    const firstAlign = components[0]?.position?.align || 'left';
    const alignMap = {
      'left': 'flex-start',
      'center': 'center',
      'right': 'flex-end'
    };
    return alignMap[firstAlign] || 'flex-start';
  };

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

    // Check visibility in runtime context
    const visibilityKey = `${id}_visible`;
    if (contextStore[visibilityKey] === false) {
      console.log(`🙈 Component ${id} hidden by visibility context`);
      return null;
    }

    if (comp_type && customComponents[comp_type]) {
      const CustomComponent = customComponents[comp_type];
      return (
        <CustomComponent
          key={id}
          id={id}
          {...props}
        />
      );
    }

    const template = comp_type ? templates[comp_type] : null;
    if (!template && comp_type) {
      console.warn(`⚠️ No template found for comp_type: ${comp_type}`);
    }

    const style = {
      ...(template?.style || {}),
      ...override_styles,
      ...legacyStyle
    };

    const type = (comp_type || legacyType || 'div').toLowerCase();
    const htmlElement = getHtmlElement(type);
    const eventHandlers = buildEventHandlers(workflowTriggers, config, setData, contextStore);

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

    const finalEventHandlers = {
      ...eventHandlers,
      ...(_onClick && { onClick: _onClick })
    };

    let children;
    if (type === 'tbody' && props.dataSource) {
      const gridId = props.dataSource;
      const data = dataStore[gridId];

      const gridComponent = findComponentById(config.components || [], gridId);
      const gridOnChangeTriggers = gridComponent?.workflowTriggers?.onChange;

      if (data && data.length > 0 && components.length > 0) {
        const placeholder = components[0];
        children = data.map((row, idx) =>
          renderRow(placeholder, row, idx, gridOnChangeTriggers, props.rowKey, renderComponent, config, setData)
        );
      } else {
        children = components.map(child => renderComponent(child));
      }
    } else if (comp_type === 'Container' && components.length > 0) {
      // Container: Group children by row for flex layout
      const childRows = groupByRow(components);
      const sortedChildRowKeys = Object.keys(childRows).sort((a, b) => parseInt(a) - parseInt(b));

      children = sortedChildRowKeys.map(rowKey => {
        const rowComponents = childRows[rowKey];
        const justifyContent = getRowAlignment(rowComponents);

        return (
          <div
            key={`container-row-${id}-${rowKey}`}
            style={{
              display: 'flex',
              gap: '16px',
              width: '100%',
              justifyContent
            }}
          >
            {rowComponents.map(child => renderComponent(child))}
          </div>
        );
      });
    } else {
      children = textContent ||
        (components.length > 0 ? components.map(child => renderComponent(child)) :
         (props.label || props.title || null));
    }

    let inputKey = id;
    let fieldValue = null;
    let hasData = false;
    if ((type === 'input' || type === 'textarea') && domProps.name) {
      Object.entries(dataStore).forEach(([storeKey, data]) => {
        if (data && Array.isArray(data)) {
          hasData = true;
          if (data.length > 0 && data[0][domProps.name] !== undefined) {
            fieldValue = data[0][domProps.name];
          } else {
            // Data exists but is empty array - clear the field
            fieldValue = '';
          }
        }
      });

      if (hasData) {
        console.log(`🔍 Setting ${type} field "${domProps.name}" = "${fieldValue}"`);
        // Use defaultValue with timestamp in key to force complete recreation
        domProps.defaultValue = fieldValue || '';
        // Add timestamp to force truly unique key
        inputKey = `${id}_${Date.now()}_${Math.random()}`;
      }
    }

    const flexPosition = getFlexPosition(position);
    const mergedStyle = { ...style, ...flexPosition };

    // For textarea with defaultValue, children must be undefined
    if (type === 'textarea' && domProps.defaultValue !== undefined) {
      children = undefined;
      console.log(`🔍 Textarea "${id}" - defaultValue: "${domProps.defaultValue}", key: "${inputKey}"`);
    }

    // Debug: Log final props being passed to React.createElement
    if (type === 'textarea') {
      console.log(`🔍 Creating textarea element:`, {
        key: inputKey,
        id: id,
        name: domProps.name,
        defaultValue: domProps.defaultValue,
        children: children
      });
    }

    return React.createElement(
      htmlElement,
      {
        key: inputKey,
        id: id,
        style: mergedStyle,
        ...domProps,
        ...finalEventHandlers
      },
      children
    );
  };

  const containerStyle = {
    fontFamily: 'system-ui, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    height: '100%'
  };

  if (!templatesLoaded) {
    return <div style={{ padding: '20px' }}>Loading templates...</div>;
  }

  const regularComponents = config.components?.filter(c => c.container !== 'Modal') || [];
  const modalComponents = config.components?.filter(c => c.container === 'Modal') || [];

  // Group regular components by row
  const componentRows = groupByRow(regularComponents);
  const sortedRowKeys = Object.keys(componentRows).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <>
      <div className="direct-renderer" style={containerStyle}>
        {sortedRowKeys.map(rowKey => {
          const rowComponents = componentRows[rowKey];
          const justifyContent = getRowAlignment(rowComponents);

          return (
            <div
              key={`row-${rowKey}`}
              style={{
                display: 'flex',
                gap: '16px',
                width: '100%',
                justifyContent
              }}
            >
              {rowComponents.map(component => renderComponent(component))}
            </div>
          );
        })}
      </div>

      {modalComponents.map(modalComp => {
        if (!openModals.has(modalComp.id)) return null;

        const modalTemplate = templates['Modal'];
        const modalStyle = {
          ...(modalTemplate?.style || {}),
          ...modalComp.override_styles
        };

        return (
          <React.Fragment key={modalComp.id}>
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
              <div
                style={modalStyle}
                onClick={(e) => e.stopPropagation()}
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
