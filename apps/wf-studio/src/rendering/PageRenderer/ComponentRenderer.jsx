/**
 * ComponentRenderer - Clean modular component system
 *
 * Routes to CSS-driven component renderers with WorkflowEngine integration
 */

import React, { useEffect, useState } from "react";
import { workflowEngine } from "../WorkflowEngine/index.js";
import SelectRenderer from "./components/SelectRenderer.jsx";
import ColumnRenderer from "./components/ColumnRenderer.jsx";
import TabsRenderer from "./components/TabsRenderer.jsx";
import GridRenderer from "./components/GridRenderer.jsx";
import MermaidRenderer from "./components/MermaidRenderer.jsx";
import ButtonRenderer from "./components/ButtonRenderer.jsx";

const ComponentRenderer = ({ component }) => {
  const { type, id, title, props, components = [] } = component;
  const [componentData, setComponentData] = useState([]);

  console.log(`🔧 ComponentRenderer: Rendering component`, { type, id, title, component });


  // Unified data fetching function for onLoad, onRefresh, etc.
  const execFetchData = async (triggers, triggerType) => {
    console.log(`🔄 Executing ${triggerType} for ${id}:`, triggers);

    if (Array.isArray(triggers)) {
      for (const trigger of triggers) {
        if (typeof trigger === "string") {
          // Handle reload for chart/mermaid components specially
          if (trigger === "reload" && (component.type === "chart" || component.type === "mermaid")) {
            console.log(`🔄 ComponentRenderer: Triggering reload for ${component.type} component ${id}`);
            // Force MermaidRenderer to reload by calling global reload function
            if (window[`reload_${id}`]) {
              window[`reload_${id}`]();
            }
            return;
          }

          // Simple action: "execApps", "execPages" - capture returned data
          try {
            const result = await workflowEngine.execAction(trigger, { component });
            console.log(`📦 ${trigger} result:`, result);
            if (result && result.rows && Array.isArray(result.rows)) {
              setComponentData(result.rows);
            } else if (Array.isArray(result)) {
              setComponentData(result);
            } else if (typeof result === 'string') {
              // Handle string results (like mermaid content from getDoc)
              setComponentData(result);
            }
          } catch (error) {
            console.error(`Error executing ${trigger}:`, error);
          }
        } else if (trigger.action && trigger.targets) {
          // Action-target pattern
          workflowEngine.execTargetAction(trigger.action, trigger.targets, {
            component,
          });
        } else if (trigger.action) {
          // Direct function call pattern: {action: "studioApiCall('execApps', {})"}
          try {
            const result = await workflowEngine.execAction(trigger, { component });
            console.log(`📦 ${trigger.action} result:`, result);
            if (result && result.rows && Array.isArray(result.rows)) {
              setComponentData(result.rows);
            } else if (Array.isArray(result)) {
              setComponentData(result);
            } else if (typeof result === 'string') {
              // Handle string results (like mermaid content from getDoc)
              setComponentData(result);
            }
          } catch (error) {
            console.error(`Error executing ${trigger.action}:`, error);
          }
        }
      }
    }
  };

  // Register component with WorkflowEngine so refresh action can find it
  useEffect(() => {
    const componentWithFetchData = {
      ...component,
      execFetchData: (triggers) => execFetchData(triggers, 'onRefresh')
    };
    workflowEngine.registerComponent(id, componentWithFetchData);
    return () => workflowEngine.componentRefs.delete(id);
  }, [id, component]);

  // Execute component onLoad when it mounts
  useEffect(() => {
    if (component.workflowTriggers?.onLoad) {
      execFetchData(component.workflowTriggers.onLoad, 'onLoad');
    }
  }, [component, id]);

  // Universal event handler - routes all events to WorkflowEngine
  const handleEvent = (eventType, data) => {
    if (component.workflowTriggers?.[eventType]) {
      console.log(
        `🔄 Executing ${eventType} for ${id}:`,
        component.workflowTriggers[eventType]
      );

      const triggers = component.workflowTriggers[eventType];
      if (Array.isArray(triggers)) {
        triggers.forEach((trigger) => {
          if (typeof trigger === "string") {
            // Simple string action: "execApps"
            workflowEngine.execAction(trigger, { component, data });
          } else if (trigger.action) {
            // Complex action object: {"action": "setVal", "param": "appID"}
            workflowEngine.execAction(trigger, data);
          }
        });
      }
    }
  };

  // Clean component resolution - CSS-driven with minimal logic
  switch (type) {
    case "sidebar":
    case "column":
      return (
        <ColumnRenderer component={component}>
          {components.map((child, index) => (
            <ComponentRenderer key={child.id || index} component={child} />
          ))}
        </ColumnRenderer>
      );

    case "select":
      return <SelectRenderer component={component} data={componentData} onEvent={handleEvent} />;

    case "tabs":
      return (
        <TabsRenderer component={component} onEvent={handleEvent}>
          {components.map((child, index) => (
            <ComponentRenderer key={child.id || index} component={child} />
          ))}
        </TabsRenderer>
      );


    case "grid":
      return <GridRenderer component={component} onEvent={handleEvent} />;

    case "mermaid":
    case "chart":
      return <MermaidRenderer component={component} onEvent={handleEvent} />;

    case "button":
      return <ButtonRenderer component={component} onEvent={handleEvent} />;

    default:
      // Generic fallback for unknown component types
      return (
        <div
          style={{ padding: "16px", border: "1px dashed #ccc", margin: "8px" }}
        >
          <h4>{title || id}</h4>
          <p>
            <strong>Type:</strong> {type}
          </p>
          <p>
            <strong>ID:</strong> {id}
          </p>
          {/* Render child components if they exist */}
          {components.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <strong>Child Components:</strong>
              {components.map((child, index) => (
                <ComponentRenderer key={child.id || index} component={child} />
              ))}
            </div>
          )}
        </div>
      );
  }
};

export default ComponentRenderer;
