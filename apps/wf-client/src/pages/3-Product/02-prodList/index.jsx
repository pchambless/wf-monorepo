import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import CrudLayout from '@crud/CrudLayout';
// Use package import for shared config
import pageMap from '@whatsfresh/shared-config/src/pageMap/prodList';
import navigationStore from '@stores/navigationStore';
import accountStore from '@stores/accountStore';
import createLogger from '@utils/logger';
// Only import ROUTES if we're using it
import { ROUTES } from '@whatsfresh/shared-config/src/routes';

const log = createLogger('Products');

const prodListPage = observer(() => {
  useEffect(() => {
    log.debug('Component mounted');
    // Set breadcrumbs if parent entity exists
    
    if (navigationStore.parentId) {
      navigationStore.setBreadcrumbs([
        {
          label: 'Product Types',
          path: ROUTES.PRODUCT_TYPES.path
        },
        { label: 'Products', path: null }
      ]);
    } else {
      navigationStore.setBreadcrumbs([
        { label: 'Products', path: null }
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

export default prodListPage;
