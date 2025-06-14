import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import CrudLayout from '@crud/CrudLayout';
// Use package import for shared config
import pageMap from '@whatsfresh/shared-config/src/pageMap/prodTypeList';
import navigationStore from '@stores/navigationStore';
import accountStore from '@stores/accountStore';
import createLogger from '@utils/logger';
// Only import ROUTES if we're using it


const log = createLogger('Product Types');

const prodTypeListPage = observer(() => {
  useEffect(() => {
    log.debug('Component mounted');
    // Set breadcrumbs if parent entity exists
    
    navigationStore.setBreadcrumbs([
      { label: 'Product Types', path: null }
    ]);
  }, []);

  return (
    <CrudLayout
      pageMap={pageMap}
      accountId={accountStore.currentAccountId}
    />
  );
});

export default prodTypeListPage;
