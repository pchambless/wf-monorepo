import React from 'react';
import { Typography, Box } from '@mui/material';

// Completely isolated component that takes only primitive values
const SQLPreviewContent = ({ 
  sqlStatement, 
  method, 
  entityId, 
  dmlMap 
}) => {
  // No observables should ever reach this component
  return (
    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <h3>SQL Preview</h3>
      <pre style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '1rem', 
        borderRadius: '4px',
        maxHeight: '400px',
        overflow: 'auto' 
      }}>
        {sqlStatement}
      </pre>
      <div>
        <p><strong>Method:</strong> {method}</p>
        <p><strong>Entity:</strong> {entityId}</p>
      </div>
      <Typography variant="body2" color="text.secondary">
        Execution details:
      </Typography>
      <Box sx={{ 
        backgroundColor: '#f5f5f5', 
        p: 2, 
        borderRadius: 1,
        mb: 2, 
        overflow: 'auto',
        fontSize: '0.8rem'
      }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {dmlMap}
        </pre>
      </Box>
    </div>
  );
};

export default SQLPreviewContent;
