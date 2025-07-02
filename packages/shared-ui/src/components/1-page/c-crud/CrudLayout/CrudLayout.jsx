import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Grid } from '@mui/material';
import Table from '../Table';
import Form from '../Form';
import AddButton from './components/AddButton';
import createLogger from '@whatsfresh/shared-imports/logger';

const log = createLogger('CrudLayout');

const CrudLayout = observer(({ pageMap, dataStore }) => {
  const formRef = useRef(null);
  
  // Simple CRUD handlers using direct MobX calls
  const handleRowSelect = (row) => {
    dataStore.selectRow(row);
    dataStore.setFormMode('EDIT');
    log.debug('Row selected:', row);
  };
  
  const handleAddNew = () => {
    dataStore.selectRow(null);
    dataStore.setFormMode('ADD');
    log.debug('Add new item initiated');
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      dataStore.deleteItem(id).then(() => {
        dataStore.refreshData();
        log.debug('Item deleted:', id);
      });
    }
  };
  
  // Simple permission checks
  const canAdd = pageMap.systemConfig?.permissions?.create !== false;
  const canDelete = pageMap.systemConfig?.permissions?.delete !== false;

  const { systemConfig, tableConfig, formConfig } = pageMap;
  
  // Initialize page when component mounts
  useEffect(() => {
    if (systemConfig?.listEvent) {
      dataStore.setPageMap(pageMap);
      dataStore.fetchData(systemConfig.listEvent, pageMap);
      log.debug('Fetching data for:', systemConfig.listEvent);
    } else {
      log.warn('No listEvent configured in systemConfig');
    }
  }, [pageMap, systemConfig?.listEvent, dataStore]);
  
  // Simple validation - if things are missing, we'll just log and continue
  if (!pageMap || !tableConfig || !systemConfig?.listEvent) {
    const errors = [
      !pageMap && 'No pageMap provided',
      !tableConfig && 'No tableConfig defined in pageMap', 
      !systemConfig?.listEvent && 'No listEvent provided in systemConfig'
    ].filter(Boolean);
    
    log.warn('Missing required configuration, but continuing anyway:', errors);
    // Just continue - if it blows up, we'll fix it!
  }
  
  const idField = systemConfig.primaryKey || 'id';
  const rowActions = tableConfig.rowActions || [];
  
  // Handle form events
  const handleFormSave = () => {
    dataStore.refreshData();
  };
  
  const handleFormCancel = () => {
    dataStore.selectRow(null);
    dataStore.setFormMode('SELECT');
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={2}>
        <Grid item xs={7}>
          {canAdd && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <AddButton onClick={handleAddNew} />
            </Box>
          )}
          
          <Table 
            config={tableConfig}
            data={dataStore.tableData}
            selectedId={dataStore.selectedId}
            idField={idField}
            onRowClick={handleRowSelect}
            onDeleteClick={handleDelete}
            loading={dataStore.loading}
            rowActions={rowActions}
          />
        </Grid>
        
        <Grid item xs={5}>
          <Form 
            ref={formRef}
            config={formConfig}
            data={dataStore.selectedRow || {}}
            mode={dataStore.formMode}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

export default CrudLayout;
