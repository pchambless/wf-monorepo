/**
 * DirectRenderer - Modularized PageConfig Renderer
 *
 * Orchestrates rendering with extracted modules for:
 * - Modal management (useModalManager hook)
 * - Template loading (useTemplateLoader hook)
 * - Style utilities (getGridPosition, getHtmlElement)
 * - Event handlers (buildEventHandlers)
 * - Row rendering (renderRow)
 */

import React from 'react';
import { triggerEngine } from './WorkflowEngine/TriggerEngine.js';
import { useModalManager } from './hooks/useModalManager.js';
import { useTemplateLoader } from './hooks/useTemplateLoader.js';
import { getGridPosition, getHtmlElement } from './utils/styleUtils.js';
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

  const setData = React.useCallback((componentId, data) => {
    console.log(`📦 Storing data for ${componentId}:`, data);
    setDataStore(prev => ({ ...prev, [componentId]: data }));
  }, []);

  React.useEffect(() => {
    triggerEngine.initialize({});
  }, []);

  React.useEffect(() => {
    if (config.workflowTriggers?.onLoad) {
      console.log('🚀 Executing page-level onLoad triggers:', config.workflowTriggers.onLoad);
      const context = { pageConfig: config, setData, workflowTriggers: config.workflowTriggers };
      triggerEngine.executeTriggers(config.workflowTriggers.onLoad, context);
    }
  }, [config, setData]);

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
    const eventHandlers = buildEventHandlers(workflowTriggers, config, setData);

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

      console.log(`🔍 tbody rendering - gridId: ${gridId}, data:`, data);

      const gridComponent = config.components?.find(c => c.id === gridId);
      const gridOnChangeTriggers = gridComponent?.workflowTriggers?.onChange;

      if (data && data.length > 0 && components.length > 0) {
        const placeholder = components[0];
        children = data.map((row, idx) =>
          renderRow(placeholder, row, idx, gridOnChangeTriggers, props.rowKey, renderComponent, config, setData)
        );
      } else {
        children = components.map(child => renderComponent(child));
      }
    } else {
      children = textContent ||
        (components.length > 0 ? components.map(child => renderComponent(child)) :
         (props.label || props.title || null));
    }

    let inputKey = id;
    if (type === 'input' && domProps.name) {
      Object.entries(dataStore).forEach(([storeKey, data]) => {
        if (data && data.length > 0 && data[0][domProps.name] !== undefined) {
          domProps.defaultValue = data[0][domProps.name];
          inputKey = `${id}_${data[0][domProps.name]}`;
        }
      });
    }

    const gridPosition = getGridPosition(position);
    const mergedStyle = { ...style, ...gridPosition };

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
    ...(config.layout === 'flex' && {
      display: 'grid',
      gap: '16px',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gridTemplateRows: 'auto',
      width: '100%',
      height: '100%'
    })
  };

  if (!templatesLoaded) {
    return <div style={{ padding: '20px' }}>Loading templates...</div>;
  }

  const regularComponents = config.components?.filter(c => c.container !== 'Modal') || [];
  const modalComponents = config.components?.filter(c => c.container === 'Modal') || [];

  return (
    <>
      <div className="direct-renderer" style={containerStyle}>
        {regularComponents.map(component => renderComponent(component))}
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
