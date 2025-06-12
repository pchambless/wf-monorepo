import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Grid } from '@mui/material';
import TableSection from './components/TableSection';
import FormSection from './components/FormSection';
import PageMapError from './components/PageMapError';
import usePageMapValidation from './hooks/usePageMapValidation';
import useParentID from './hooks/useParentID';
import useCrudActions from './hooks/useCrudActions';
import dataStore from '@stores/dataStore';
import createLogger from '@utils/logger';

const log = createLogger('CrudLayout');

const CrudLayout = observer(({ pageMap }) => {
  const formRef = useRef(null);
  const { isValid, errors } = usePageMapValidation(pageMap);
  const { parentId } = useParentID(pageMap);
  const { 
    handleRowSelect, 
    handleAddNew, 
    handleDelete,
    canAdd, 
    canDelete 
  } = useCrudActions(pageMap, formRef, parentId);
  
  // Validate pageMap configuration
  if (!isValid) {
    return <PageMapError errors={errors} />;
  }

  // Extract configuration
  const { pageConfig } = pageMap || {};
  const listEvent = pageConfig?.listEvent;
  
  // Initialize page when component mounts
  useEffect(() => {
    // Store the pageMap in dataStore for future refreshes
    dataStore.setPageMap(pageMap);
    
    // Fetch data using the centralized fetchData method
    if (listEvent) {
      dataStore.fetchData(listEvent, pageMap);
    } else {
      log.warn('No listEvent configured in pageMap');
    }
  }, [pageMap, listEvent]);
  
  // Check if we have required configuration
  if (!pageMap || !pageMap.columnMap || !listEvent) {
    log.warn('Missing required configuration');
    return (
      <PageMapError errors={[
        'Missing configuration for CRUD layout.',
        !pageMap ? 'No pageMap provided.' : '',
        pageMap && !pageMap.columnMap ? 'No columnMap defined in pageMap.' : '',
        !listEvent ? 'No listEvent provided in pageConfig.' : ''
      ].filter(Boolean)} />
    );
  }
  
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={2}>
        <Grid item xs={7}>
          <TableSection 
            pageMap={pageMap}
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
            pageMap={pageMap}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

export default CrudLayout;
