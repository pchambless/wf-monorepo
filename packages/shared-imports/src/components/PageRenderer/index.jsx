/**
 * 🚀 PageRenderer - Universal Page Orchestrator
 * 
 * Main entry point for rendering any page from pageConfig.json
 * Delegates to specialized renderers for clean separation of concerns
 */

import React, { useState, useEffect, useRef } from 'react';
import { workflowEngine } from '../../workflows/WorkflowEngine';
import { useContextStore } from '../../stores/index.js';
import ContainerRenderer from './ContainerRenderer';
import LeafRenderer from './LeafRenderer';

const PageRenderer = ({ pageConfig }) => {
  const contextStore = useContextStore();
  const [pageData, setPageData] = useState({});
  const [loading, setLoading] = useState(true);
  const componentRefs = useRef(new Map());

  useEffect(() => {
    initializePage();
  }, [pageConfig]);

  /**
   * Initialize page - register eventTypes and load initial data
   */
  const initializePage = async () => {
    try {
      setLoading(true);

      // Register all eventTypes with WorkflowEngine
      const allEventTypes = Object.values(pageConfig.eventTypes);
      workflowEngine.initialize(contextStore);
      workflowEngine.registerEventTypes(allEventTypes);

      // Load initial data for primary eventType
      const primaryEventType = pageConfig.eventTypes[pageConfig.primaryEventType];
      if (primaryEventType?.qry) {
        const initialData = await workflowEngine.execEvent(primaryEventType.qry);
        setPageData({ [pageConfig.primaryEventType]: initialData });
      }

      console.log(`🎨 PageRenderer initialized with ${allEventTypes.length} eventTypes`);
    } catch (error) {
      console.error('❌ PageRenderer initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render the page tree - delegates to appropriate renderer
   */
  const renderPageTree = (node, depth = 0) => {
    if (!node || node.missing) {
      return <div className="error">Missing EventType: {node?.eventType}</div>;
    }

    if (node.circular) {
      return <div className="warning">Circular Reference: {node.eventType}</div>;
    }

    const eventType = node.config;
    const isContainer = node.children && node.children.length > 0;
    const componentKey = `${node.eventType}-${depth}`;

    return (
      <div 
        key={componentKey}
        className={`event-type-container ${eventType.category}`}
        data-event-type={node.eventType}
        style={{ marginLeft: depth * 20 }}
      >
        {isContainer ? (
          <ContainerRenderer 
            node={node}
            componentKey={componentKey}
            renderChildTree={renderPageTree}
          />
        ) : (
          <LeafRenderer 
            eventType={eventType}
            componentKey={componentKey}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="page-loading">Loading page...</div>;
  }

  if (!pageConfig.renderTree) {
    return <div className="page-error">No render tree found in pageConfig</div>;
  }

  return (
    <div className="page-renderer">
      <div className="page-header">
        <h1>Page: {pageConfig.primaryEventType}</h1>
        <div className="page-stats">
          {pageConfig.stats.totalEventTypes} EventTypes | 
          {pageConfig.stats.leafEventTypes} Leaf | 
          {pageConfig.stats.containerEventTypes} Container
        </div>
      </div>

      <div className="page-content">
        {renderPageTree(pageConfig.renderTree)}
      </div>

      <div className="page-debug" style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', fontSize: '12px' }}>
        <details>
          <summary>Debug Info</summary>
          <pre>{JSON.stringify(pageConfig, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default PageRenderer;