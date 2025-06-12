import { create } from 'zustand';
import createLogger from '../utils/logger';

const log = createLogger('BreadcrumbStore');

export const useBreadcrumbStore = create((set) => ({
  breadcrumbs: [],
  
  // For flat/tabbed navigation
  setTabCrumb: (tabLabel) => {
    log.debug('Setting tab breadcrumb:', tabLabel);
    set({ 
      breadcrumbs: [
        { label: 'Home', path: '/welcome' },
        { label: tabLabel, path: `/${tabLabel.toLowerCase()}` }
      ]
    });
  },

  // For hierarchical navigation
  setHierCrumbs: (selections, tabLabels) => {
    const crumbs = [
      { label: 'Home', path: '/welcome' }
    ];

    // Add crumbs based on selections
    if (selections.ingrType) {
      crumbs.push({
        label: tabLabels[0],
        path: '/ingredients'
      });
      crumbs.push({
        label: selections.ingrType.name,
        path: `/ingredients/${selections.ingrType.id}`
      });
    }
    
    if (selections.ingredient) {
      crumbs.push({
        label: selections.ingredient.name,
        path: `/ingredients/${selections.ingrType.id}/${selections.ingredient.id}`
      });
    }

    if (selections.batch) {
      crumbs.push({
        label: `Batch ${selections.batch.id}`,
        path: `/ingredients/${selections.ingrType.id}/${selections.ingredient.id}/${selections.batch.id}`
      });
    }

    log.debug('Setting hierarchy breadcrumbs:', crumbs);
    set({ breadcrumbs: crumbs });
  }
}));
