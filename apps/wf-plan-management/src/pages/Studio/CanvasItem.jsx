const widgetPreviews = {
  // Universal Components - adapt to section context
  Icon: {
    icon: "🎨",
    preview: "🏢",
    sectionPreviews: {
      appbar: "🏢 WhatsFresh",
      sidebar: "📊 Dashboard",
      page: "✅ Status",
    },
  },
  Text: {
    icon: "📝",
    preview: "Sample Text",
    sectionPreviews: {
      appbar: "Plan Management",
      sidebar: "Navigation",
      page: "Content Title",
    },
  },
  Button: {
    icon: "🔘",
    preview: "[ Button ]",
    sectionPreviews: {
      appbar: "[ Logout ]",
      sidebar: "[ Menu ]",
      page: "[ Save Plan ]",
    },
  },
  Select: {
    icon: "📋",
    preview: "Select ▼",
    sectionPreviews: {
      appbar: "User ▼",
      sidebar: "Filter ▼",
      page: "Plan Status ▼",
    },
  },
  Link: {
    icon: "🔗",
    preview: "Link Text",
    sectionPreviews: {
      appbar: "Help",
      sidebar: "📄 Dashboard",
      page: "View Details",
    },
  },
  Divider: {
    icon: "➖",
    preview: "─────────",
    sectionPreviews: {
      appbar: "│",
      sidebar: "─────────",
      page: "─────────────",
    },
  },
  Container: {
    icon: "📦",
    preview: "[ Container ]",
    sectionPreviews: {
      appbar: "[ Header Group ]",
      sidebar: "[ Nav Group ]",
      page: "[ Content Section ]",
    },
  },

  // AppBar Specialized Components
  AppLogo: { icon: "🏢", preview: "🏢 WhatsFresh" },
  PageTitle: { icon: "📋", preview: "Plan Management" },
  UserProfile: { icon: "👤", preview: "👤 John Doe ▼" },
  Notifications: { icon: "🔔", preview: "🔔 3" },
  Search: { icon: "🔍", preview: "🔍 Search..." },

  // Sidebar Specialized Components
  NavSection: { icon: "📂", preview: "PLAN MANAGEMENT" },
  NavMenu: { icon: "📋", preview: "📁 Plans ▼\n  📄 Active\n  📄 Completed" },
  NavItem: { icon: "📄", preview: "📄 Dashboard" },

  // Page Specialized Components
  DataGrid: {
    icon: "📊",
    preview: "ID | Name | Status\n1 | Plan A | Active\n2 | Plan B | Draft",
  },
  Form: { icon: "📝", preview: "Name: [_______]\nStatus: [▼]\n[ Save ]" },
  Tab: { icon: "📄", preview: "Tab Content" },
  Tabs: { icon: "📑", preview: "Details | Communications | Impacts" },
  TabContainer: {
    icon: "📑",
    preview:
      "┌ [Details] [Comms] [Impacts] ┐\n│ Active tab content here... │\n└───────────────────────────┘",
  },
  Card: {
    icon: "🃏",
    preview: "┌─ Card Title ─┐\n│ Card content │\n└──────────────┘",
  },
  Modal: {
    icon: "🪟",
    preview:
      "┌─ Modal Title ─┐\n│ Modal content │\n│ [ OK ] [Cancel] │\n└───────────────┘",
  },
};

