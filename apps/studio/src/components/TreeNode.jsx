import React, { useState } from 'react';
import { getComponentIcon } from '../utils/buildComponentTree';

const TreeNode = ({ node, selectedId, onSelect, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.id === selectedId;

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleClick = () => {
    onSelect(node);
  };

  const indent = level * 20;

  return (
    <div style={styles.nodeContainer}>
      <div
        style={{
          ...styles.nodeRow,
          paddingLeft: `${indent}px`,
          backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
          borderLeft: isSelected ? '3px solid #1976d2' : '3px solid transparent',
        }}
        onClick={handleClick}
      >
        {/* Expand/collapse button */}
        {hasChildren && (
          <span
            style={styles.expandButton}
            onClick={handleToggle}
          >
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span style={styles.spacer}></span>}

        {/* Component icon and name */}
        <span style={styles.icon}>{getComponentIcon(node.comp_type)}</span>
        <span style={styles.name}>{String(node.comp_name || 'unnamed')}</span>
        <span style={styles.type}>({String(node.comp_type || 'unknown')})</span>

        {/* Badges for props and triggers */}
        {node.propCount > 0 && (
          <span style={styles.badge}>📋 {node.propCount}</span>
        )}
        {node.triggerCount > 0 && (
          <span style={styles.badge}>🔧 {node.triggerCount}</span>
        )}
      </div>

      {/* Render children */}
      {hasChildren && isExpanded && (
        <div style={styles.children}>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  nodeContainer: {
    width: '100%',
  },
  nodeRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 8px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.2s',
    gap: '6px',
  },
  expandButton: {
    width: '16px',
    fontSize: '10px',
    cursor: 'pointer',
    color: '#666',
  },
  spacer: {
    width: '16px',
  },
  icon: {
    fontSize: '16px',
  },
  name: {
    fontWeight: '500',
    fontSize: '14px',
    color: '#333',
  },
  type: {
    fontSize: '12px',
    color: '#666',
  },
  badge: {
    fontSize: '11px',
    padding: '2px 6px',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
    color: '#666',
    marginLeft: '4px',
  },
  children: {
    width: '100%',
  },
};

export default TreeNode;
