/**
 * PropRenderer - Handles simple prop-driven components
 *
 * Building block for components that are purely configuration-driven:
 * - textLine: dynamic text with contextStore integration
 * - button: styled buttons with click handlers
 * - spacer: spacing elements
 * - divider: horizontal rules
 */

import React from "react";
import { workflowEngine } from "../../WorkflowEngine/index.js";
import "../../../styles/components/textline.css";

const PropRenderer = ({ component, onEvent }) => {
  const { type, props = {} } = component;

  switch (type) {
    case "textLine":
      const { prefix = "", contextKey, text = "", size = "medium", color, align = "left" } = props;
      let displayText = text;

      // If contextKey provided, get dynamic value from contextStore
      if (contextKey) {
        const contextStore = workflowEngine?.contextStore;
        if (contextStore) {
          const contextValue = contextStore.getVal(contextKey);
          const dynamicValue = contextValue && contextValue[1] ? contextValue[1] : '';
          displayText = prefix + dynamicValue;
        }
      }

      // Build CSS classes
      const textClasses = [
        'wf-text-line',
        `wf-text-${size}`,
        `wf-text-${align}`
      ];

      // Add color class if it's a predefined color
      if (color && ['primary', 'secondary', 'success', 'warning', 'error'].includes(color)) {
        textClasses.push(`wf-text-${color}`);
      }

      // Add special styling class if specified
      if (props.variant === 'selected-component') {
        textClasses.push('wf-text-selected-component');
      }

      const style = {};
      // Add custom color if not predefined
      if (color && !['primary', 'secondary', 'success', 'warning', 'error'].includes(color)) {
        style.color = color;
      }

      return (
        <div
          className={textClasses.join(' ')}
          style={{...style, ...props.style}}
        >
          {displayText}
        </div>
      );

    case "spacer":
      const { height = "16px", width = "auto" } = props;
      return <div style={{ height, width, ...props.style }} />;

    case "divider":
      return (
        <hr style={{
          border: "none",
          borderTop: "1px solid #e5e5e5",
          margin: "16px 0",
          ...props.style
        }} />
      );

    default:
      return (
        <div style={{ padding: "8px", border: "1px dashed #f00", color: "#f00" }}>
          PropRenderer: Unknown type "{type}"
        </div>
      );
  }
};

export default PropRenderer;