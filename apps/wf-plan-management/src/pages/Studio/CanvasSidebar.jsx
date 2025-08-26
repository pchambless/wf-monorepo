import { useState, useEffect } from "react";
import {
  generateStudioComponents,
  getUniversalComponents,
  getSpecializedComponents,
} from "./eventTypeComponents.js";
import StudioHierarchy from "./StudioHierarchy.jsx";

export default function CanvasSidebar({
  onAddWidget,
  activeSection = "page",
  onSectionChange,
  currentApp = "plans",
  currentPage = "plan-manager",
  onLayoutSelect,
}) {
  const [eventTypeComponents, setEventTypeComponents] = useState({
    appbar: [],
    sidebar: [],
    page: [],
  });
  const [loading, setLoading] = useState(true);

  // Load components from server
  useEffect(() => {
    async function loadComponents() {
      try {
        const components = await generateStudioComponents();
        setEventTypeComponents(components);
      } catch (error) {
        console.error("Failed to load eventType components:", error);
      } finally {
        setLoading(false);
      }
    }
    loadComponents();
  }, []);

  const sections = ["appbar", "sidebar", "page"];
  const universalComponents = getUniversalComponents();
  const specializedComponents = getSpecializedComponents();

  return (
    <div className="canvas-sidebar">
      <h4>🎨 Studio Builder</h4>

      {/* Layout Hierarchy */}
      <StudioHierarchy
        currentApp={currentApp}
        currentPage={currentPage}
        onLayoutSelect={onLayoutSelect}
      />

      {/* Section Tabs */}
      <div className="section-tabs">
        {sections.map((section) => (
          <button
            key={section}
            className={`section-tab ${
              activeSection === section ? "active" : ""
            }`}
            onClick={() => onSectionChange && onSectionChange(section)}
          >
            {section === "appbar" && "📱 AppBar"}
            {section === "sidebar" && "📂 Sidebar"}
            {section === "page" && "📄 Page"}
          </button>
        ))}
      </div>

      {/* Universal Components - Work in any section */}
      <div className="widget-library">
        <h5>🌐 Universal Components</h5>
        <div className="component-grid">
          {universalComponents.map((component) => (
            <button
              key={component.type}
              className="widget-button universal"
              onClick={() => onAddWidget(component.type, activeSection)}
              title={component.description}
            >
              {component.label}
            </button>
          ))}
        </div>
      </div>

      {/* EventType-Driven Components */}
      <div className="widget-library">
        <h5>
          🎯 EventType Components (
          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)})
        </h5>
        <div className="component-grid">
          {eventTypeComponents[activeSection]?.map((component) => (
            <button
              key={component.key || component.eventType}
              className="widget-button eventtype"
              onClick={() => onAddWidget(component.type, activeSection)}
              title={`${component.description}\nEventType: ${component.eventType}\nCategory: ${component.category}`}
            >
              {component.icon} {component.label}
              <small className="eventtype-info">{component.eventType}</small>
            </button>
          ))}
        </div>
      </div>

      {/* Section-Specific Components */}
      <div className="widget-library">
        <h5>
          🔧 {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}{" "}
          Specialized
        </h5>
        <div className="component-grid">
          {specializedComponents[activeSection]?.map((component) => (
            <button
              key={component.type}
              className="widget-button specialized"
              onClick={() => onAddWidget(component.type, activeSection)}
              title={component.description}
            >
              {component.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h5>⚡ Quick Actions</h5>
        <button
          className="action-button"
          onClick={() => window.studioActions?.saveLayout()}
        >
          💾 Save Layout
        </button>
        <button
          className="action-button"
          onClick={() => window.studioActions?.exportEventTypes()}
        >
          📤 Export EventTypes
        </button>
        <button
          className="action-button"
          onClick={() => window.studioActions?.previewApp()}
        >
          👁️ Preview App
        </button>
        <button
          className="action-button"
          onClick={() => window.studioActions?.clearSection(activeSection)}
        >
          🧹 Clear Section
        </button>
        <button
          className="action-button"
          onClick={() => window.studioActions?.generateFromEventTypes()}
        >
          🏗️ Generate from EventTypes
        </button>
      </div>
    </div>
  );
}
