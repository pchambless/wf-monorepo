/**
 * appLayoutRenderer - Vanilla React renderers for AppBar and Sidebar
 *
 * Provides config-driven rendering of app-level layout components
 * Supports {appName} placeholder substitution
 */

import React from "react";

export const substituteAppName = (value, appName = "Studio") => {
  if (typeof value === "string") {
    return value.replace(/{appName}/g, appName);
  }
  return value;
};

export const renderAppBar = (component, config, renderComponent) => {
  const { id, props = {}, override_styles = {}, components = [] } = component;

  const appName = config.appName || "Studio";
  const title = substituteAppName(props.title || component.title || appName, appName);
  const showMenu = props.showMenu !== false;

  const defaultStyle = {
    display: "flex",
    alignItems: "center",
    height: "64px",
    padding: "0 16px",
    backgroundColor: "#1976d2",
    color: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    zIndex: 1000,
  };

  const style = { ...defaultStyle, ...override_styles };

  return (
    <div key={id} id={id} style={style}>
      {showMenu && (
        <button
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
            marginRight: "16px",
          }}
          aria-label="menu"
        >
          ☰
        </button>
      )}
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>{title}</div>
      <div style={{ flexGrow: 1 }} />
      {components.map((child) => renderComponent(child))}
    </div>
  );
};

export const renderSidebar = (component, config, renderComponent) => {
  const { id, props = {}, override_styles = {}, components = [] } = component;

  const defaultStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    height: "100%",
    width: "240px",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRight: "1px solid #dee2e6",
    overflow: "auto",
  };

  const style = { ...defaultStyle, ...override_styles };
  const appName = config.appName || "Studio";
  const title = substituteAppName(props.title || component.title || "Navigation", appName);

  return (
    <div key={id} id={id} style={style}>
      <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {components.map((child) => renderComponent(child))}
      </div>
    </div>
  );
};
