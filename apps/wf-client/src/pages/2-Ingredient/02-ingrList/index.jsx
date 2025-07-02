import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { CrudLayout } from '@whatsfresh/shared-ui';
import pageMap from '@whatsfresh/shared-config/src/pageMap/ingrList';
import dataStore from '@stores/dataStore';
import navigationStore from '@stores/navigationStore';
import createLogger from '@utils/logger';

const log = createLogger('Ingredients');

const ingrListPage = observer(() => {
  useEffect(() => {
    log.debug('ingrListPage component mounted');
    
    // Set breadcrumbs and fetch data
    navigationStore.setBreadcrumbs([
      { label: pageMap.title, path: null }
    ]);
    
    // Fetch data using the listEvent from pageMap
    if (pageMap.systemConfig?.listEvent) {
      log.debug('Fetching data for:', pageMap.systemConfig.listEvent);
      dataStore.fetchData(pageMap.systemConfig.listEvent);
    } else {
      log.warn('No listEvent configured for ingrListPage');
    }
  }, []);

  return (
    <CrudLayout
      pageMap={pageMap}
      dataStore={dataStore}
    />
  );
});

export default ingrListPage;
