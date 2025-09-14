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
        hasRef: !!mermaidRef.current
      });

      if (content && content !== 'undefined' && mermaidRef.current) {
        const chartId = `mermaid-${id}-${Date.now()}`;
        const { svg } = await window.mermaid.render(chartId, content);
        mermaidRef.current.innerHTML = svg;
        console.log('✅ Mermaid rendered, SVG length:', svg.length);

        // Set up click handlers
        window.selectComponent = (nodeId) => {
          if (onEvent) {
            onEvent('onChange', {
              nodeId,
              component,
              action: 'selectComponent',
              selected: { nodeId, type: 'mermaidNode' }
            });
          }
        };
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