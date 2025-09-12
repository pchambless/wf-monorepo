/**
 * LayoutRenderer - Pure layout processor
 *
 * Builds layout structure from pageConfig with no business logic
 */

import React from "react";
import ComponentRenderer from "./ComponentRenderer.jsx";

const LayoutRenderer = ({ config }) => {
  const { layout, components = [] } = config;

  // Create layout container styles based on layout type
  const containerStyle = getLayoutContainerStyle(layout);

  return (
    <div style={containerStyle}>
      {components.map((component, index) => (
        <ComponentWrapper key={component.id || index} component={component}>
          <ComponentRenderer component={component} />
        </ComponentWrapper>
      ))}
    </div>
  );
};

/**
 * Component Wrapper - applies positioning and sizing from config
 */
const ComponentWrapper = ({ component, children }) => {
  const style = {
    width: component.width,
    flex: component.flex,
    backgroundColor: component.props?.style?.backgroundColor,
    borderRight: component.props?.style?.borderRight,
    padding: component.props?.style?.padding,
    overflow: component.props?.style?.overflow || "auto",
  };

  return <div style={style}>{children}</div>;
};

/**
 * Get layout container styles based on layout type
 */
const getLayoutContainerStyle = (layout) => {
  switch (layout) {
    case "flex":
    case "three-column":
      return {
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      };

    case "two-column":
      return {
        display: "flex",
        height: "100vh",
      };

    case "grid":
      return {
        display: "grid",
        height: "100vh",
      };

    default:
      return {
        display: "flex",
        height: "100vh",
      };
  }
};

export default LayoutRenderer;
