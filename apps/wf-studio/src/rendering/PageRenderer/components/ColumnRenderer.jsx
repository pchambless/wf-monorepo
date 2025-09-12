/**
 * ColumnRenderer - Universal column/sidebar component
 * 
 * Handles both "column" and "sidebar" types with CSS class differentiation
 */

import React from "react";

const ColumnRenderer = ({ component, children }) => {
  const { type, props } = component;
  
  // Build CSS classes based on component type
  const cssClasses = [
    "wf-column",
    type === "sidebar" ? "wf-sidebar" : "wf-standard"
  ].join(" ");

  return (
    <div className={cssClasses} style={props?.style}>
      {props?.title && (
        <h3 className="wf-title">{props.title}</h3>
      )}
      {children}
    </div>
  );
};

export default ColumnRenderer;