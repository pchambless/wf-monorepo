import React from 'react';
import { Handle, Position } from 'reactflow';

const GridNode = ({ data, selected }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        border: `2px solid ${selected ? '#3b82f6' : '#6366f1'}`,
        backgroundColor: selected ? 'rgba(239, 246, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        boxShadow: selected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} />

      {/* Grid Header */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${selected ? '#93c5fd' : '#a5b4fc'}`,
          backgroundColor: selected ? '#eff6ff' : '#eef2ff',
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
          📊 {data.label}
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>
          Grid
        </div>
      </div>

      {/* Grid Body */}
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

export default GridNode;
