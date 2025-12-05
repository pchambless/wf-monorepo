import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { buildPageConfig } from '../utils/pageConfigBuilder';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const DiagramView = ({ pageID }) => {
  const [activeSubTab, setActiveSubTab] = useState('structure');
  const [orientation, setOrientation] = useState('TD');
  const [structureDiagram, setStructureDiagram] = useState(null);
  const [workflowDiagram, setWorkflowDiagram] = useState(null);
  const [loading, setLoading] = useState(false);
  const mermaidRef = useRef(null);

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
    if (pageID) {
      loadDiagrams();
    }
  }, [pageID]);

  useEffect(() => {
    renderMermaid();
  }, [structureDiagram, workflowDiagram, activeSubTab, orientation]);

  const loadDiagrams = async () => {
    try {
      setLoading(true);
      const pageConfig = await buildPageConfig(pageID);
      
      if (pageConfig) {
        // Generate structure diagram
        const structure = generateStructureDiagram(pageConfig);
        setStructureDiagram(structure);

        // Generate workflow diagram
        const workflow = generateWorkflowDiagram(pageConfig);
        setWorkflowDiagram(workflow);
      }
    } catch (error) {
      console.error('Error loading diagrams:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMermaid = async () => {
    if (!mermaidRef.current) return;

    const currentDiagram = activeSubTab === 'structure' ? structureDiagram : workflowDiagram;
    
    if (currentDiagram) {
      try {
        mermaidRef.current.innerHTML = '';
        const orientedDiagram = currentDiagram.replace(/graph (TD|LR)/, `graph ${orientation}`);
        const { svg } = await mermaid.render('mermaid-diagram-' + Date.now(), orientedDiagram);
        mermaidRef.current.innerHTML = svg;
      } catch (err) {
        console.error('Mermaid render error:', err);
        mermaidRef.current.innerHTML = `<pre style="color: red;">Mermaid Error: ${err.message}</pre>`;
      }
    }
  };

  const generateStructureDiagram = (pageConfig) => {
    let diagram = 'graph TD\n';
    
    const traverse = (components, parentId = null) => {
      components.forEach(comp => {
        const nodeId = `node${comp.id}`;
        const label = `${comp.comp_name}[${comp.comp_type}]`;
        diagram += `  ${nodeId}["${label}"]\n`;
        
        if (parentId) {
          diagram += `  ${parentId} --> ${nodeId}\n`;
        }
        
        if (comp.components && comp.components.length > 0) {
          traverse(comp.components, nodeId);
        }
      });
    };
    
    if (pageConfig.components) {
      traverse(pageConfig.components);
    }
    
    return diagram;
  };

  const generateWorkflowDiagram = (pageConfig) => {
    let diagram = 'graph TD\n';
    let nodeCount = 0;
    
    const traverse = (components) => {
      components.forEach(comp => {
        if (comp.workflowTriggers) {
          Object.entries(comp.workflowTriggers).forEach(([eventClass, triggers]) => {
            const compNode = `comp${comp.id}`;
            diagram += `  ${compNode}["${comp.comp_name} (${eventClass})"]\n`;
            
            triggers.forEach((trigger, idx) => {
              const actionNode = `action${nodeCount++}`;
              diagram += `  ${actionNode}["${trigger.action}"]\n`;
              diagram += `  ${compNode} --> ${actionNode}\n`;
            });
          });
        }
        
        if (comp.components && comp.components.length > 0) {
          traverse(comp.components);
        }
      });
    };
    
    if (pageConfig.components) {
      traverse(pageConfig.components);
    }
    
    return diagram || 'graph TD\n  empty["No workflow triggers found"]';
  };

  if (loading) {
    return <div style={styles.loading}>Loading diagrams...</div>;
  }

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
};

export default DiagramView;
