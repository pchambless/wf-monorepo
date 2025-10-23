/**
 * DirectRenderer - Modularized PageConfig Renderer (Flex-only Layout)
 *
 * Orchestrates rendering with extracted modules for:
 * - Modal management (useModalManager hook)
 * - Template loading (useTemplateLoader hook)
 * - App layout rendering (renderAppBar, renderSidebar)
 * - Layout utilities (groupByRow, getRowAlignment, separateComponentsByType)
 * - Style utilities (getFlexPosition, getHtmlElement)
 * - Event handlers (buildEventHandlers)
 * - Row rendering (renderRow)
 */

import React from "react";
import { triggerEngine } from "./WorkflowEngine/TriggerEngine.js";
import { useModalManager } from "./hooks/useModalManager.js";
import { useTemplateLoader } from "./hooks/useTemplateLoader.js";
import { getFlexPosition, getHtmlElement } from "./utils/styleUtils.js";
import { buildEventHandlers } from "./utils/eventHandlerBuilder.js";
import { renderRow } from "./utils/rowRenderer.js";
import { renderAppBar, renderSidebar } from "./utils/appLayoutRenderer.js";
import { groupByRow, getRowAlignment, separateComponentsByType } from "./utils/layoutUtils.js";
import StudioCanvasWrapper from "../components/StudioCanvasWrapper.jsx";

const customComponents = {
  StudioCanvasWrapper,
};

