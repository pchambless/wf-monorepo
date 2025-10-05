import React from 'react';
import { Handle, Position } from 'reactflow';

const ContainerNode = ({ data, selected }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        border: `2px solid ${selected ? '#f59e0b' : '#f97316'}`,
        backgroundColor: selected ? 'rgba(254, 243, 199, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        boxShadow: selected ? '0 4px 12px rgba(245, 158, 11, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} />

      {/* Container Header */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${selected ? '#fbbf24' : '#fb923c'}`,
          backgroundColor: selected ? '#fef3c7' : '#ffedd5',
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
          📦 {data.label}
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>
          Container
        </div>
      </div>

      {/* Container Body - Children render here */}
      <div
        style={{
          padding: '12px',
          minHeight: '60px',
        }}
      />

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default ContainerNode;
