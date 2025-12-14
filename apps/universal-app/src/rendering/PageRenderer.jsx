import React from "react";
import { triggerEngine } from "./WorkflowEngine/TriggerEngine.js";
import { useModalManager } from "./hooks/useModalManager.js";
import { createLogger } from "../utils/logger.js";
import { componentFactory } from "./utils/ComponentFactory.js";

const log = createLogger('PageRenderer', 'info');

import { groupByRow, getRowAlignment, separateComponentsByType } from "./utils/layoutUtils.js";
import { renderModal } from "./renderers/ModalRenderer.jsx";

const PageRenderer = ({ config, eventTypeConfig = {}, customComponents = {} }) => {
  if (!config) {
    return <div>No config provided</div>;
  }

  const [dataStore, setDataStore] = React.useState({});
  const [selectedRows, setSelectedRows] = React.useState({});
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
    const executeOnLoad = async () => {
      const context = {
        pageConfig: config,
        setData,
        setFormData,
        contextStore: contextStore,
      };

      // Execute page-level onLoad triggers
      if (config.workflowTriggers?.onLoad) {
        await triggerEngine.executeTriggers(config.workflowTriggers.onLoad, context);
      }

      // Execute Container component's onLoad triggers
      const containerComponent = config.components?.find(c => c.comp_type === 'Container');
      if (containerComponent?.workflowTriggers?.onLoad) {
        log.info('Executing Container onLoad triggers');
        await triggerEngine.executeTriggers(containerComponent.workflowTriggers.onLoad, context);
      }
    };

    executeOnLoad();
  }, [config, setData, setFormData, contextStore]);

  const renderComponent = React.useCallback((component, parentFormId = null) => {
    log.debug(`renderComponent: ${component.comp_type} "${component.id}"`);
    
    // Special logging for select components and their parents
    if (component.comp_type === "select" || component.components?.some(c => c.comp_type === "select")) {
      log.info(`🎯 Component ${component.comp_type} "${component.id}" has select children or is select:`, {
        comp_type: component.comp_type,
        hasSelectChildren: component.components?.some(c => c.comp_type === "select"),
        childrenTypes: component.components?.map(c => c.comp_type),
        props: Object.keys(component.props || {})
      });
    }

    // Create rendering context with the current renderComponent function
    const renderingContext = {
      config,
      eventTypeConfig,
      customComponents,
      contextStore,
      formData,
      dataStore,
      setData,
      setFormData,
      findComponentById,
      selectedRows,
      setSelectedRows,
      renderComponent
    };

    return componentFactory.createComponent(component, renderingContext, parentFormId);
  }, [config, eventTypeConfig, customComponents, contextStore, formData, dataStore, setData, setFormData, findComponentById, selectedRows, setSelectedRows]);

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
        renderModal(modalComp, openModals, renderComponent, eventTypeConfig)
      )}
    </>
  );
};

export default PageRenderer;