const DirectRenderer = ({ config }) => {
  if (!config) {
    return <div>No config provided</div>;
  }

  const [dataStore, setDataStore] = React.useState({});
  const { templates, templatesLoaded } = useTemplateLoader();
  const { openModals } = useModalManager();

  // Task 3: Cache Component Lookups with memoized Map
  const componentMap = React.useMemo(() => {
    const map = new Map();
    const traverse = (components) => {
      components?.forEach((comp) => {
        map.set(comp.id, comp);
        if (comp.components) traverse(comp.components);
      });
    };
    traverse(config.components);
    return map;
  }, [config.components]);

  const findComponentById = React.useCallback(
    (targetId) => componentMap.get(targetId),
    [componentMap]
  );

  const setData = React.useCallback((componentId, data) => {
    setDataStore((prev) => ({ ...prev, [componentId]: data }));
  }, []);

  // Runtime context store for visibility and other temporary UI state
  const [contextStore, setContextStore] = React.useState({});

  // Task 2: Controlled Form Data State
  const [formData, setFormData] = React.useState({});

  React.useEffect(() => {
    triggerEngine.initialize({});
  }, []);

  React.useEffect(() => {
    if (config.workflowTriggers?.onLoad) {
      const context = {
        pageConfig: config,
        setData,
        workflowTriggers: config.workflowTriggers,
        contextStore: contextStore,
      };
      triggerEngine.executeTriggers(config.workflowTriggers.onLoad, context);
    }
  }, [config, setData, contextStore]);

  // Task 2: Sync dataStore → formData for controlled components
  React.useEffect(() => {
    const firstRowData = {};
    let hasEmptyArray = false;

    Object.entries(dataStore).forEach(([key, data]) => {
      if (Array.isArray(data) && data.length > 0) {
        Object.assign(firstRowData, data[0]);
      } else if (Array.isArray(data) && data.length === 0) {
        hasEmptyArray = true;
      }
    });

    // If any dataStore entry is an empty array, clear the form completely
    if (hasEmptyArray) {
      setFormData({});
    } else {
      setFormData(firstRowData);
    }
  }, [dataStore]);

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
      textContent,
    } = component;

    // Check visibility in runtime context
    const visibilityKey = `${id}_visible`;
    if (contextStore[visibilityKey] === false) {
      return null;
    }

    // Handle AppBar comp_type with vanilla React
    if (comp_type === "AppBar") {
      return renderAppBar(component, config, renderComponent);
    }

    // Handle Sidebar comp_type with vanilla React
    if (comp_type === "Sidebar") {
      return renderSidebar(component, config, renderComponent);
    }

    if (comp_type && customComponents[comp_type]) {
      const CustomComponent = customComponents[comp_type];
      return <CustomComponent key={id} id={id} {...props} />;
    }

    const template = comp_type ? templates[comp_type] : null;
    if (!template && comp_type) {
      console.warn(`⚠️ No template found for comp_type: ${comp_type}`);
    }

    const style = {
      ...(template?.style || {}),
      ...override_styles,
      ...legacyStyle,
    };

    const type = (comp_type || legacyType || "div").toLowerCase();
    const htmlElement = getHtmlElement(type);
    const eventHandlers = buildEventHandlers(
      workflowTriggers,
      config,
      setData,
      contextStore
    );

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
      ...(_onClick && { onClick: _onClick }),
    };

    let children;
    if (type === "tbody" && props.dataSource) {
      const gridId = props.dataSource;
      const data = dataStore[gridId];

      const gridComponent = findComponentById(gridId);
      const gridOnChangeTriggers = gridComponent?.workflowTriggers?.onChange;

      if (data && data.length > 0 && components.length > 0) {
        const placeholder = components[0];
        children = data.map((row, idx) =>
          renderRow(
            placeholder,
            row,
            idx,
            gridOnChangeTriggers,
            props.rowKey,
            renderComponent,
            config,
            setData
          )
        );
      } else {
        children = components.map((child) => renderComponent(child));
      }
    } else if (comp_type === "Container" && components.length > 0) {
      // Container: Group children by row for flex layout
      const childRows = groupByRow(components);
      const sortedChildRowKeys = Object.keys(childRows).sort(
        (a, b) => parseInt(a) - parseInt(b)
      );

      children = sortedChildRowKeys.map((rowKey) => {
        const rowComponents = childRows[rowKey];
        const justifyContent = getRowAlignment(rowComponents);

        return (
          <div
            key={`container-row-${id}-${rowKey}`}
            style={{
              display: "flex",
              gap: "16px",
              width: "100%",
              justifyContent,
            }}
          >
            {rowComponents.map((child) => renderComponent(child))}
          </div>
        );
      });
    } else {
      children =
        textContent ||
        (components.length > 0
          ? components.map((child) => renderComponent(child))
          : props.label || props.title || null);
    }

    // Task 2: Replace hacky field population with controlled components
    if ((type === "input" || type === "textarea") && domProps.name) {
      domProps.value = formData[domProps.name] || "";
      domProps.onChange = (e) => {
        setFormData((prev) => ({
          ...prev,
          [domProps.name]: e.target.value,
        }));
      };
    }

    const flexPosition = getFlexPosition(position);
    const mergedStyle = { ...style, ...flexPosition };

    // For textarea with controlled value, children must be undefined
    if (type === "textarea") {
      children = undefined;
    }

    return React.createElement(
      htmlElement,
      {
        key: id,
        id: id,
        style: mergedStyle,
        ...domProps,
        ...finalEventHandlers,
      },
      children
    );
  };

  const containerStyle = {
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    height: "100%",
  };

  if (!templatesLoaded) {
    return <div style={{ padding: "20px" }}>Loading templates...</div>;
  }

  // Separate components by type: AppBar, Sidebar, Modal, Regular
  const { appBarComponent, sidebarComponent, modalComponents, regularComponents } =
    separateComponentsByType(config.components);

  // Group regular components by row
  const componentRows = groupByRow(regularComponents);
  const sortedRowKeys = Object.keys(componentRows).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  // Render main content area
  const renderMainContent = () => (
    <div className="direct-renderer" style={containerStyle}>
      {sortedRowKeys.map((rowKey) => {
        const rowComponents = componentRows[rowKey];
        const justifyContent = getRowAlignment(rowComponents);

        return (
          <div
            key={`row-${rowKey}`}
            style={{
              display: "flex",
              gap: "16px",
              width: "100%",
              justifyContent,
            }}
          >
            {rowComponents.map((component) => renderComponent(component))}
          </div>
        );
      })}
    </div>
  );

  // Render with app layout if AppBar or Sidebar exists
  const hasAppLayout = appBarComponent || sidebarComponent;

  return (
    <>
      {hasAppLayout ? (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          {appBarComponent && renderComponent(appBarComponent)}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {sidebarComponent && renderComponent(sidebarComponent)}
            <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
              {renderMainContent()}
            </div>
          </div>
        </div>
      ) : (
        renderMainContent()
      )}

      {modalComponents.map((modalComp) => {
        if (!openModals.has(modalComp.id)) return null;

        const modalTemplate = templates["Modal"];
        const modalStyle = {
          ...(modalTemplate?.style || {}),
          ...modalComp.override_styles,
        };

        return (
          <React.Fragment key={modalComp.id}>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => {
                const event = new CustomEvent("closeModal", {
                  detail: { modalId: modalComp.id },
                });
                window.dispatchEvent(event);
              }}
            >
              <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
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
