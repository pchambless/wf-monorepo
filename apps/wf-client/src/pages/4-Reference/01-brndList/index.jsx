import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import CrudLayout from '@crud/CrudLayout';
// Use package import for shared config
import pageMap from '@whatsfresh/shared-config/src/pageMap/brndList';
import navigationStore from '@stores/navigationStore';
import accountStore from '@stores/accountStore';
import createLogger from '@utils/logger';
// Only import ROUTES if we're using it


const log = createLogger('Brands');

const brndListPage = observer(() => {
  useEffect(() => {
    log.debug('Component mounted');
    // Set breadcrumbs if parent entity exists
    
    navigationStore.setBreadcrumbs([
      { label: 'Brands', path: null }
    ]);
  }, []);

  return (
    <CrudLayout
      pageMap={pageMap}
      accountId={accountStore.currentAccountId}
    />
  );
});

export default brndListPage;
