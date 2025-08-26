/**
 * Studio Hierarchy Component
 * Interactive Mermaid chart for navigating layout eventTypes
 */

import React from "react";

export default function StudioHierarchy({
  currentApp,
  currentPage,
  onLayoutSelect,
}) {
  const [hierarchyData, setHierarchyData] = React.useState(null);
  const [mermaidChart, setMermaidChart] = React.useState("");

  // Generate hierarchy from layout eventTypes
  const generateStudioHierarchy = React.useCallback(async () => {
    try {
      // Fetch all eventTypes for the current app using new Studio endpoint
      const response = await fetch(
        `http://localhost:3001/api/studio/eventTypes/${currentApp}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Studio eventTypes: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("📡 Fetched Studio eventTypes:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch eventTypes");
      }

      const eventTypes = data.eventTypes;

      // Filter to layout eventTypes only (for hierarchy display)
      const layoutEventTypes = eventTypes.filter((et) =>
        ["page", "tab", "appbar", "sidebar"].includes(et.category)
      );

      // Build hierarchy structure
      const hierarchy = buildLayoutHierarchy(layoutEventTypes);

      // Convert to Mermaid format
      const mermaidDef = hierarchyToMermaid(hierarchy, currentApp);

      setHierarchyData(hierarchy);
      setMermaidChart(mermaidDef);
    } catch (error) {
      console.error("Failed to generate Studio hierarchy:", error);
    }
  }, [currentApp]);

  // Build hierarchy from layout eventTypes
  function buildLayoutHierarchy(layoutEventTypes) {
    const hierarchy = {
      app: {
        appbar: null,
        sidebar: null,
      },
      pages: {},
    };

    layoutEventTypes.forEach((et) => {
      if (et.category === "appbar") {
        hierarchy.app.appbar = et;
      } else if (et.category === "sidebar") {
        hierarchy.app.sidebar = et;
      } else if (et.category === "page") {
        // Extract page name from eventType (e.g., pagePlanManager -> planManager)
        const pageName = et.eventType.replace(/^page/, "").toLowerCase();
        if (!hierarchy.pages[pageName]) {
          hierarchy.pages[pageName] = {
            page: et,
            tabs: [],
          };
        }
      } else if (et.category === "tab") {
        // Find parent page from navChildren relationships
        const parentPage = layoutEventTypes.find((parent) =>
          parent.navChildren?.includes(et.eventType)
        );
        if (parentPage) {
          const pageName = parentPage.eventType
            .replace(/^page/, "")
            .toLowerCase();
          if (!hierarchy.pages[pageName]) {
            hierarchy.pages[pageName] = { page: parentPage, tabs: [] };
          }
          hierarchy.pages[pageName].tabs.push(et);
        }
      }
    });

    return hierarchy;
  }

  // Convert hierarchy to Mermaid format
  function hierarchyToMermaid(hierarchy, appName) {
    const lines = [];

    lines.push("flowchart TD");
    lines.push(`  App["📱 ${appName} App"]`);
    lines.push('  AppLayout["🏗️ App Layout"]');
    lines.push('  Pages["📄 Pages"]');
    lines.push("");

    // App structure
    lines.push("  App --> AppLayout");
    lines.push("  App --> Pages");
    lines.push("");

    // App layout components
    if (hierarchy.app.appbar) {
      lines.push(`  AppLayout --> Appbar["📱 ${hierarchy.app.appbar.title}"]`);
    }
    if (hierarchy.app.sidebar) {
      lines.push(
        `  AppLayout --> Sidebar["📂 ${hierarchy.app.sidebar.title}"]`
      );
    }
    lines.push("");

    // Pages and tabs
    Object.entries(hierarchy.pages).forEach(([pageName, pageData]) => {
      const pageId = `Page_${pageName}`;
      lines.push(`  Pages --> ${pageId}["📋 ${pageData.page.title}"]`);

      // Add tabs for this page
      pageData.tabs.forEach((tab) => {
        const tabId = `Tab_${tab.eventType}`;
        lines.push(`  ${pageId} --> ${tabId}["📑 ${tab.title}"]`);
      });
    });

    // Add click events for interactivity
    lines.push("");
    lines.push("  %% Click events for Studio navigation");
    if (hierarchy.app.appbar) {
      lines.push(
        `  click Appbar "loadLayout('${hierarchy.app.appbar.eventType}')" "Edit Appbar"`
      );
    }
    if (hierarchy.app.sidebar) {
      lines.push(
        `  click Sidebar "loadLayout('${hierarchy.app.sidebar.eventType}')" "Edit Sidebar"`
      );
    }

    Object.entries(hierarchy.pages).forEach(([pageName, pageData]) => {
      const pageId = `Page_${pageName}`;
      lines.push(
        `  click ${pageId} "loadLayout('${pageData.page.eventType}')" "Edit ${pageData.page.title}"`
      );

      pageData.tabs.forEach((tab) => {
        const tabId = `Tab_${tab.eventType}`;
        lines.push(
          `  click ${tabId} "loadLayout('${tab.eventType}')" "Edit ${tab.title}"`
        );
      });
    });

    // Styling
    lines.push("");
    lines.push(
      "  classDef appNode fill:#e3f2fd,stroke:#1976d2,stroke-width:2px"
    );
    lines.push(
      "  classDef pageNode fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px"
    );
    lines.push(
      "  classDef tabNode fill:#e8f5e8,stroke:#388e3c,stroke-width:2px"
    );

    return lines.join("\n");
  }

  // Load hierarchy on mount and when app changes
  React.useEffect(() => {
    generateStudioHierarchy();
  }, [generateStudioHierarchy]);

  // Handle Mermaid click events (would need Mermaid.js integration)
  React.useEffect(() => {
    // This would integrate with your existing Mermaid rendering
    // to make the chart interactive
    if (typeof window !== "undefined" && window.loadLayout) {
      window.loadLayout = (eventType) => {
        console.log("🎯 Loading layout:", eventType);
        onLayoutSelect?.(eventType);
      };
    }
  }, [onLayoutSelect]);

  return (
    <div className="studio-hierarchy">
      <h5>🏗️ Layout Hierarchy</h5>

      {/* Mermaid Chart Container */}
      <div className="hierarchy-chart">
        {mermaidChart ? (
          <pre className="mermaid-definition">
            <code>{mermaidChart}</code>
          </pre>
        ) : (
          <div className="loading">Loading hierarchy...</div>
        )}
      </div>

      {/* Debug Info */}
      {hierarchyData && (
        <div className="hierarchy-debug">
          <details>
            <summary>Debug: Hierarchy Data</summary>
            <pre>{JSON.stringify(hierarchyData, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

// Global function for Mermaid click events
if (typeof window !== "undefined") {
  window.loadLayout = function (eventType) {
    console.log("🎯 Mermaid click:", eventType);
    // This will be overridden by the component
  };
}
