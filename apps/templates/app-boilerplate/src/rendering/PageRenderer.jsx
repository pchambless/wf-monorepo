import React from "react";
import { triggerEngine } from "./WorkflowEngine/TriggerEngine.js";
import { useModalManager } from "./hooks/useModalManager.js";

import { getFlexPosition, getHtmlElement } from "./utils/styleUtils.js";
import { buildEventHandlers } from "./utils/eventHandlerBuilder.js";
import { groupByRow, getRowAlignment, separateComponentsByType } from "./utils/layoutUtils.js";
import { renderTextComponent, isTextComponent } from "./renderers/TextRenderer.js";
import { renderAppBar, renderSidebar } from "./renderers/AppLayoutRenderer.js";
import { renderModal } from "./renderers/ModalRenderer.js";
import { renderContainer } from "./renderers/ContainerRenderer.js";
import { renderRow } from "./renderers/GridRenderer.js";

const PageRenderer = ({ config, customComponents = {} }) => {
  if (!config) {
    return <div>No config provided</div>;
  }

  const [dataStore, setDataStore] = React.useState({});
  const { openModals } = useModalManager();

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

  const [contextStore, setContextStore] = React.useState({});
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

    const visibilityKey = `${id}_visible`;
    if (contextStore[visibilityKey] === false) {
      return null;
    }

    if (comp_type === "AppBar") {
      return renderAppBar(component, config, renderComponent);
    }

    if (comp_type === "Sidebar") {
      return renderSidebar(component, config, renderComponent);
    }

    if (isTextComponent(comp_type)) {
      return renderTextComponent(component, getHtmlElement, buildEventHandlers, {
        pageConfig: config,
        setData,
        contextStore,
        formData,
        dataStore
      });
    }

    if (comp_type && customComponents[comp_type]) {
      const CustomComponent = customComponents[comp_type];
      return <CustomComponent key={id} id={id} {...props} />;
    }

    // Styles come from pageConfig - no template loading needed
    const style = {
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
      const rowActions = gridComponent?.props?.rowActions;
      const gridProps = gridComponent?.props;

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
            setData,
            rowActions,
            gridProps
          )
        );
      } else {
        children = components.map((child) => renderComponent(child));
      }
    } else if (comp_type === "Container" && components.length > 0) {
      children = renderContainer(component, renderComponent);
    } else {
      children =
        textContent ||
        (components.length > 0
          ? components.map((child) => renderComponent(child))
          : props.label || props.title || null);
    }

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

  const { appBarComponent, sidebarComponent, modalComponents, regularComponents } =
    separateComponentsByType(config.components);

  const componentRows = groupByRow(regularComponents);
  const sortedRowKeys = Object.keys(componentRows).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  const renderMainContent = () => (
    <div className="page-renderer" style={containerStyle}>
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

      {modalComponents.map((modalComp) =>
        renderModal(modalComp, openModals, renderComponent)
      )}
    </>
  );
};

export default PageRenderer;
