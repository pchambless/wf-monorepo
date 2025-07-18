import React, { useState, useCallback } from 'react';
import { Box, Grid, Typography, Paper, styled, alpha } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DragIndicator } from '@mui/icons-material';

// Styled components for drag-and-drop
const DraggableRow = styled('div')(({ theme, isDragging }) => ({
  cursor: isDragging ? 'grabbing' : 'grab',
  opacity: isDragging ? 0.5 : 1,
  transition: 'opacity 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const DropZone = styled(Paper)(({ theme, isOver, canDrop }) => ({
  minHeight: 300,
  transition: 'all 0.3s ease',
  backgroundColor: isOver && canDrop 
    ? alpha(theme.palette.success.main, 0.1)
    : 'inherit',
  border: isOver && canDrop 
    ? `2px dashed ${theme.palette.success.main}`
    : '1px solid transparent',
}));

/**
 * BatchMapping layout - Drag-and-drop interface for batch mapping
 * Based on AppSmith prototype layout with enhanced drag-and-drop functionality
 */
const BatchMapping = ({ pageMap }) => {
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [mappedBatches, setMappedBatches] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZoneState, setDropZoneState] = useState({ isOver: false, canDrop: false });
  
  // Extract grid configurations from pageMap
  const { grids } = pageMap;
  const gridRcpe = grids?.gridRcpe || {};
  const gridAvailable = grids?.gridAvailable || {};
  const gridMapped = grids?.gridMapped || {};

  // Handle ingredient selection from recipe grid
  const handleIngredientSelection = useCallback((params) => {
    console.log('Ingredient selected:', params.row);
    setSelectedIngredient(params.row);
    // TODO: Trigger data loading for available and mapped grids
    // This would call execEvent for gridAvailable and gridMapped with ingrID parameter
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((event, sourceGrid, rowData) => {
    console.log('Drag started:', { sourceGrid, rowData });
    setDraggedItem({ sourceGrid, rowData });
    event.dataTransfer.setData('application/json', JSON.stringify({ sourceGrid, rowData }));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDropZoneState({ isOver: false, canDrop: false });
  }, []);

  const handleDragOver = useCallback((event, targetGrid) => {
    event.preventDefault();
    
    if (draggedItem) {
      const canDrop = (
        (draggedItem.sourceGrid === 'available' && targetGrid === 'mapped') ||
        (draggedItem.sourceGrid === 'mapped' && targetGrid === 'available')
      );
      
      setDropZoneState({ isOver: true, canDrop });
      event.dataTransfer.dropEffect = canDrop ? 'move' : 'none';
    }
  }, [draggedItem]);

  const handleDragLeave = useCallback(() => {
    setDropZoneState({ isOver: false, canDrop: false });
  }, []);

  const handleDrop = useCallback((event, targetGrid) => {
    event.preventDefault();
    
    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      const { sourceGrid, rowData } = data;
      
      console.log('Drop:', { sourceGrid, targetGrid, rowData });
      
      // Handle the mapping/unmapping logic
      if (sourceGrid === 'available' && targetGrid === 'mapped') {
        // Map batch: move from available to mapped
        setAvailableBatches(prev => prev.filter(item => item.ingrBtchID !== rowData.ingrBtchID));
        setMappedBatches(prev => [...prev, rowData]);
        console.log('Mapped batch:', rowData.ingrBtchNbr);
        // TODO: Call API to save mapping
      } else if (sourceGrid === 'mapped' && targetGrid === 'available') {
        // Unmap batch: move from mapped to available
        setMappedBatches(prev => prev.filter(item => item.id !== rowData.id));
        setAvailableBatches(prev => [...prev, rowData]);
        console.log('Unmapped batch:', rowData.ingrBtchNbr);
        // TODO: Call API to remove mapping
      }
    } catch (error) {
      console.error('Drop error:', error);
    }
    
    setDropZoneState({ isOver: false, canDrop: false });
  }, []);

  // Enhanced grid renderer with drag-and-drop
  const renderDraggableGrid = (gridConfig, data = [], title = '', gridType = '') => {
    const { columns = [], selectable = false, draggable = false } = gridConfig;
    
    // Add drag handle column for draggable grids
    const enhancedColumns = draggable ? [
      {
        field: 'dragHandle',
        headerName: '',
        width: 50,
        sortable: false,
        filterable: false,
        renderCell: () => <DragIndicator sx={{ color: 'action.active', cursor: 'grab' }} />
      },
      ...columns
    ] : columns;

    return (
      <DropZone 
        elevation={2} 
        sx={{ height: '100%', p: 2 }}
        isOver={dropZoneState.isOver}
        canDrop={dropZoneState.canDrop}
        onDragOver={(e) => handleDragOver(e, gridType)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, gridType)}
      >
        <Typography variant="h6" gutterBottom color="primary">
          {title}
        </Typography>
        <DataGrid
          rows={data}
          columns={enhancedColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick={!selectable}
          onRowClick={selectable ? handleIngredientSelection : undefined}
          autoHeight
          sx={{ 
            minHeight: 250,
            '& .MuiDataGrid-row': {
              cursor: draggable ? 'grab' : 'default',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: draggable ? alpha('#1976d2', 0.08) : 'inherit',
            }
          }}
          getRowId={(row) => row.id || row.ingrID || row.ingrBtchID}
          componentsProps={{
            row: {
              draggable: draggable,
              onDragStart: (e) => {
                const rowData = data.find(item => 
                  (item.id || item.ingrID || item.ingrBtchID) === e.currentTarget.getAttribute('data-id')
                );
                if (rowData) {
                  handleDragStart(e, gridType, rowData);
                }
              },
              onDragEnd: handleDragEnd,
            }
          }}
        />
        
        {/* Drop zone indicator */}
        {dropZoneState.isOver && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: dropZoneState.canDrop 
                ? alpha('#4caf50', 0.1) 
                : alpha('#f44336', 0.1),
              border: `2px dashed ${dropZoneState.canDrop ? '#4caf50' : '#f44336'}`,
              borderRadius: 1,
              pointerEvents: 'none',
              zIndex: 1000
            }}
          >
            <Typography variant="h6" color={dropZoneState.canDrop ? 'success.main' : 'error.main'}>
              {dropZoneState.canDrop ? 'Drop to Map/Unmap' : 'Invalid Drop Zone'}
            </Typography>
          </Box>
        )}
      </DropZone>
    );
  };

  return (
    <Box sx={{ height: '100vh', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {pageMap.title || 'Batch Mapping'}
      </Typography>
      
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 120px)' }}>
        {/* Left Panel - Recipe Ingredients (Tallest) */}
        <Grid item xs={4} sx={{ height: '100%' }}>
          {renderDraggableGrid(gridRcpe, [], gridRcpe.title || 'Recipe Ingredients', 'recipe')}
        </Grid>
        
        {/* Center Panel - Mapped Batches (3 rows + scroll) */}
        <Grid item xs={4} sx={{ height: '100%' }}>
          {renderDraggableGrid(
            gridMapped, 
            mappedBatches, 
            'Mapped Ingredient Batch(es)', 
            'mapped'
          )}
        </Grid>
        
        {/* Right Panel - Available Batches (20 latest) */}
        <Grid item xs={4} sx={{ height: '100%' }}>
          {renderDraggableGrid(
            gridAvailable, 
            availableBatches, 
            'Ingredient Batch Choices', 
            'available'
          )}
        </Grid>
      </Grid>
      
      {/* Debug info */}
      {selectedIngredient && (
        <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption">
            Selected Ingredient: {selectedIngredient.ingrName} (ID: {selectedIngredient.ingrID})
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BatchMapping;