import React, { useEffect, useState } from 'react';
import TreeNode from './TreeNode';
import { buildComponentTree } from '../utils/buildComponentTree';

const ComponentTreeDirect = ({ pageID, selectedComponent, onComponentSelect }) => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pageID) {
      loadComponents();
    }
  }, [pageID]);

  const loadComponents = async () => {
    try {
      setLoading(true);
      console.log('🌲 ComponentTreeDirect: Loading from MySQL for pageID:', pageID);

      // Query 1: Get hierarchical components using fetchPageStructure (sp_pageStructure)
      const compResponse = await fetch('http://localhost:3002/api/execEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventSQLId: 'fetchPageStructure',
          params: { pageID }
        })
      });

      const compResult = await compResponse.json();
      console.log('🌲 ComponentTreeDirect: Raw API response:', compResult);
      // fetchPageStructure returns array directly
      const componentsData = compResult.data || [];
      console.log('🌲 ComponentTreeDirect: Components data:', componentsData);
      const components = componentsData.map(comp => ({
        id: comp.xref_id || comp.id,
        comp_name: comp.comp_name,
        comp_type: comp.comp_type,
        parent_id: comp.parent_id,
        posOrder: comp.posOrder,
        pageID: comp.pageID,
        level: comp.level,
        id_path: comp.id_path
      }));
      console.log('🌲 ComponentTreeDirect: Found hierarchical components:', components.length, components);

      // Query 2: Get all props for this page
      const propsResponse = await fetch('http://localhost:3002/api/execEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventSQLId: 'pageProps',
          params: { pageID }
        })
      });

      const propsResult = await propsResponse.json();
      const propCounts = {};
      (propsResult.data || []).forEach(prop => {
        propCounts[prop.xref_id] = (propCounts[prop.xref_id] || 0) + 1;
      });

      // Query 3: Get all triggers for this page
      const triggersResponse = await fetch('http://localhost:3002/api/execEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventSQLId: 'pageTriggers',
          params: { pageID }
        })
      });

      const triggersResult = await triggersResponse.json();
      const triggerCounts = {};
      (triggersResult.data || []).forEach(trigger => {
        triggerCounts[trigger.xref_id] = (triggerCounts[trigger.xref_id] || 0) + 1;
      });

      // Add counts to components
      const componentsWithCounts = components.map(comp => ({
        ...comp,
        propCount: propCounts[comp.id] || 0,
        triggerCount: triggerCounts[comp.id] || 0,
      }));

      console.log('🌲 ComponentTreeDirect: Components with counts:', componentsWithCounts);

      // Build tree structure
      const tree = buildComponentTree(componentsWithCounts);
      console.log('🌲 ComponentTreeDirect: Built tree:', tree);
      console.log('🌲 ComponentTreeDirect: Tree length:', tree.length);
      if (tree.length > 0) {
        console.log('🌲 ComponentTreeDirect: First tree node keys:', Object.keys(tree[0]));
        console.log('🌲 ComponentTreeDirect: First tree node comp_name:', tree[0].comp_name);
      }
      setTreeData(tree);
    } catch (error) {
      console.error('❌ ComponentTreeDirect: Error loading components:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading components...</div>
      </div>
    );
  }

  if (treeData.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>No components found for this page.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Component Tree (Direct MySQL)</h3>
      </div>
      <div style={styles.treeContainer}>
        {treeData.map(node => {
          console.log('🌲 Rendering tree node:', node);
          return (
            <TreeNode
              key={node.id}
              node={node}
              selectedId={selectedComponent?.id}
              onSelect={onComponentSelect}
            />
          );
        })}
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
    overflow: 'hidden',
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  treeContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '8px 0',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#999',
  },
};

export default ComponentTreeDirect;
