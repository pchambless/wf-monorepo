import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import Table from '../Table';
import Form from '../Form';
import AddButton from './components/AddButton';
import { execEvent, createLogger, getEventType, contextStore } from '@whatsfresh/shared-imports';

const log = createLogger('CrudLayout');

const CrudLayout = ({ pageMap }) => {
  console.log('🔍 CrudLayout mounting with pageMap:', pageMap);
  
  const formRef = useRef(null);
  const routeParams = useParams();

  // Set page title in contextStore when pageMap changes
  useEffect(() => {
    if (pageMap?.title) {
      contextStore.setParameter('pageTitle', pageMap.title);
    }
  }, [pageMap?.title]);

  // Internal state - no external dataStore needed!
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formMode, setFormMode] = useState('SELECT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data using execEvent from shared-imports
  const fetchData = async (listEvent, additionalParams = {}) => {
    if (!listEvent) return;

    try {
      setLoading(true);
      setError(null);
      log.debug('Fetching data for:', listEvent);

      // Look up event configuration to get required parameters
      const eventConfig = getEventType(listEvent);
      const eventParams = eventConfig?.params || [];
      
      // Build parameters with colon prefix (ready for execEvent)
      const params = { ...additionalParams };
      
      eventParams.forEach(param => {
        // param already has colon: ":acctID", ":ingrTypeID", etc.
        const paramName = param.replace(':', '');
        
        // Always use current account ID for acctID
        if (paramName === 'acctID') {
          params[param] = contextStore.getParameter('acctID') || routeParams.acctID;
        } 
        // For other params, try to get from route params
        else if (routeParams[paramName]) {
          params[param] = routeParams[paramName];
        }
        // For optional parameters, set to null (SQL will handle OR IS NULL)
        else {
          params[param] = null;
        }
      });

      log.debug('Calling execEvent with params:', params);
      const data = await execEvent(listEvent, params);
      setTableData(data || []);
      log.debug('Data loaded:', data?.length || 0, 'rows');

    } catch (err) {
      log.error('Failed to fetch data:', err);
      setError(err.message);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // CRUD handlers with internal state
  const handleRowSelect = (row) => {
    setSelectedRow(row);
    setFormMode('EDIT');
    
    // Set the primaryKey parameter in contextStore for universal access
    const listEvent = systemConfig?.listEvent;
    const primaryKey = systemConfig?.primaryKey || 'id';
    const primaryKeyValue = row?.row?.[primaryKey] || row?.[primaryKey];
    
    if (listEvent && primaryKeyValue) {
      contextStore.setEvent(listEvent, primaryKeyValue);
      log.debug('Row selected and parameter set:', { 
        listEvent, 
        primaryKey, 
        primaryKeyValue,
        contextStoreValue: contextStore.getParameter(primaryKey)
      });
    } else {
      log.warn('Could not set context parameter - missing data:', {
        listEvent,
        primaryKey,
        primaryKeyValue,
        rowData: row
      });
    }
  };

  const handleAddNew = () => {
    setSelectedRow(null);
    setFormMode('ADD');
    log.debug('Add new item initiated');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // TODO: Implement delete via execEvent when delete events are available
      log.debug('Delete requested for:', id);
      // For now, just refresh data
      fetchData(systemConfig.listEvent);
    }
  };

  // Simple permission checks
  const canAdd = pageMap.systemConfig?.permissions?.create !== false;
  const canDelete = pageMap.systemConfig?.permissions?.delete !== false;

  const { systemConfig, tableConfig, formConfig } = pageMap;

  // Fetch data when component mounts or listEvent changes
  useEffect(() => {
    if (systemConfig?.listEvent) {
      fetchData(systemConfig.listEvent);
    } else {
      log.warn('No listEvent configured in systemConfig');
    }
  }, [systemConfig?.listEvent]);

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
    // Refresh data after save
    const listEvent = pageMap?.eventConfig?.listEvent;
    if (listEvent) {
      fetchData(listEvent);
    }
  };

  const handleFormCancel = () => {
    setSelectedRow(null);
    setFormMode('SELECT');
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
            pageMap={pageMap}
            eventData={{
              data: tableData,
              loading,
              onRowClick: handleRowSelect,
              idField
            }}
          />
        </Grid>

        <Grid item xs={5}>
          <Form
            ref={formRef}
            pageMap={pageMap}
            data={selectedRow?.row || selectedRow || {}}
            mode={formMode}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CrudLayout;
