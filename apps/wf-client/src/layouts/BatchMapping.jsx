import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Typography, Paper, styled, alpha } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DragIndicator } from '@mui/icons-material';
import { execEvent, createLogger, contextStore } from '@whatsfresh/shared-imports';
import WorksheetGenerator from '../components/reports/WorksheetGenerator.jsx';

const log = createLogger('BatchMapping');

// Styled components for drag-and-drop (currently unused)
// const _DraggableRow = styled('div')(({ theme, isDragging }) => ({
//   cursor: isDragging ? 'grabbing' : 'grab',
//   opacity: isDragging ? 0.5 : 1,
//   transition: 'opacity 0.2s ease',
//   '&:hover': {
//     backgroundColor: alpha(theme.palette.primary.main, 0.1),
//   },
// }));

const DropZone = styled(Paper, {
  shouldForwardProp: (prop) => !['isOver', 'canDrop'].includes(prop),
})(({ theme, isOver, canDrop }) => ({
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
  const routeParams = useParams();
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [mappedBatches, setMappedBatches] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZoneState, setDropZoneState] = useState({ isOver: false, canDrop: false });
  const [loading, setLoading] = useState({ gridRcpe: false, gridAvailable: false, gridMapped: false });

  // Set page title in contextStore when pageMap changes
  useEffect(() => {
    if (pageMap?.title) {
      contextStore.setParameter('pageTitle', pageMap.title);
    }
  }, [pageMap?.title]);

  // Get prodBtchID from route params or contextStore
  const prodBtchID = routeParams.prodBtchID || contextStore.getParameter('prodBtchID');
  
  useEffect(() => {
    log.debug('BatchMapping loaded with prodBtchID:', prodBtchID);
  }, [prodBtchID]);
  
  // Extract grid configurations from pageMap
  const { grids } = pageMap;
  const gridRcpe = grids?.gridRcpe || {};
  const gridAvailable = grids?.gridAvailable || {};
  const gridMapped = grids?.gridMapped || {};

  // Load recipe ingredients data on mount
  useEffect(() => {
    const loadRecipeData = async () => {
      try {
        setLoading(prev => ({ ...prev, gridRcpe: true }));
        log.debug('Loading recipe ingredients data...');
        
        const data = await execEvent('gridRcpe');
        setRecipeIngredients(data || []);
        log.debug('Recipe ingredients loaded:', data?.length || 0, 'items');
        
      } catch (error) {
        log.error('Failed to load recipe ingredients:', error);
        setRecipeIngredients([]);
      } finally {
        setLoading(prev => ({ ...prev, gridRcpe: false }));
      }
    };

    loadRecipeData();
  }, []);

  // Handle ingredient selection from recipe grid
  const handleIngredientSelection = useCallback(async (params) => {
    const ingredient = params.row;
    log.debug('Ingredient selected:', ingredient);
    setSelectedIngredient(ingredient);
    
    // Load available and mapped batches for the selected ingredient
    if (!prodBtchID) {
      log.warn('No prodBtchID available - cannot load batch data');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, gridAvailable: true, gridMapped: true }));
      
      // Load available batches (requires both ingrID and prodBtchID parameters)
      const availableParams = { ':ingrID': ingredient.ingrID, ':prodBtchID': prodBtchID };
      const availableData = await execEvent('gridAvailable', availableParams);
      setAvailableBatches(availableData || []);
      log.debug('Available batches loaded:', availableData?.length || 0, 'items for ingrID:', ingredient.ingrID, 'prodBtchID:', prodBtchID);
      
      // Load mapped batches (requires both ingrID and prodBtchID parameters)  
      const mappedParams = { ':ingrID': ingredient.ingrID, ':prodBtchID': prodBtchID };
      const mappedData = await execEvent('gridMapped', mappedParams);
      setMappedBatches(mappedData || []);
      log.debug('Mapped batches loaded:', mappedData?.length || 0, 'items for ingrID:', ingredient.ingrID, 'prodBtchID:', prodBtchID);
      
    } catch (error) {
      log.error('Failed to load batch data for ingredient:', ingredient.ingrID, error);
      setAvailableBatches([]);
      setMappedBatches([]);
    } finally {
      setLoading(prev => ({ ...prev, gridAvailable: false, gridMapped: false }));
    }
  }, [prodBtchID]);

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
          getRowId={(row) => {
            // Map primary keys to the id that MUI DataGrid expects
            return row.prodRcpeID || row.ingrBtchID || row.mapID || row.id;
          }}
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          {pageMap.title || 'Batch Mapping'}
        </Typography>
        
        {/* Worksheet Generation Button */}
        <WorksheetGenerator 
          prodBtchID={prodBtchID}
          onError={(error) => log.error('Worksheet generation error:', error)}
        />
      </Box>
      
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 120px)' }}>
        {/* Left Panel - Recipe Ingredients (Tallest) */}
        <Grid size={4} sx={{ height: '100%' }}>
          {renderDraggableGrid(gridRcpe, recipeIngredients, gridRcpe.title || 'Recipe Ingredients', 'recipe')}
        </Grid>
        
        {/* Center Panel - Mapped Batches (3 rows + scroll) */}
        <Grid size={4} sx={{ height: '100%' }}>
          {renderDraggableGrid(
            gridMapped, 
            mappedBatches, 
            'Mapped Ingredient Batch(es)', 
            'mapped'
          )}
        </Grid>
        
        {/* Right Panel - Available Batches (20 latest) */}
        <Grid size={4} sx={{ height: '100%' }}>
          {renderDraggableGrid(
            gridAvailable, 
            availableBatches, 
            'Ingredient Batch Choices', 
            'available'
          )}
        </Grid>
      </Grid>
      
      {/* Debug info */}
      <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="caption" display="block">
          ProdBtchID: {prodBtchID || 'NOT FOUND'} | Recipe Ingredients: {recipeIngredients.length} loaded {loading.gridRcpe && '(loading...)'}
        </Typography>
        {selectedIngredient && (
          <>
            <Typography variant="caption" display="block">
              Selected: {selectedIngredient.ingrName} (ID: {selectedIngredient.ingrID})
            </Typography>
            <Typography variant="caption" display="block">
              Available Batches: {availableBatches.length} {loading.gridAvailable && '(loading...)'}
            </Typography>
            <Typography variant="caption" display="block">
              Mapped Batches: {mappedBatches.length} {loading.gridMapped && '(loading...)'}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default BatchMapping;
