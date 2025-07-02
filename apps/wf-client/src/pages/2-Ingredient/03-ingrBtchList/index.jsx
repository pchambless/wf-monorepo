import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { CrudLayout } from '@whatsfresh/shared-ui';
import pageMap from '@whatsfresh/shared-config/src/pageMap/ingrBtchList';
import dataStore from '@stores/dataStore';
import navigationStore from '@stores/navigationStore';
import createLogger from '@utils/logger';

const log = createLogger('Ingredient Batches');

const ingrBtchListPage = observer(() => {
  useEffect(() => {
    log.debug('ingrBtchListPage component mounted');
    
    // Set breadcrumbs and fetch data
    navigationStore.setBreadcrumbs([
      { label: pageMap.title, path: null }
    ]);
    
    // Fetch data using the listEvent from pageMap
    if (pageMap.systemConfig?.listEvent) {
      log.debug('Fetching data for:', pageMap.systemConfig.listEvent);
      dataStore.fetchData(pageMap.systemConfig.listEvent);
    } else {
      log.warn('No listEvent configured for ingrBtchListPage');
    }
  }, []);

  return (
    <CrudLayout
      pageMap={pageMap}
      dataStore={dataStore}
    />
  );
});

export default ingrBtchListPage;
