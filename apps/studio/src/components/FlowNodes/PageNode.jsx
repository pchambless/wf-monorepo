import React from 'react';
import { Handle, Position } from 'reactflow';

const PageNode = ({ data, selected }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        border: `2px solid ${selected ? '#8b5cf6' : '#a855f7'}`,
        backgroundColor: selected ? 'rgba(243, 232, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)',
        boxShadow: selected ? '0 4px 12px rgba(139, 92, 246, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} />

      {/* Page Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: `1px solid ${selected ? '#a78bfa' : '#c4b5fd'}`,
          backgroundColor: selected ? '#f3e8ff' : '#ede9fe',
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
          📄 {data.label}
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>
          Page
        </div>
      </div>

      {/* Page Body - Children render here */}
      <div
        style={{
          padding: '12px',
          minHeight: '80px',
        }}
      />

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default PageNode;
