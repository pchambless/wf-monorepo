import React from "react";
import { createLogger } from "../../utils/logger.js";
import { getFlexPosition, getHtmlElement } from "./styleUtils.js";
import { buildEventHandlers } from "./eventHandlerBuilder.js";
import { renderTextComponent, isTextComponent } from "../renderers/TextRenderer.jsx";
import { renderAppBar, renderSidebar } from "../renderers/AppLayoutRenderer.jsx";
import { renderContainer } from "../renderers/ContainerRenderer.jsx";
import { renderRow, GridComponent } from "../renderers/GridRenderer.jsx";
import { FormComponent } from "../renderers/FormRenderer.jsx";
import { SelectComponent } from "../renderers/SelectRenderer.jsx";
import { selectFieldResolver } from "./FormDataResolver.js";

const log = createLogger('ComponentFactory', 'info');

/**
 * ComponentFactory - Centralized component creation with stable keys
 * 
 * Purpose: Extract component creation logic from PageRenderer to:
 * - Eliminate excessive re-rendering
 * - Provide stable component keys  
 * - Centralize component creation patterns
 */
export class ComponentFactory {
  constructor() {
    // Component key cache for stability
    this.keyCache = new Map();
  }

  /**
   * Generate stable key for a component
   * @param {Object} component - Component configuration
   * @param {string} parentFormId - Parent form ID context
   * @returns {string} Stable component key
   */
  generateStableKey(component, parentFormId = null) {
    const { comp_type, id, props = {} } = component;
    
    // Create a unique identifier for this component instance
    const componentSignature = `${comp_type}-${id}-${parentFormId || 'root'}`;
    
    // For select components, include query name to ensure cache invalidation
    if (comp_type === "select" && props.qryName) {
      return `${componentSignature}-${props.qryName}`;
    }
    
    return componentSignature;
  }

  /**
   * Create a component with stable key and proper routing
   * @param {Object} component - Component configuration
   * @param {Object} context - Rendering context
   * @param {string} parentFormId - Parent form ID
   * @returns {React.Element|null} Rendered component
   */
  createComponent(component, context, parentFormId = null) {
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

    const {
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
    } = context;

    log.debug(`ComponentFactory.createComponent: ${comp_type} "${id}"`);
    
    // Generate stable key for this component
    const stableKey = this.generateStableKey(component, parentFormId);
    
    // Track if this is a Form component to pass formId to children
    const currentFormId = comp_type === 'Form' ? id : parentFormId;

    // Handle visibility
    const visibilityKey = `${id}_visible`;
    if (contextStore[visibilityKey] === false) {
      log.debug(`Component ${id} hidden by visibility key`);
      return null;
    }

    // Route to appropriate renderer based on component type
    if (comp_type === "AppBar") {
      return renderAppBar(component, config, renderComponent);
    }

    if (comp_type === "Sidebar") {
      return renderSidebar(component, config, renderComponent);
    }

    if (comp_type === "Grid") {
      log.debug(`Rendering Grid component: ${id}`);
      return React.createElement(GridComponent, {
        key: stableKey,
        component,
        renderComponent,
        contextStore,
        config,
        setData
      });
    }

    if (comp_type === "Form") {
      log.info(`Rendering Form component: ${id}`);
      return React.createElement(FormComponent, {
        key: stableKey,
        component,
        renderComponent,
        contextStore,
        config,
        setData,
        eventTypeConfig
      });
    }

    if (comp_type === "select") {
      log.info(`🎯 ComponentFactory creating SELECT: ${id} with stable key: ${stableKey}`);
      const handleChange = (fieldName, value) => {
        log.debug(`Select ${id} onChange: ${fieldName} = ${value}`);
        setFormData((prev) => ({ ...prev, [fieldName]: value }));
      };
      
      return React.createElement(SelectComponent, {
        key: stableKey,
        component,
        contextStore,
        formData,
        onChange: handleChange,
        currentFormId,
        dataStore
      });
    }

    if (isTextComponent(comp_type)) {
      log.debug(`Rendering as text component: ${comp_type} "${id}"`);
      return renderTextComponent(component, getHtmlElement, buildEventHandlers, {
        pageConfig: config,
        setData,
        contextStore,
        formData,
        dataStore
      });
    }

    if (comp_type && customComponents[comp_type]) {
      log.debug(`Rendering as custom component: ${comp_type} "${id}"`);
      const CustomComponent = customComponents[comp_type];
      return React.createElement(CustomComponent, {
        key: stableKey,
        id,
        ...props
      });
    }

    // Create standard HTML element
    return this.createHtmlElement(component, context, parentFormId, stableKey);
  }

