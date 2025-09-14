import React, { useEffect, useRef } from "react";
import { workflowEngine } from "../../WorkflowEngine/index.js";
import "../../../styles/components/mermaid.css";

const MermaidRenderer = ({ component, onEvent }) => {
  const { props, id } = component;
  const mermaidRef = useRef(null);

  useEffect(() => {
    const renderContent = async () => {
      // Mermaid is loaded globally, just check if it's ready
      if (!window.mermaid) {
        console.log('🎨 MermaidRenderer: Waiting for global mermaid library...');
        return;
      }

      const contextStore = workflowEngine?.contextStore;
      const contentTuple = contextStore?.getVal('mermaidContent');
      const content = contentTuple?.[1];

      console.log('🎨 MermaidRenderer: Render attempt', {
        content: content?.substring(0, 50),
        hasRef: !!mermaidRef.current,
        clickHandlersCheck: content?.includes('selectEventTypeTab') ? 'NEW FORMAT' : 'OLD FORMAT'
      });

      if (content && content !== 'undefined' && mermaidRef.current) {
        try {
          const chartId = `mermaid-${id}-${Date.now()}`;

          // Register selectEventTypeTab globally for javascript: hrefs
          window.selectEventTypeTab = (nodeId) => {
            console.log(`🎯 MermaidRenderer: selectEventTypeTab called with: ${nodeId}`);
            if (workflowEngine && workflowEngine.selectEventTypeTab) {
              workflowEngine.selectEventTypeTab({ nodeId });
            } else {
              console.error('❌ WorkflowEngine not available');
            }
          };

          // Simple render approach
          const { svg } = await window.mermaid.render(chartId, content);
          mermaidRef.current.innerHTML = svg;
          console.log('✅ Mermaid rendered, SVG length:', svg.length);

          // Log if callback is registered
          console.log('🔧 window.callback registered:', typeof window.callback);
        } catch (error) {
          console.error('❌ Mermaid render error:', error);
          mermaidRef.current.innerHTML = '<div class="mermaid-error">Failed to render diagram</div>';
          return;
        }
      }
    };

    // Set up subscription for contextStore changes
    const contextStore = workflowEngine?.contextStore;
    const unsubscribe = contextStore?.subscribe('mermaidContent', renderContent);

    // Try initial render (in case content is already available)
    renderContent().catch(console.error);

    return unsubscribe;
  }, [id, component, onEvent]);

  return (
    <div className="wf-mermaid" style={props?.style}>
      {props?.title && (
        <div className="wf-mermaid-title">
          {props.title}
        </div>
      )}
      <div ref={mermaidRef} className="wf-mermaid-container">
        <div className="wf-mermaid-placeholder">
          Select a page to view its component hierarchy
        </div>
      </div>
    </div>
  );
};

export default MermaidRenderer;