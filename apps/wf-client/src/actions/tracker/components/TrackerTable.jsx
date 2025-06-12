import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Typography 
} from '@mui/material';
import { usePollVar } from '../../../utils/externalStoreDel';
import { ActionColumns } from './columns/actionsColumns';

const TrackerTable = () => {
  const [actions, setActions] = useState([]);
  
  // Use Redux hook to watch for history updates
  const actionHistory = usePollVar(':actionHistory', null);
  
  useEffect(() => {
    // If you have a tracker or similar service to get history:
    try {
      // Assuming there's a tracker.getHistory() method - replace with actual method
      const history = window.tracker?.getHistory?.() || [];
      setActions(history);
    } catch (err) {
      console.error('Failed to load action history:', err);
    }
  }, [actionHistory]); // Re-run whenever actionHistory changes

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {ActionColumns.columns.map(col => (
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
          {actions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={ActionColumns.columns.length} align="center">
                <Typography color="textSecondary">
                  No actions recorded yet
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            actions.map(action => (
              <TableRow key={action.id}>
                {ActionColumns.columns.map(col => (
                  <TableCell 
                    key={col.field}
                    align={col.align}
                    sx={col.multiline ? { whiteSpace: 'pre-wrap' } : undefined}
                  >
                    {col.formatter 
                      ? col.formatter(action[col.field])
                      : action[col.field]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TrackerTable;
