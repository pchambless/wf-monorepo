import React from 'react';
import { Handle, Position } from 'reactflow';

const PageNode = ({ data, selected }) => {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '6px',
        border: `2px solid ${selected ? '#8b5cf6' : '#a855f7'}`,
        backgroundColor: selected ? '#f3e8ff' : '#ffffff',
        minWidth: '200px',
        boxShadow: selected ? '0 4px 12px rgba(139, 92, 246, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '16px', color: '#1e293b', marginBottom: '4px' }}>
        📄 {data.label}
      </div>
      <div style={{ fontSize: '12px', color: '#64748b' }}>Page</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default PageNode;
