import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { buildComponentTree } from '../utils/buildComponentTree';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const DiagramView = ({ pageID, componentTreeData, triggerData }) => {
  const [activeSubTab, setActiveSubTab] = useState('structure');
  const [orientation, setOrientation] = useState('TD');
  const [structureDiagram, setStructureDiagram] = useState(null);
  const [workflowDiagram, setWorkflowDiagram] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const mermaidRef = useRef(null);
  const fullscreenMermaidRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true
      }
    });
  }, []);

  useEffect(() => {
    if (componentTreeData && componentTreeData.length > 0) {
      enrichAndGenerateDiagrams();
    }
  }, [componentTreeData, triggerData]);

  const enrichAndGenerateDiagrams = () => {
    console.log('📊 DiagramView: Enriching data with triggers:', triggerData?.length);
    
    // Merge trigger counts into component data
    const triggerCounts = {};
    (triggerData || []).forEach(t => {
      triggerCounts[t.xref_id] = (triggerCounts[t.xref_id] || 0) + 1;
    });
    
    const enrichedData = componentTreeData.map(comp => ({
      ...comp,
      triggerCount: triggerCounts[comp.id] || 0
    }));
    
    console.log('📊 DiagramView: Enriched data with trigger counts:', enrichedData);
    
    generateDiagrams(enrichedData);
  };

  useEffect(() => {
    renderMermaid();
  }, [structureDiagram, workflowDiagram, activeSubTab, orientation]);

  useEffect(() => {
    if (showFullscreen) {
      renderFullscreenMermaid();
    }
  }, [showFullscreen, structureDiagram, workflowDiagram, activeSubTab, orientation]);

  const generateDiagrams = (enrichedData) => {
    console.log('📊 DiagramView: Generating diagrams from enrichedData:', enrichedData);
    
    // Build tree structure
    const treeData = buildComponentTree(enrichedData);
    
    console.log('📊 DiagramView: Tree data built:', treeData);
    
    if (treeData && treeData.length > 0) {
      // Generate structure diagram
      const structure = generateStructureDiagram(treeData);
      console.log('📊 DiagramView: Structure diagram:', structure);
      setStructureDiagram(structure);

      // Generate workflow diagram  
      const workflow = generateWorkflowDiagram(treeData);
      console.log('📊 DiagramView: Workflow diagram:', workflow);
      setWorkflowDiagram(workflow);
    } else {
      console.warn('⚠️ DiagramView: No tree data built');
    }
  };

  const renderMermaid = async () => {
    if (!mermaidRef.current) {
      console.log('⚠️ DiagramView: mermaidRef not ready');
      return;
    }

    const currentDiagram = activeSubTab === 'structure' ? structureDiagram : workflowDiagram;
    
    console.log('📊 DiagramView: Rendering mermaid, activeSubTab:', activeSubTab, 'diagram:', currentDiagram);
    
    if (currentDiagram) {
      try {
        mermaidRef.current.innerHTML = '';
        const orientedDiagram = currentDiagram.replace(/graph (TD|LR)/, `graph ${orientation}`);
        console.log('📊 DiagramView: Oriented diagram:', orientedDiagram);
        const { svg } = await mermaid.render('mermaid-diagram-' + Date.now(), orientedDiagram);
        mermaidRef.current.innerHTML = svg;
        console.log('✅ DiagramView: Mermaid rendered successfully');
      } catch (err) {
        console.error('❌ DiagramView: Mermaid render error:', err);
        mermaidRef.current.innerHTML = `<pre style="color: red;">Mermaid Error: ${err.message}</pre>`;
      }
    } else {
      console.log('⚠️ DiagramView: No diagram to render');
    }
  };

  const renderFullscreenMermaid = async () => {
    if (!fullscreenMermaidRef.current) return;

    const currentDiagram = activeSubTab === 'structure' ? structureDiagram : workflowDiagram;
    
    if (currentDiagram) {
      try {
        fullscreenMermaidRef.current.innerHTML = '';
        const orientedDiagram = currentDiagram.replace(/graph (TD|LR)/, `graph ${orientation}`);
        const { svg } = await mermaid.render('mermaid-fullscreen-' + Date.now(), orientedDiagram);
        fullscreenMermaidRef.current.innerHTML = svg;
      } catch (err) {
        console.error('❌ DiagramView: Fullscreen mermaid render error:', err);
        fullscreenMermaidRef.current.innerHTML = `<pre style="color: red;">Mermaid Error: ${err.message}</pre>`;
      }
    }
  };

  const generateStructureDiagram = (treeData) => {
    let diagram = 'graph TD\n';
    
    const traverse = (components, parentId = null) => {
      components.forEach(comp => {
        console.log('📊 DiagramView: Processing component:', comp);
        const nodeId = `node${comp.id}`;
        const compName = comp.comp_name || comp.name || 'Unknown';
        const compType = comp.comp_type || comp.type || 'Unknown';
        const label = `${compName}[${compType}]`;
        diagram += `  ${nodeId}["${label}"]\n`;
        
        if (parentId) {
          diagram += `  ${parentId} --> ${nodeId}\n`;
        }
        
        if (comp.children && comp.children.length > 0) {
          traverse(comp.children, nodeId);
        }
      });
    };
    
    traverse(treeData);
    
    return diagram;
  };

  const generateWorkflowDiagram = (treeData) => {
    let diagram = 'graph TD\n';
    let hasWorkflows = false;
    
    // Build component map for lookups
    const compMap = {};
    const flattenComponents = (components) => {
      components.forEach(comp => {
        compMap[comp.id] = comp;
        if (comp.children && comp.children.length > 0) {
          flattenComponents(comp.children);
        }
      });
    };
    flattenComponents(treeData);
    
    // Group triggers by component
    const triggersByComp = {};
    (triggerData || []).forEach(trigger => {
      if (!triggersByComp[trigger.xref_id]) {
        triggersByComp[trigger.xref_id] = [];
      }
      triggersByComp[trigger.xref_id].push(trigger);
    });
    
    // Generate diagram with trigger flows
    Object.entries(triggersByComp).forEach(([xref_id, triggers]) => {
      const comp = compMap[xref_id];
      if (!comp) return;
      
      hasWorkflows = true;
      const compNode = `comp${xref_id}`;
      const compName = comp.comp_name || 'Unknown';
      
      diagram += `  ${compNode}["${compName}"]\n`;
      
      // Show trigger actions
      triggers.forEach((trigger, idx) => {
        const actionNode = `action${xref_id}_${idx}`;
        const actionLabel = `${trigger.class}→${trigger.action}`;
        diagram += `  ${actionNode}["${actionLabel}"]\n`;
        diagram += `  ${compNode} --> ${actionNode}\n`;
        
        // Try to parse content for target component references
        try {
          const content = JSON.parse(trigger.content || '{}');
          // Look for common patterns like refresh, navigate, etc.
          if (content.target || content.componentId) {
            const targetId = content.target || content.componentId;
            const targetComp = compMap[targetId];
            if (targetComp) {
              const targetNode = `comp${targetId}`;
              diagram += `  ${actionNode} -.-> ${targetNode}\n`;
            }
          }
        } catch (e) {
          // Content not JSON or no target
        }
      });
    });
    
    console.log('📊 Workflow: hasWorkflows:', hasWorkflows);
    
    return hasWorkflows ? diagram : 'graph TD\n  empty["No workflow triggers found"]';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.subTabs}>
          <button
            style={activeSubTab === 'structure' ? styles.subTabActive : styles.subTab}
            onClick={() => setActiveSubTab('structure')}
          >
            🏗️ Structure
          </button>
          <button
            style={activeSubTab === 'workflow' ? styles.subTabActive : styles.subTab}
            onClick={() => setActiveSubTab('workflow')}
          >
            🔄 Workflow
          </button>
        </div>
        <div style={styles.controls}>
          <button
            style={orientation === 'TD' ? styles.controlActive : styles.control}
            onClick={() => setOrientation('TD')}
          >
            ⬇️ TD
          </button>
          <button
            style={orientation === 'LR' ? styles.controlActive : styles.control}
            onClick={() => setOrientation('LR')}
          >
            ➡️ LR
          </button>
          <button
            style={styles.control}
            onClick={() => setShowFullscreen(true)}
          >
            ⛶ Fullscreen
          </button>
        </div>
      </div>
      <div style={styles.diagramContainer}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
        >
          <TransformComponent>
            <div ref={mermaidRef} style={styles.mermaid}></div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div style={styles.modalOverlay} onClick={() => setShowFullscreen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {activeSubTab === 'structure' ? '🏗️ Structure Diagram' : '🔄 Workflow Diagram'}
              </h3>
              <button style={styles.modalClose} onClick={() => setShowFullscreen(false)}>
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <TransformWrapper
                initialScale={0.8}
                minScale={0.3}
                maxScale={3}
              >
                <TransformComponent>
                  <div ref={fullscreenMermaidRef} style={styles.fullscreenMermaid}></div>
                </TransformComponent>
              </TransformWrapper>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  subTabs: {
    display: 'flex',
    gap: '8px',
  },
  subTab: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  subTabActive: {
    padding: '6px 12px',
    border: '1px solid #1976d2',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  controls: {
    display: 'flex',
    gap: '8px',
  },
  control: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  controlActive: {
    padding: '6px 12px',
    border: '1px solid #1976d2',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  diagramContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  mermaid: {
    padding: '20px',
    minWidth: '100%',
    minHeight: '100%',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    width: '95vw',
    height: '95vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    color: '#666',
    cursor: 'pointer',
  },
  modalBody: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  fullscreenMermaid: {
    padding: '40px',
    minWidth: '100%',
    minHeight: '100%',
  },
};

export default DiagramView;
