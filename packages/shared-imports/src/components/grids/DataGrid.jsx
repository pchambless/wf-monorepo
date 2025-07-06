import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { execEvent } from '@whatsfresh/shared-events';
import { ArrowForward, ArrowBack } from '@mui/icons-material';

/**
 * Reusable DataGrid with data loading and action capabilities
 */
export const DataGridWidget = ({
  id,
  eventName,
  params = {},
  columns,
  title,
  height = 400,
  actionButtons = [],
  onSelectionChange,
  ...props
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState([]);

  // Same data loading pattern as SelectWidget
  useEffect(() => {
    // Similar data loading logic...
  }, [eventName, JSON.stringify(params)]);

  // Handle selection change
  const handleSelectionChange = (newSelection) => {
    setSelection(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  return (
    <Box sx={{ height, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columns}
        loading={loading}
        checkboxSelection
        onSelectionModelChange={handleSelectionChange}
        // Other grid props
        {...props}
      />
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        {actionButtons.map((action) => (
          <Button
            key={action.id}
            variant="contained"
            startIcon={action.icon}
            onClick={() => action.onClick(selection)}
            disabled={action.disabled || selection.length === 0}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};