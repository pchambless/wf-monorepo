import React from 'react';
import { Handle, Position } from 'reactflow';

const DefaultNode = ({ data, selected }) => {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '6px',
        border: `2px solid ${selected ? '#64748b' : '#94a3b8'}`,
        backgroundColor: selected ? '#f1f5f9' : '#ffffff',
        minWidth: '180px',
        boxShadow: selected ? '0 4px 12px rgba(100, 116, 139, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>
        {data.comp_type === 'Button' ? '🔘' : '📌'} {data.label}
      </div>
      <div style={{ fontSize: '12px', color: '#64748b' }}>{data.comp_type}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default DefaultNode;
