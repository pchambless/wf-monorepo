import React from 'react';
import { Box } from '@mui/material';
import Table from '@crud/Table';  // Adjusted import path for Table component
import AddButton from './AddButton';
import dataStore from '@stores/dataStore';
import createLogger from '@utils/logger';

const log = createLogger('TableSection');

/**
 * TableSection component - Handles the table display and add button
 * 
 * @param {Object} props - Component props
 * @param {Object} props.pageMap - Page configuration object
 * @param {Function} props.onRowSelect - Handler for row selection
 * @param {Function} props.onAddNew - Handler for adding new items
 * @param {Function} props.onDelete - Handler for deleting items
 */
const TableSection = ({ 
  pageMap,
  onRowSelect,
  onAddNew,
  onDelete,
  canAdd = true
}) => {
  const { pageConfig } = pageMap || {};
  const idField = pageConfig?.idField || 'id';
  
  // Debug log to verify actions are present
  log.debug('Table actions:', pageMap?.actions?.rowActions);
  
  return (
    <>
      {canAdd && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
          <AddButton onClick={onAddNew} />
        </Box>
      )}
      
      <Table 
        pageMap={pageMap}
        tableConfig={{
          data: dataStore.tableData,
          selectedId: dataStore.selectedId,
          idField: idField,
          onRowClick: onRowSelect,
          onDeleteClick: onDelete,
          loading: dataStore.loading,
          // Be more specific about what actions we're passing
          rowActions: pageMap?.actions?.rowActions || []
        }}
      />
    </>
  );
};

export default TableSection;
