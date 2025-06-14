import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import CrudLayout from '@crud/CrudLayout';
// Use package import for shared config
import pageMap from '@whatsfresh/shared-config/src/pageMap/prodBtchList';
import navigationStore from '@stores/navigationStore';
import accountStore from '@stores/accountStore';
import createLogger from '@utils/logger';
// Only import ROUTES if we're using it
import { ROUTES } from '@whatsfresh/shared-config/src/routes';

const log = createLogger('Product Batches');

const prodBtchListPage = observer(() => {
  useEffect(() => {
    log.debug('Component mounted');
    // Set breadcrumbs if parent entity exists
    
    if (navigationStore.parentId) {
      navigationStore.setBreadcrumbs([
        {
          label: 'Products',
          path: ROUTES.PRODUCTS.path
        },
        { label: 'Product Batches', path: null }
      ]);
    } else {
      navigationStore.setBreadcrumbs([
        { label: 'Product Batches', path: null }
      ]);
    }
  }, []);

  return (
    <CrudLayout
      pageMap={pageMap}
      accountId={accountStore.currentAccountId}
    />
  );
});

export default prodBtchListPage;
