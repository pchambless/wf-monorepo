import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Grid } from '@mui/material';
import TableSection from './components/TableSection';
import FormSection from './components/FormSection';
import PageMapError from './components/PageMapError';
import ConfigError from './components/ConfigError';
import useOptimizedConfigValidation from './hooks/useOptimizedConfigValidation';
import useParentID from './hooks/useParentID';
import useCrudActions from './hooks/useCrudActions';
import dataStore from '@stores/dataStore';
import createLogger from '@utils/logger';

const log = createLogger('CrudLayout');

const CrudLayout = observer(({ pageMap }) => {
  const formRef = useRef(null);
  const { isValid, errors } = useOptimizedConfigValidation(pageMap); // Update validator
  const { parentId } = useParentID(pageMap.systemConfig); // Updated hook
  const { 
    handleRowSelect, 
    handleAddNew, 
    handleDelete,
    canAdd, 
    canDelete 
  } = useCrudActions(pageMap, formRef, parentId);
  
  // Validate configuration
  if (!isValid) {
    return <ConfigError errors={errors} />;
  }

  const { systemConfig, tableConfig, formConfig } = pageMap;
  
  // Initialize page when component mounts
  useEffect(() => {
    // Store the pageMap in dataStore for future refreshes
    dataStore.setPageMap(pageMap);
    
    // Fetch data using the centralized fetchData method
    if (systemConfig.listEvent) {
      dataStore.fetchData(systemConfig.listEvent, pageMap);
    } else {
      log.warn('No listEvent configured in systemConfig');
    }
  }, [pageMap, systemConfig.listEvent]);
  
  // Simplified validation check - no need to reference legacy properties
  if (!pageMap || !tableConfig || !systemConfig.listEvent) {
    log.warn('Missing required configuration');
    return (
      <PageMapError errors={[
        'Missing configuration for CRUD layout.',
        !pageMap ? 'No pageMap provided.' : '',
        !tableConfig ? 'No tableConfig defined in pageMap.' : '',
        !systemConfig.listEvent ? 'No listEvent provided in systemConfig.' : ''
      ].filter(Boolean)} />
    );
  }
  
  // Clean, forward-looking return structure
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={2}>
        <Grid item xs={7}>
          <TableSection 
            config={tableConfig}
            onRowSelect={handleRowSelect}
            onAddNew={handleAddNew}
            onDelete={handleDelete}
            canAdd={canAdd}
            canDelete={canDelete}
          />
        </Grid>
        
        <Grid item xs={5}>
          <FormSection 
            ref={formRef}
            config={formConfig}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

export default CrudLayout;
