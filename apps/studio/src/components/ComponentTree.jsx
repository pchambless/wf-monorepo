import React, { useEffect, useState } from 'react';
import TreeNode from './TreeNode';
import { buildComponentTree } from '../utils/buildComponentTree';
import { execEvent } from '../utils/api';

const ComponentTree = ({ pageID, selectedComponent, onComponentSelect }) => {
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
      console.log('🌲 ComponentTree: Loading components from MySQL for pageID:', pageID);

      // Load components directly from MySQL
      const compResponse = await execEvent('getPageComponents', { pageID });
      const components = compResponse.data || [];

      console.log('🌲 ComponentTree: Found components:', components.length);
      if (components.length > 0) {
        console.log('🌲 ComponentTree: First component:', JSON.stringify(components[0], null, 2));
      }

      // Load props counts from MySQL
      const propsCountResponse = await execEvent('getPagePropsCounts', { pageID });
      const propCountsArray = propsCountResponse.data || [];
      const propCounts = {};
      propCountsArray.forEach(item => {
        propCounts[item.xref_id] = item.prop_count;
      });

      // Load trigger counts from MySQL
      const triggerCountResponse = await execEvent('getPageTriggerCounts', { pageID });
      const triggerCountsArray = triggerCountResponse.data || [];
      const triggerCounts = {};
      triggerCountsArray.forEach(item => {
        triggerCounts[item.xref_id] = item.trigger_count;
      });

      // Add counts to components
      const componentsWithCounts = components.map(comp => ({
        ...comp,
        propCount: propCounts[comp.id] || 0,
        triggerCount: triggerCounts[comp.id] || 0,
      }));

      console.log('🌲 ComponentTree: Components with counts from MySQL:', componentsWithCounts);

      // Build tree structure
      const tree = buildComponentTree(componentsWithCounts);
      console.log('🌲 ComponentTree: Built tree:', tree);
      setTreeData(tree);
    } catch (error) {
      console.error('❌ ComponentTree: Error loading components from MySQL:', error);
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
        <h3 style={styles.title}>Component Tree</h3>
      </div>
      <div style={styles.treeContainer}>
        {treeData.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            selectedId={selectedComponent?.id}
            onSelect={onComponentSelect}
          />
        ))}
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

export default ComponentTree;
