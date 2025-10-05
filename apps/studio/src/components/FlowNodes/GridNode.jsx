import React from 'react';
import { Handle, Position } from 'reactflow';

const GridNode = ({ data, selected }) => {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '6px',
        border: `2px solid ${selected ? '#3b82f6' : '#6366f1'}`,
        backgroundColor: selected ? '#eff6ff' : '#ffffff',
        minWidth: '180px',
        boxShadow: selected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>
        📊 {data.label}
      </div>
      <div style={{ fontSize: '12px', color: '#64748b' }}>Grid</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default GridNode;
