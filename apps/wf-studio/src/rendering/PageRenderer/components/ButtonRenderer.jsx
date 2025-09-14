/**
 * ButtonRenderer - Universal button component for all apps
 * Will eventually move to shared-imports for cross-app usage
 */

import React from "react";

const ButtonRenderer = ({ component, onEvent }) => {
  const { id, title, props = {} } = component;
  
  const {
    label = title || id,
    variant = "primary",
    size = "medium",
    disabled = false,
    style = {}
  } = props;

  const handleClick = () => {
    console.log(`🔄 Button ${id} clicked`);
    onEvent("onClick", { componentId: id });
  };

  // Universal button styling that works across all apps
  const getButtonStyle = () => {
    const baseStyle = {
      padding: size === "small" ? "6px 12px" : size === "large" ? "14px 28px" : "10px 20px",
      fontSize: size === "small" ? "12px" : size === "large" ? "16px" : "14px",
      fontWeight: "500",
      border: "none",
      borderRadius: "4px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      transition: "all 0.2s ease"
    };

    // Universal color scheme
    const colors = {
      primary: { bg: "#007bff", hover: "#0056b3" },
      secondary: { bg: "#6c757d", hover: "#5a6268" },
      success: { bg: "#28a745", hover: "#218838" },
      danger: { bg: "#dc3545", hover: "#c82333" },
      warning: { bg: "#ffc107", hover: "#e0a800", color: "#212529" }
    };

    const colorScheme = colors[variant] || colors.primary;

    return {
      ...baseStyle,
      backgroundColor: colorScheme.bg,
      color: colorScheme.color || "white",
      ...style
    };
  };

  return (
    <button
      style={getButtonStyle()}
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default ButtonRenderer;