/**
 * Studio Sidebar Component
 * Page selector dropdown + Layout/Query eventType hierarchy
 */

import React from "react";
import TreeView, { TreeItem } from "./TreeView";

export default function StudioSidebar({
  currentApp = "plans",
  selectedPage,
  onPageSelect,
  onLayoutSelect,
  onQuerySelect,
}) {
  const [graphData, setGraphData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Load graph data on mount
  React.useEffect(() => {
    loadGraphData();
  }, [currentApp]);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load the generated graph data JSON
      const response = await fetch(
        `http://localhost:3001/api/getDoc?path=analysis-n-document/genDocs/output/apps/${currentApp}/eventTypes-${currentApp}-graphData.json`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to load graph data: ${response.status}`);
      }
      
      const data = await response.json();
      setGraphData(data);
    } catch (err) {
      console.error("Failed to load graph data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Extract page options from graph data
  const pageOptions = React.useMemo(() => {
    if (!graphData?.nodes) return [];
    
    return graphData.nodes
      .filter(node => node.category === 'page')
      .map(node => ({
        value: node.id,
        label: node.meta.title || node.id
      }));
  }, [graphData]);

  // Get layout eventTypes for selected page
  const layoutEventTypes = React.useMemo(() => {
    if (!graphData?.nodes || !selectedPage) return [];
    
    // Get the selected page node
    const pageNode = graphData.nodes.find(node => node.id === selectedPage);
    if (!pageNode) return [];
    
    // Get all layout categories including app-level components
    const layoutNodes = graphData.nodes.filter(node => 
      ['page', 'tabs', 'tab', 'appbar', 'sidebar'].includes(node.category)
    );
    
    // Build hierarchy: page first, then components connected to it, then app-level
    const hierarchy = [];
    
    // 1. Add the selected page first
    hierarchy.push(pageNode);
    
    // 2. Add app-level components (appbar, sidebar) that belong to this app
    const appComponents = layoutNodes.filter(node => 
      ['appbar', 'sidebar'].includes(node.category) && 
      node.meta.app === pageNode.meta.app
    );
    hierarchy.push(...appComponents);
    
    // 3. Add page-specific layout components (tabs, etc.)
    const pageComponents = layoutNodes.filter(node => {
      if (node.id === selectedPage) return false; // Already added
      if (['appbar', 'sidebar'].includes(node.category)) return false; // Already added
      
      // Check if connected to this page
      return graphData.componentEdges?.some(edge => 
        edge.from === selectedPage && edge.to === node.id
      );
    });
    hierarchy.push(...pageComponents);
    
    return hierarchy;
  }, [graphData, selectedPage]);

  // Get query eventTypes for selected page  
  const queryEventTypes = React.useMemo(() => {
    if (!graphData?.nodes || !selectedPage) return [];
    
    return graphData.nodes.filter(node => {
      const isQueryCategory = ['grid', 'form', 'ui:Select'].includes(node.category);
      const isRelatedToPage = graphData.componentEdges?.some(edge => 
        edge.from === selectedPage && edge.to === node.id
      ) || graphData.componentEdges?.some(edge => {
        // Check if connected through intermediate layout components
        const intermediateLayout = layoutEventTypes.find(layout => layout.id === edge.from);
        return intermediateLayout && edge.to === node.id;
      });
      
      return isQueryCategory && isRelatedToPage;
    });
  }, [graphData, selectedPage, layoutEventTypes]);

  if (loading) {
    return (
      <div className="studio-sidebar">
        <div className="loading">Loading Studio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="studio-sidebar">
        <div className="error">
          <h5>Error Loading Studio</h5>
          <p>{error}</p>
          <button onClick={loadGraphData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-sidebar">
      <div style={{ padding: "8px 12px", borderBottom: "1px solid #dee2e6" }}>
        <h6 style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: "600" }}>🏗️ Studio</h6>
        
        {/* Page Selector */}
        <div style={{ marginBottom: "8px" }}>
          <label 
            htmlFor="page-select" 
            style={{ fontSize: "11px", fontWeight: "500", marginBottom: "2px", display: "block" }}
          >
            📋 Page:
          </label>
          <select 
            id="page-select"
            value={selectedPage || ''}
            onChange={(e) => onPageSelect?.(e.target.value)}
            style={{ 
              width: "100%", 
              fontSize: "11px", 
              padding: "3px 6px",
              border: "1px solid #ccc",
              borderRadius: "2px"
            }}
          >
            <option value="">Select Page...</option>
            {pageOptions.map(page => (
              <option key={page.value} value={page.value}>
                {page.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPage && (
        <div style={{ padding: "6px" }}>
          {/* Layout EventTypes Tree (Editable) */}
          <TreeView 
            title={`🎨 Layout (${layoutEventTypes.length})`}
            icon="🎨"
            expandedIcon="🎨"
            defaultExpanded={true}
          >
            {layoutEventTypes.map(eventType => {
              const icon = eventType.category === 'page' ? '📄' : 
                          eventType.category === 'tabs' ? '📑' : 
                          eventType.category === 'tab' ? '📝' : 
                          eventType.category === 'appbar' ? '📱' : 
                          eventType.category === 'sidebar' ? '📂' : '📋';
              
              return (
                <TreeItem
                  key={eventType.id}
                  title={eventType.meta.title || eventType.id}
                  icon={icon}
                  itemType="layout"
                  selected={eventType.id === selectedPage}
                  onClick={() => onLayoutSelect?.(eventType)}
                />
              );
            })}
          </TreeView>

          {/* Query EventTypes Tree (View-only) */}
          <TreeView 
            title={`🔍 Query (${queryEventTypes.length})`}
            icon="🔍"
            expandedIcon="🔍"
            defaultExpanded={true}
          >
            {queryEventTypes.map(eventType => {
              const icon = eventType.category === 'grid' ? '📊' : 
                          eventType.category === 'form' ? '📝' : 
                          eventType.category === 'ui:Select' ? '🎛️' : '🔍';
              
              return (
                <TreeItem
                  key={eventType.id}
                  title={eventType.meta.title || eventType.id}
                  icon={icon}
                  itemType="query"
                  onClick={() => onQuerySelect?.(eventType)}
                />
              );
            })}
          </TreeView>
        </div>
      )}

      {/* Debug Info */}
      {graphData && (
        <div style={{ padding: "6px", borderTop: "1px solid #eee", fontSize: "10px" }}>
          <details>
            <summary style={{ fontSize: "10px", color: "#666", cursor: "pointer" }}>
              Debug: Graph Data
            </summary>
            <div style={{ paddingTop: "4px", color: "#666" }}>
              <div>Nodes: {graphData.nodes?.length || 0}</div>
              <div>Edges: {graphData.componentEdges?.length || 0}</div>
              <div>App: {graphData.app}</div>
            </div>
          </details>
        </div>
      )}

      {/* Widget palette moved to WidgetPalette component in Studio page */}
    </div>
  );
}