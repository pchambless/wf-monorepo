/**
 * MermaidRenderer - Interactive mermaid chart component for page hierarchy visualization
 * Loads .mmd files and provides clickable node interaction
 */

import React, { useEffect, useRef, useState } from "react";

const MermaidRenderer = ({ component, onEvent }) => {
  const { props, id } = component;
  const mermaidRef = useRef(null);
  const [mermaidContent, setMermaidContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load mermaid.js dynamically
  useEffect(() => {
    const loadMermaid = async () => {
      if (!window.mermaid) {
        try {
          // Load mermaid from CDN
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
          script.onload = () => {
            window.mermaid.initialize({
              startOnLoad: false,
              theme: 'default',
              securityLevel: 'loose', // Allow click events
              flowchart: {
                useMaxWidth: true,
                htmlLabels: true
              }
            });
          };
          document.head.appendChild(script);
        } catch (err) {
          setError(`Failed to load mermaid: ${err.message}`);
        }
      }
    };

    loadMermaid();
  }, []);

  // Load mermaid content from file path or component data
  useEffect(() => {
    const loadMermaidContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to get mermaid content from component props
        let content = "";
        
        if (props?.mermaidPath || props?.mermaidFile) {
          // Load from file path
          const filePath = props.mermaidPath || props.mermaidFile;
          const response = await fetch(filePath);
          if (!response.ok) {
            throw new Error(`Failed to load mermaid file: ${response.status}`);
          }
          content = await response.text();
        } else if (props?.mermaidContent) {
          // Use provided content directly
          content = props.mermaidContent;
        } else {
          // Default: try to load based on current app/page
          const appName = props?.appName || 'studio';
          const pageName = props?.pageName || 'Studio';
          const mermaidPath = `/apps/${appName}/pages/${pageName}/pageMermaid.mmd`;
          
          const response = await fetch(mermaidPath);
          if (!response.ok) {
            throw new Error(`No mermaid file found at ${mermaidPath}`);
          }
          content = await response.text();
        }
        
        setMermaidContent(content);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadMermaidContent();
  }, [props?.mermaidPath, props?.mermaidFile, props?.mermaidContent, props?.appName, props?.pageName]);

  // Render mermaid chart when content changes
  useEffect(() => {
    const renderMermaid = async () => {
      if (!window.mermaid || !mermaidContent || !mermaidRef.current) return;

      try {
        // Clear previous content
        mermaidRef.current.innerHTML = '';
        
        // Generate unique ID for this chart
        const chartId = `mermaid-${id}-${Date.now()}`;
        
        // Render the mermaid chart
        const { svg } = await window.mermaid.render(chartId, mermaidContent);
        mermaidRef.current.innerHTML = svg;
        
        // Set up click handlers for nodes
        setupClickHandlers();
        
      } catch (err) {
        setError(`Failed to render mermaid: ${err.message}`);
      }
    };

    if (!isLoading) {
      renderMermaid();
    }
  }, [mermaidContent, isLoading, id]);

  // Set up click handlers for mermaid nodes
  const setupClickHandlers = () => {
    if (!mermaidRef.current) return;

    // Add global click handler function for mermaid callbacks
    window.selectComponent = (nodeId) => {
      console.log(`🎯 Mermaid node clicked: ${nodeId}`);
      
      if (onEvent) {
        onEvent('onChange', { 
          nodeId, 
          component,
          action: 'selectComponent',
          selected: { nodeId, type: 'mermaidNode' }
        });
      }
    };

    // Also add click listeners directly to nodes for backup
    const nodes = mermaidRef.current.querySelectorAll('.node');
    nodes.forEach(node => {
      node.style.cursor = 'pointer';
      node.addEventListener('click', (e) => {
        const nodeId = node.id || node.getAttribute('data-id');
        if (nodeId && onEvent) {
          onEvent('onChange', { 
            nodeId, 
            component,
            action: 'selectComponent',
            selected: { nodeId, type: 'mermaidNode' }
          });
        }
      });
    });
  };

  if (isLoading) {
    return (
      <div className="wf-mermaid-loading" style={props?.style}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div>Loading mermaid chart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wf-mermaid-error" style={props?.style}>
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#d32f2f',
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          margin: '20px'
        }}>
          <strong>Mermaid Error:</strong>
          <br />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="wf-mermaid" style={props?.style}>
      {props?.title && (
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 'bold', 
          marginBottom: '10px',
          padding: '0 10px'
        }}>
          {props.title}
        </div>
      )}
      
      <div 
        ref={mermaidRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          padding: '10px'
        }}
      />
    </div>
  );
};

export default MermaidRenderer;