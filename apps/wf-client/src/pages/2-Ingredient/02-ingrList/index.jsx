import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import CrudLayout from '@crud/CrudLayout';
// Use package import for shared config
import pageMap from '@whatsfresh/shared-config/src/pageMap/ingrList';
import navigationStore from '@stores/navigationStore';
import accountStore from '@stores/accountStore';
import createLogger from '@utils/logger';
// Only import ROUTES if we're using it
import { ROUTES } from '@whatsfresh/shared-config/src/routes';

const log = createLogger('Ingredients');

const ingrListPage = observer(() => {
  useEffect(() => {
    log.debug('Component mounted');
    // Set breadcrumbs if parent entity exists
    
    if (navigationStore.parentId) {
      navigationStore.setBreadcrumbs([
        {
          label: 'Ingredient Types',
          path: ROUTES.INGREDIENT_TYPES.path
        },
        { label: 'Ingredients', path: null }
      ]);
    } else {
      navigationStore.setBreadcrumbs([
        { label: 'Ingredients', path: null }
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

export default ingrListPage;
