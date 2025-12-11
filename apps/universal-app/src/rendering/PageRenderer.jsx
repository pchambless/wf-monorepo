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
import { FormComponent } from "./renderers/FormRenderer.js";

const renderGrid = (component, dataStore, setData, config, eventHandlers, renderComponent) => {
  const { id, props = {}, workflowTriggers } = component;

  // Parse columns and columnOverrides
  let columns = [];
  let columnOverrides = {};
  let rowActions = [];

  try {
    columns = typeof props.columns === 'string' ? JSON.parse(props.columns) : (props.columns || []);
    columnOverrides = typeof props.columnOverrides === 'string' ? JSON.parse(props.columnOverrides) : (props.columnOverrides || {});
    rowActions = typeof props.rowActions === 'string' ? JSON.parse(props.rowActions) : (props.rowActions || []);
  } catch (e) {
    console.error('Failed to parse Grid props:', e);
  }

  // Get data for this grid
  const gridData = dataStore[id] || [];

  // Track selected row
  const [selectedRowId, setSelectedRowId] = React.useState(null);
  
  // Filter visible columns
  const visibleColumns = columns.filter(col => !columnOverrides[col.name]?.hidden);
  
  // Execute onRefresh triggers when component mounts
  React.useEffect(() => {
    if (workflowTriggers?.onRefresh) {
      const context = {
        pageConfig: config,
        setData,
        componentId: id
      };
      triggerEngine.executeTriggers(workflowTriggers.onRefresh, context);
    }
  }, [id]);

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #e1e4e8',
    backgroundColor: '#fff'
  };

  const headerStyle = {
    backgroundColor: '#f6f8fa',
    padding: '8px 12px',
    borderBottom: '1px solid #e1e4e8',
    textAlign: 'left',
    fontWeight: '600'
  };

  const cellStyle = {
    padding: '8px 12px',
    borderBottom: '1px solid #e1e4e8'
  };

  return (
    <div key={id} style={{ width: '100%' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {visibleColumns.map(col => (
              <th key={col.name} style={headerStyle}>
                {columnOverrides[col.name]?.label || col.name}
              </th>
            ))}
            {props.rowActions && <th style={headerStyle}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {gridData.length > 0 ? (
            gridData.map((row, idx) => {
              const rowId = row[props.tableID || 'id'];
              const isSelected = selectedRowId === rowId;

              return (
                <tr
                  key={idx}
                  onClick={async () => {
                    console.log(`🎯 Row clicked: ${rowId}`, row);
                    setSelectedRowId(rowId);

                    // Execute onChange triggers
                    if (workflowTriggers?.onChange) {
                      const context = {
                        pageConfig: config,
                        setData,
                        componentId: id,
                        selected: row,
                        rowData: row
                      };
                      await triggerEngine.executeTriggers(workflowTriggers.onChange, context);
                    }
                  }}
                  style={{
                    backgroundColor: isSelected ? '#e3f2fd' : (idx % 2 === 0 ? '#fff' : '#f9f9f9'),
                    cursor: 'pointer'
                  }}
                >
                  {visibleColumns.map(col => (
                    <td key={col.name} style={cellStyle}>
                      {row[col.name]}
                    </td>
                  ))}
                  {rowActions.length > 0 && (
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {rowActions.map((action) => (
                          <button
                            key={action.id}
                            title={action.tooltip}
                            onClick={async (e) => {
                              e.stopPropagation();

                              if (action.confirmMessage) {
                                if (!window.confirm(action.confirmMessage)) {
                                  return;
                                }
                              }

                              console.log(`🔘 Action clicked: ${action.id}`, row);

                              const context = {
                                pageConfig: config,
                                setData,
                                componentId: id,
                                rowData: row,
                                row: row
                              };

                              if (action.trigger) {
                                const triggers = Array.isArray(action.trigger) ? action.trigger : [action.trigger];
                                await triggerEngine.executeTriggers(triggers, context);

                                if (action.onSuccess) {
                                  await triggerEngine.executeTriggers(action.onSuccess, context);
                                }
                              }
                            }}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              backgroundColor: action.color === 'error' ? '#dc3545' : '#007bff',
                              color: '#fff'
                            }}
                          >
                            {action.icon || action.label || action.id}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={visibleColumns.length + (props.rowActions ? 1 : 0)} style={{ ...cellStyle, textAlign: 'center', color: '#666' }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

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
        console.log('🔄 Executing Container onLoad triggers');
        await triggerEngine.executeTriggers(containerComponent.workflowTriggers.onLoad, context);
      }
    };

    executeOnLoad();
  }, [config, setData, setFormData, contextStore]);

  const renderComponent = (component, parentFormId = null) => {
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

    // Track if this is a Form component to pass formId to children
    const currentFormId = comp_type === 'Form' ? id : parentFormId;

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

    // Apply eventType styles from database, then override with component styles
    const eventTypeStyles = eventTypeConfig[comp_type]?.styles || {};

    const style = {
      ...eventTypeStyles,
      ...override_styles,
      ...legacyStyle,
    };

    const type = (comp_type || legacyType || "div").toLowerCase();
    const htmlElement = getHtmlElement(type);
    const eventHandlers = buildEventHandlers(
      workflowTriggers,
      config,
      setData,
      contextStore,
      setFormData
    );

    if (comp_type === "Grid") {
      return renderGrid(component, dataStore, setData, config, eventHandlers, renderComponent);
    }

    if (comp_type === "Form") {
      return <FormComponent
        key={id}
        component={component}
        renderComponent={renderComponent}
        contextStore={contextStore}
        config={config}
        setData={setData}
      />;
    }

    const {
      workflowTriggers: _wt,
      components: _c,
      textContent: _tc,
      dataSource: _ds,
      rowKey: _rk,
      selectable: _sel,
      columns: _cols,
      rowActions: _ra,
      columnOverrides: _co,
      _onClick,
      ...domProps
    } = props;

    const finalEventHandlers = {
      ...eventHandlers,
      ...(_onClick && { onClick: _onClick }),
    };

    let children;
    // Input and textarea elements cannot have children
    const isVoidElement = type === "input" || comp_type === "input";

    if (isVoidElement) {
      children = null;
    } else if (type === "tbody" && props.dataSource) {
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
            gridProps,
            selectedRows[gridId],
            (rowId) => setSelectedRows(prev => ({ ...prev, [gridId]: rowId })),
            eventTypeConfig.Grid?.config?.expansionStyles
          )
        );
      } else {
        children = components.map((child) => renderComponent(child, currentFormId));
      }
    } else if ((comp_type === "Container" || comp_type === "Form") && components.length > 0) {
      children = renderContainer(component, (child) => renderComponent(child, currentFormId));
    } else {
      children =
        textContent ||
        (components.length > 0
          ? components.map((child) => renderComponent(child, currentFormId))
          : props.label || props.title || null);
    }

    if ((type === "input" || type === "textarea") && domProps.name) {
      // Unified data architecture: All components read from dataStore
      // Priority: user edits (formData) > loaded data (dataStore[currentFormId]) > empty
      const loadedValue = currentFormId && dataStore[currentFormId] 
        ? (Array.isArray(dataStore[currentFormId]) ? dataStore[currentFormId][0]?.[domProps.name] : dataStore[currentFormId]?.[domProps.name])
        : undefined;
      
      console.log(`📝 Input ${domProps.name}: currentFormId=${currentFormId}, formData=${formData[domProps.name]}, loadedValue=${loadedValue}, dataStore[${currentFormId}]=`, dataStore[currentFormId]);
      
      domProps.value = formData[domProps.name] ?? loadedValue ?? "";
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
        renderModal(modalComp, openModals, renderComponent, eventTypeConfig)
      )}
    </>
  );
};

export default PageRenderer;
