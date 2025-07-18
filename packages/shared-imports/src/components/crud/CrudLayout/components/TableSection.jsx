import React from 'react';
import { Box } from '@mui/material';
import Table from '@crud/Table';
import AddButton from './AddButton';
import createLogger from '@utils/logger';

const log = createLogger('TableSection');

/**
 * TableSection component - Handles the table display using the new config structure
 * 
 * @param {Object} props - Component props
 * @param {Object} props.config - Table configuration object
 * @param {Function} props.onRowSelect - Handler for row selection
 * @param {Function} props.onAddNew - Handler for adding new items
 * @param {Function} props.onDelete - Handler for deleting items
 * @param {boolean} props.canAdd - Whether add button should be shown
 */
const TableSection = ({ 
  config,
  systemConfig,
  onRowSelect,
  onAddNew,
  onDelete,
  canAdd = true
}) => {
  if (!config) {
    log.warn('No table configuration provided');
    return null;
  }

  const idField = systemConfig?.primaryKey || 'id';
  const rowActions = config.rowActions || [];
  
  return (
    <>
      {canAdd && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
          <AddButton onClick={onAddNew} />
        </Box>
      )}
      
      <Table 
        config={config}
        data={tableData}
        selectedId={selectedId}
        idField={idField}
        onRowClick={onRowSelect}
        onDeleteClick={onDelete}
        loading={loading}
        rowActions={rowActions}
      />
    </>
  );
};

export default TableSection;
