import React from 'react';
import { Handle, Position } from 'reactflow';

const FormNode = ({ data, selected }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        border: `2px solid ${selected ? '#10b981' : '#14b8a6'}`,
        backgroundColor: selected ? 'rgba(236, 253, 245, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        boxShadow: selected ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} />

      {/* Form Header */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${selected ? '#6ee7b7' : '#5eead4'}`,
          backgroundColor: selected ? '#ecfdf5' : '#f0fdfa',
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
          📝 {data.label}
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>
          Form
        </div>
      </div>

      {/* Form Body - Children render here */}
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

export default FormNode;