export default function CanvasItem({
  id,
  type,
  section,
  bindings,
  position = { x: 0, y: 0 },
  size = { width: 120, height: 60 },
  onSelect,
  onMove,
  onResize,
  isSelected,
  showGrid = false,
}) {
  const widget = widgetPreviews[type] || { icon: "❓", preview: type };

  // Use section-specific preview if available (for universal components)
  const preview = widget.sectionPreviews?.[section] || widget.preview;

  // Determine if this is a universal component
  const isUniversal = widget.sectionPreviews !== undefined;

  // Generate component characteristics based on type and section
  const getComponentCharacteristics = () => {
    const baseCharacteristics = {
      id,
      type,
      section,
      isUniversal,
      position,
    };

    // Add type-specific characteristics that would generate eventTypes
    switch (type) {
      case "DataGrid":
        return {
          ...baseCharacteristics,
          eventType: `gridPlans`,
          category: "grid",
          dbTable: "api_wf.plans",
          qrySQL:
            "SELECT id, name, status FROM api_wf.plans WHERE status = :planStatus ORDER BY id DESC",
          params: [":planStatus"],
          workflows: ["createPlan", "updatePlan"],
          navChildren: ["formPlan"],
          selWidget: "SelPlan",
          method: "GET",
          primaryKey: "id",
        };
      case "Form":
        return {
          ...baseCharacteristics,
          eventType: `formPlan`,
          category: "form",
          dbTable: "api_wf.plans",
          qrySQL: "SELECT * FROM api_wf.plans WHERE id = :planId",
          params: [":planId"],
          workflows: ["createPlan", "updatePlan", "deletePlan"],
          primaryKey: "id",
        };
      case "Tabs":
        return {
          ...baseCharacteristics,
          eventType: `tabPlan`,
          category: "tab",
          navChildren: ["formPlan", "gridPlanComms", "gridPlanImpacts"],
          title: "Plan Details",
        };
      case "Select":
        return {
          ...baseCharacteristics,
          eventType: `selectPlanStatus`,
          category: "select",
          method: "CONFIG",
          configKey: "planStatuses",
          selWidget: "SelPlanStatus",
        };
      case "NavSection":
        return {
          ...baseCharacteristics,
          eventType: `navPlanSection`,
          category: "navigation",
          title: "PLAN MANAGEMENT",
          navChildren: ["navPlanItem", "navPlanCommsItem"],
        };
      case "PageTitle":
        return {
          ...baseCharacteristics,
          eventType: `pagePlanManager`,
          category: "page",
          title: "Plan Management",
          routePath: "/plan-manager",
          navChildren: [
            "selectPlanStatus",
            "tabPlan",
            "tabPlanComms",
            "tabPlanImpacts",
          ],
        };
      default:
        return {
          ...baseCharacteristics,
          eventType: `${section}${type}`,
          category: section === "page" ? "component" : section,
          title: `${type} Component`,
        };
    }
  };

  const characteristics = getComponentCharacteristics();

  // Get appropriate size for section
  const getComponentSize = () => {
    const baseSize = {
      cursor: section === "page" ? "move" : "pointer",
      display: section === "appbar" ? "inline-flex" : "block",
      alignItems: section === "appbar" ? "center" : "stretch",
    };

    switch (section) {
      case "appbar":
        return {
          ...baseSize,
          width: "auto",
          height: "28px",
          minWidth: "60px",
          maxWidth: "180px",
          fontSize: "12px",
          padding: "4px 8px",
        };
      case "sidebar":
        return {
          ...baseSize,
          width: "100%",
          height: "auto",
          minHeight: "20px",
          maxHeight: isSelected ? "auto" : "40px",
          fontSize: "11px",
          padding: "3px 6px",
          marginBottom: "2px",
        };
      case "page":
        return {
          ...baseSize,
          width: "auto",
          height: "auto",
          minWidth: "100px",
          minHeight: isSelected ? "auto" : "30px",
          fontSize: "12px",
          padding: "6px 10px",
        };
      default:
        return baseSize;
    }
  };

  const componentSize = getComponentSize();

  // Snap to grid helper function
  const snapToGrid = (value, gridSize = 20) => {
    if (!showGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  // Handle drag start
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag during move (only for page section)
  const handleDrag = (e) => {
    if (section !== "page" || !onMove) return;
    if (e.clientX === 0 && e.clientY === 0) return; // Ignore drag end event

    const rect = e.target.closest(".section-content").getBoundingClientRect();
    let newX = Math.max(
      0,
      Math.min(rect.width - (size.width || 120), e.clientX - rect.left - 50)
    );
    let newY = Math.max(
      0,
      Math.min(rect.height - (size.height || 60), e.clientY - rect.top - 20)
    );

    // Snap to grid if enabled
    newX = snapToGrid(newX);
    newY = snapToGrid(newY);

    onMove(id, { x: newX, y: newY });
  };

  // Handle resize
  const handleResize = (e, direction) => {
    if (section !== "page" || !onResize) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width || 120;
    const startHeight = size.height || 60;
    const startPosX = position.x;
    const startPosY = position.y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      console.log("📏 Mouse move:", { deltaX, deltaY, direction });

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      // Calculate new dimensions and position based on resize direction
      switch (direction) {
        case "se": // Southeast
          newWidth = Math.max(80, startWidth + deltaX);
          newHeight = Math.max(40, startHeight + deltaY);
          break;
        case "sw": // Southwest
          newWidth = Math.max(80, startWidth - deltaX);
          newHeight = Math.max(40, startHeight + deltaY);
          newX = startPosX + (startWidth - newWidth);
          break;
        case "ne": // Northeast
          newWidth = Math.max(80, startWidth + deltaX);
          newHeight = Math.max(40, startHeight - deltaY);
          newY = startPosY + (startHeight - newHeight);
          break;
        case "nw": // Northwest
          newWidth = Math.max(80, startWidth - deltaX);
          newHeight = Math.max(40, startHeight - deltaY);
          newX = startPosX + (startWidth - newWidth);
          newY = startPosY + (startHeight - newHeight);
          break;
        case "e": // East
          newWidth = Math.max(80, startWidth + deltaX);
          break;
        case "w": // West
          newWidth = Math.max(80, startWidth - deltaX);
          newX = startPosX + (startWidth - newWidth);
          break;
        case "n": // North
          newHeight = Math.max(40, startHeight - deltaY);
          newY = startPosY + (startHeight - newHeight);
          break;
        case "s": // South
          newHeight = Math.max(40, startHeight + deltaY);
          break;
      }

      // Snap to grid if enabled
      newWidth = snapToGrid(newWidth);
      newHeight = snapToGrid(newHeight);
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);

      console.log("📐 Calling onResize:", {
        id,
        newSize: { width: newWidth, height: newHeight },
        newPos: { x: newX, y: newY },
      });
      onResize(
        id,
        { width: newWidth, height: newHeight },
        { x: newX, y: newY }
      );
    };

    const handleMouseUp = () => {
      console.log("🖱️ Mouse up - removing listeners");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    console.log("🎯 Adding mouse listeners");
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const itemStyle = {
    position: section === "page" ? "absolute" : "relative",
    left: section === "page" ? `${position.x}px` : "auto",
    top: section === "page" ? `${position.y}px` : "auto",
    zIndex: isSelected ? 1000 : 1,
    ...componentSize,
    // Override width/height after componentSize to prevent "auto" from overriding resize values
    width: section === "page" ? `${size.width || 120}px` : componentSize.width,
    height:
      section === "page" ? `${size.height || 60}px` : componentSize.height,
  };

  // Add component-specific CSS class for sizing
  const getComponentClass = () => {
    switch (type) {
      case "DataGrid":
        return "datagrid-component";
      case "Form":
        return "form-component";
      case "Tabs":
        return "tabs-component";
      case "Card":
        return "card-component";
      default:
        return "";
    }
  };

  return (
    <div
      className={`canvas-item ${
        isSelected ? "selected" : ""
      } ${section}-widget ${
        isUniversal ? "universal-component" : "specialized-component"
      } ${getComponentClass()}`}
      style={itemStyle}
      draggable={section === "page"}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      title={`${widget.icon} ${type} (${section}${
        isUniversal ? " - Universal" : " - Specialized"
      })${section === "page" ? " - Drag to move" : ""} - Click to expand`}
    >
      <div className="widget-header">
        <span className="widget-icon">{widget.icon}</span>
        <strong className="widget-type">{type}</strong>
        <div className="widget-badges">
          <span className="widget-section">{section}</span>
          {isUniversal && <span className="universal-badge">🌐</span>}
        </div>
      </div>

      <div className="widget-preview">{preview}</div>

      {/* Expanded Characteristics Panel */}
      {isSelected && (
        <div className="widget-characteristics">
          <div className="characteristics-header">
            <strong>🔧 EventType Characteristics</strong>
          </div>
          <div className="characteristics-content">
            <div className="char-row">
              <span className="char-label">EventType:</span>
              <span className="char-value">{characteristics.eventType}</span>
            </div>
            <div className="char-row">
              <span className="char-label">Category:</span>
              <span className="char-value">{characteristics.category}</span>
            </div>
            {characteristics.title && (
              <div className="char-row">
                <span className="char-label">Title:</span>
                <span className="char-value">{characteristics.title}</span>
              </div>
            )}
            {characteristics.dbTable && (
              <div className="char-row">
                <span className="char-label">Table:</span>
                <span className="char-value">{characteristics.dbTable}</span>
              </div>
            )}
            {characteristics.qrySQL && (
              <div className="char-row">
                <span className="char-label">Query:</span>
                <span className="char-value char-sql">
                  {characteristics.qrySQL.trim().substring(0, 60)}...
                </span>
              </div>
            )}
            {characteristics.params && characteristics.params.length > 0 && (
              <div className="char-row">
                <span className="char-label">Params:</span>
                <span className="char-value">
                  {characteristics.params.join(", ")}
                </span>
              </div>
            )}
            {characteristics.workflows &&
              characteristics.workflows.length > 0 && (
                <div className="char-row">
                  <span className="char-label">Workflows:</span>
                  <span className="char-value">
                    {characteristics.workflows.join(", ")}
                  </span>
                </div>
              )}
            {characteristics.navChildren &&
              characteristics.navChildren.length > 0 && (
                <div className="char-row">
                  <span className="char-label">Nav Children:</span>
                  <span className="char-value">
                    {characteristics.navChildren.join(", ")}
                  </span>
                </div>
              )}
            {characteristics.routePath && (
              <div className="char-row">
                <span className="char-label">Route:</span>
                <span className="char-value">{characteristics.routePath}</span>
              </div>
            )}
            <div className="char-row">
              <span className="char-label">Position:</span>
              <span className="char-value">
                x: {position.x}, y: {position.y}
              </span>
            </div>
          </div>
        </div>
      )}

      {bindings && Object.keys(bindings).length > 0 && (
        <div className="widget-bindings">
          <small>Bindings: {Object.keys(bindings).join(", ")}</small>
        </div>
      )}

      {/* Resize handles for page components */}
      {isSelected && section === "page" && (
        <>
          <div
            className="resize-handle resize-nw"
            onMouseDown={(e) => handleResize(e, "nw")}
          />
          <div
            className="resize-handle resize-n"
            onMouseDown={(e) => handleResize(e, "n")}
          />
          <div
            className="resize-handle resize-ne"
            onMouseDown={(e) => handleResize(e, "ne")}
          />
          <div
            className="resize-handle resize-w"
            onMouseDown={(e) => handleResize(e, "w")}
          />
          <div
            className="resize-handle resize-e"
            onMouseDown={(e) => handleResize(e, "e")}
          />
          <div
            className="resize-handle resize-sw"
            onMouseDown={(e) => handleResize(e, "sw")}
          />
          <div
            className="resize-handle resize-s"
            onMouseDown={(e) => handleResize(e, "s")}
          />
          <div
            className="resize-handle resize-se"
            onMouseDown={(e) => handleResize(e, "se")}
          />
        </>
      )}
    </div>
  );
}
