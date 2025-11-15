import React from 'react';

const DirectRenderer = ({ pageConfig }) => {
  if (!pageConfig) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>
        No page configuration loaded
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>{pageConfig.pageName || 'Page'}</h2>
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
      }}>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(pageConfig, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DirectRenderer;
