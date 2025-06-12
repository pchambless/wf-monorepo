import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Box, Button 
} from '@mui/material';
import tracker from '../../../tracker';
import { usePollVar, triggerAction } from '../../../utils/externalStoreDel';
import { MetricsColumns } from './columns/metricsColumns';

const MetricsTable = () => {
  const [metrics, setMetrics] = useState([]);
  
  // Use Redux hook to watch for metrics updates
  const actionMetrics = usePollVar(':actionMetrics', null);
  
  // Load metrics whenever the metrics variable changes
  useEffect(() => {
    const currentMetrics = tracker.getMetrics();
    setMetrics(currentMetrics || []);
  }, [actionMetrics]); // Re-run when actionMetrics changes
  
  const handleClearMetrics = () => {
    tracker.clearMetrics();
    // Trigger an update after clearing
    triggerAction(':actionMetrics', { cleared: true, timestamp: Date.now() });
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleClearMetrics}
        >
          Clear Metrics
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {MetricsColumns.columns.map(col => (
                <TableCell 
                  key={col.field}
                  align={col.align}
                  style={{ width: col.width }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {metrics.map((metric, index) => (
              <TableRow key={metric.id || `metric-${index}`}>
                <TableCell>{metric.name || 'Unknown'}</TableCell>
                <TableCell>{new Date(metric.timestamp).toLocaleString() || 'Invalid Date'}</TableCell>
                {/* Add other cells based on your metrics structure */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default MetricsTable;
