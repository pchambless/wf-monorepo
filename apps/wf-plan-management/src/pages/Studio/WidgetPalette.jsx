/**
 * Widget Palette Component
 * Compact categorized widget selection for Studio
 */

import React from "react";

export default function WidgetPalette({ onAddWidget, activeSection }) {
  const containerWidgets = [
    { type: "Container", icon: "📦", label: "Container" },
    { type: "Tabs", icon: "📑", label: "Tabs" },
    { type: "Card", icon: "🃏", label: "Card" },
    { type: "Panel", icon: "📄", label: "Panel" },
  ];

  const dataWidgets = [
    { type: "DataGrid", icon: "📊", label: "Grid" },
    { type: "Form", icon: "📝", label: "Form" },
    { type: "Select", icon: "🎛️", label: "Select" },
    { type: "Checkbox", icon: "☑️", label: "Checkbox" },
    { type: "TextArea", icon: "📄", label: "TextArea" },
    { type: "Text", icon: "📝", label: "Text" },
  ];

  const handleWidgetClick = (widget) => {
    const newWidget = {
      id: `${widget.type.toLowerCase()}-${Date.now()}`,
      type: widget.type,
      section: activeSection || "page",
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 },
      props: {
        title: widget.label,
      },
    };

    onAddWidget?.(newWidget);
  };

  const WidgetCategory = ({ title, widgets, icon }) => (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: "600",
          color: "#495057",
          marginBottom: "8px",
          paddingLeft: "4px",
          borderBottom: "1px solid #e9ecef",
          paddingBottom: "4px",
        }}
      >
        {icon} {title}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px",
        }}
      >
        {widgets.map((widget) => (
          <button
            key={widget.type}
            onClick={() => handleWidgetClick(widget)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "8px 4px",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              backgroundColor: "#fff",
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: "500",
              color: "#495057",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f8f9fa";
              e.target.style.borderColor = "#007bff";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fff";
              e.target.style.borderColor = "#dee2e6";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: "16px", marginBottom: "2px" }}>
              {widget.icon}
            </span>
            <span>{widget.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      style={{
        width: "200px",
        backgroundColor: "#fff",
        borderRight: "1px solid #dee2e6",
        padding: "12px",
        overflowY: "auto",
        height: "100%",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: "600",
          color: "#495057",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: "2px solid #007bff",
        }}
      >
        🎨 Widget Palette
      </div>

      <WidgetCategory
        title="Containers"
        icon="📦"
        widgets={containerWidgets}
      />

      <WidgetCategory
        title="Widgets"
        icon="🎛️"
        widgets={dataWidgets}
      />

      {activeSection && (
        <div
          style={{
            marginTop: "16px",
            padding: "8px",
            backgroundColor: "#e8f4f8",
            borderRadius: "4px",
            fontSize: "11px",
            color: "#495057",
            textAlign: "center",
          }}
        >
          Adding to: <strong>{activeSection}</strong>
        </div>
      )}
    </div>
  );
}