  /**
   * Create standard HTML element with proper children and event handlers
   * @param {Object} component - Component configuration
   * @param {Object} context - Rendering context
   * @param {string} parentFormId - Parent form ID
   * @param {string} stableKey - Pre-generated stable key
   * @returns {React.Element} Rendered HTML element
   */
  createHtmlElement(component, context, parentFormId, stableKey) {
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

    const {
      config,
      eventTypeConfig,
      contextStore,
      formData,
      dataStore,
      setData,
      setFormData,
      findComponentById,
      selectedRows,
      setSelectedRows,
      renderComponent
    } = context;

    // Track if this is a Form component to pass formId to children
    const currentFormId = comp_type === 'Form' ? id : parentFormId;

    // Apply eventType styles from database, then override with component styles
    const eventTypeStyles = eventTypeConfig[comp_type]?.styles || {};
    const style = {
      ...eventTypeStyles,
      ...override_styles,
      ...legacyStyle,
    };

    const type = (comp_type || legacyType || "div").toLowerCase();
    log.debug(`ComponentFactory creating HTML element: ${comp_type} → "${type}" (id="${id}")`);
    
    const htmlElement = getHtmlElement(type);
    const eventHandlers = buildEventHandlers(
      workflowTriggers,
      config,
      setData,
      contextStore,
      setFormData
    );

    // Extract props for DOM (remove non-DOM props)
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

    // Generate children based on component type and data
    const children = this.generateChildren(component, context, currentFormId);

    // Handle input fields with form data binding using SelectFieldResolver LUOW
    if ((type === "input" || type === "textarea") && domProps.name) {
      // Use standardized field value resolution from SelectFieldResolver LUOW
      const resolvedValue = selectFieldResolver.resolveValue(
        domProps.name,
        formData,
        dataStore,
        contextStore,
        currentFormId,
        null // contextKey not used for input fields
      );
      
      log.debug(`Input ${domProps.name}: resolved value = ${resolvedValue}`);
      
      domProps.value = resolvedValue;
      domProps.onChange = (e) => {
        setFormData((prev) => ({
          ...prev,
          [domProps.name]: e.target.value,
        }));
      };
    }

    const flexPosition = getFlexPosition(position);
    const mergedStyle = { ...style, ...flexPosition };

    // Clear children for textarea to prevent conflicts
    const finalChildren = type === "textarea" ? undefined : children;

    return React.createElement(
      htmlElement,
      {
        key: stableKey,
        id: id,
        style: mergedStyle,
        ...domProps,
        ...finalEventHandlers,
      },
      finalChildren
    );
  }

  /**
   * Generate children for a component
   * @param {Object} component - Component configuration
   * @param {Object} context - Rendering context
   * @param {string} currentFormId - Current form ID
   * @returns {React.Element[]|string|null} Generated children
   */
  generateChildren(component, context, currentFormId) {
    const {
      comp_type,
      type: legacyType,
      id,
      props = {},
      components = [],
      textContent,
    } = component;

    const {
      config,
      eventTypeConfig,
      dataStore,
      setData,
      findComponentById,
      selectedRows,
      setSelectedRows,
      renderComponent
    } = context;

    const type = (comp_type || legacyType || "div").toLowerCase();

    // Handle table body with data source
    if (type === "tbody" && props.dataSource) {
      return this.generateTableRows(component, context, currentFormId);
    }
    
    // Handle Container and Form components
    if ((comp_type === "Container" || comp_type === "Form") && components.length > 0) {
      return renderContainer(component, (child) => renderComponent(child, currentFormId));
    }

    // Handle regular components with children or text content
    if (textContent) {
      return textContent;
    }

    if (components.length > 0) {
      return components.map((child) => renderComponent(child, currentFormId));
    }

    // Fallback to props
    return props.label || props.title || null;
  }

  /**
   * Generate table rows for data-driven components
   * @param {Object} component - Component configuration
   * @param {Object} context - Rendering context
   * @param {string} currentFormId - Current form ID
   * @returns {React.Element[]} Generated table rows
   */
  generateTableRows(component, context, currentFormId) {
    const { props = {}, components = [] } = component;
    const {
      config,
      eventTypeConfig,
      dataStore,
      setData,
      findComponentById,
      selectedRows,
      setSelectedRows,
      renderComponent
    } = context;

    const gridId = props.dataSource;
    const data = dataStore[gridId];

    if (!data || data.length === 0 || components.length === 0) {
      return components.map((child) => renderComponent(child, currentFormId));
    }

    const gridComponent = findComponentById(gridId);
    const gridOnChangeTriggers = gridComponent?.workflowTriggers?.onChange;

    let rowActions = gridComponent?.props?.rowActions;
    if (typeof rowActions === 'string') {
      try {
        rowActions = JSON.parse(rowActions);
      } catch (e) {
        log.warn('Failed to parse rowActions:', e);
        rowActions = null;
      }
    }

    const gridProps = gridComponent?.props;
    const placeholder = components[0];

    return data.map((row, idx) =>
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
  }

  /**
   * Clear cache for component keys (useful for debugging or memory management)
   */
  clearKeyCache() {
    this.keyCache.clear();
    log.info('ComponentFactory key cache cleared');
  }
}

// Export singleton instance
export const componentFactory = new ComponentFactory();