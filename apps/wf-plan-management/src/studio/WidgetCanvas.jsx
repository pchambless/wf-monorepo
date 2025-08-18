import { useState } from "react";
import CanvasItem from "./CanvasItem";

export default function WidgetCanvas({
  layout,
  onSelectItem,
  onMoveItem,
  onResizeItem,
  selectedId,
  activeSection,
}) {
  const [showGrid, setShowGrid] = useState(false);
  // Group layout items by section
  const appbarItems = layout.filter((item) => item.section === "appbar");
  const sidebarItems = layout.filter((item) => item.section === "sidebar");
  const pageItems = layout.filter((item) => item.section === "page");

  return (
    <div className="widget-canvas">
      {/* App Preview Structure */}
      <div className="app-preview">
        {/* AppBar Section */}
        <div
          className={`canvas-section appbar-section ${
            activeSection === "appbar" ? "active-section" : ""
          }`}
        >
          <div className="section-label">📱 AppBar</div>
          <div className="section-content appbar-content">
            {appbarItems.length === 0 ? (
              <div className="empty-section">Drop AppBar widgets here</div>
            ) : (
              appbarItems.map((item) => (
                <CanvasItem
                  key={item.id}
                  {...item}
                  isSelected={selectedId === item.id}
                  onSelect={onSelectItem}
                  onMove={onMoveItem}
                />
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Sidebar Section */}
          <div
            className={`canvas-section sidebar-section ${
              activeSection === "sidebar" ? "active-section" : ""
            }`}
          >
            <div className="section-label">📂 Sidebar</div>
            <div className="section-content sidebar-content">
              {sidebarItems.length === 0 ? (
                <div className="empty-section">Drop Sidebar widgets here</div>
              ) : (
                sidebarItems.map((item) => (
                  <CanvasItem
                    key={item.id}
                    {...item}
                    isSelected={selectedId === item.id}
                    onSelect={onSelectItem}
                    onMove={onMoveItem}
                  />
                ))
              )}
            </div>
          </div>

          {/* Page Section */}
          <div
            className={`canvas-section page-section ${
              activeSection === "page" ? "active-section" : ""
            }`}
          >
            <div className="section-label">📄 Page Content</div>
            <div className={`section-content page-content ${showGrid ? 'show-grid' : ''}`}>
              <button 
                className="grid-toggle"
                onClick={() => setShowGrid(!showGrid)}
                title={showGrid ? "Hide Grid" : "Show Grid"}
              >
                {showGrid ? "📄" : "⊞"}
              </button>
              {pageItems.length === 0 ? (
                <div className="empty-section">Drop Page widgets here</div>
              ) : (
                pageItems.map((item) => (
                  <CanvasItem
                    key={item.id}
                    {...item}
                    isSelected={selectedId === item.id}
                    onSelect={onSelectItem}
                    onMove={onMoveItem}
                    onResize={onResizeItem}
                    showGrid={showGrid}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
