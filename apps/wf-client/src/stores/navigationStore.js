import { makeAutoObservable, runInAction } from 'mobx';
import createLogger from '../utils/logger';

// Icons for navigation
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';

class NavigationStore {
  // Current navigation state
  currentPath = '';
  currentPage = '';
  pageTitle = 'WhatsFresh';
  
  // Sidebar navigation items - hardcoded for stability
  sidebarItems = [];
  
  // Breadcrumbs state
  breadcrumbs = [{ label: 'Home', path: '/welcome' }];
  
  // Entity context for smart navigation
  selectedEntities = {};
  
  constructor() {
    makeAutoObservable(this);
    this.log = createLogger('NavigationStore.MobX');
    
    // Initialize with hardcoded navigation
    this.initSidebar();
  }
  
  // Initialize sidebar with hardcoded items
  initSidebar() {
    try {
      // Simple hardcoded navigation for stability
      const navItems = [
        {
          title: 'Dashboard',
          path: '/welcome',
          icon: <HomeIcon />,
          order: 10
        },
        {
          title: 'Ingredients',
          icon: <RestaurantIcon />,
          order: 20,
          children: [
            {
              title: 'Ingredient Types',
              path: '/ingredients/types',
              icon: <CategoryIcon />
            },
            {
              title: 'Type Ingredients',
              path: '/ingredients/:ingrTypeID/ingredients',
              icon: <CategoryIcon />
            }
          ]
        },
        {
          title: 'Products',
          path: '/products',
          icon: <LocalDiningIcon />,
          order: 30
        },
        {
          title: 'Inventory',
          path: '/inventory',
          icon: <InventoryIcon />,
          order: 40
        },
        {
          title: 'Accounts',
          path: '/accounts',
          icon: <PeopleIcon />,
          order: 50
        },
        {
          title: 'Settings',
          path: '/settings',
          icon: <SettingsIcon />,
          order: 60
        }
      ];
      
      // Update the store
      runInAction(() => {
        this.sidebarItems = navItems;
      });
      
      this.log.debug('Sidebar navigation initialized with hardcoded items', { 
        itemCount: this.sidebarItems.length
      });
    } catch (error) {
      console.error('Error initializing sidebar navigation:', error);
      // Set a minimal navigation as fallback
      runInAction(() => {
        this.sidebarItems = [
          {
            title: 'Dashboard',
            path: '/welcome',
            icon: <HomeIcon />
          }
        ];
      });
    }
  }
  
  // Set current page information
  setCurrentPage(page, path, title) {
    runInAction(() => {
      this.currentPage = page;
      this.currentPath = path;
      
      if (title) {
        this.setPageTitle(title);
      } else {
        // Generate title from page name if not provided
        this.setPageTitle(page);
      }
    });
    
    this.log.debug('Page changed', { page, path, title });
  }
  
  // Set page title and update document title
  setPageTitle(title) {
    const fullTitle = title ? `WhatsFresh - ${title}` : 'WhatsFresh';
    
    runInAction(() => {
      this.pageTitle = fullTitle;
    });
    
    // Side effect: update browser tab title
    document.title = fullTitle;
  }
  
  // Set custom breadcrumbs
  setBreadcrumbs(breadcrumbs) {
    const homeCrumb = { label: 'Home', path: '/welcome' };
    
    runInAction(() => {
      this.breadcrumbs = [
        homeCrumb, 
        ...breadcrumbs.filter(c => c.path !== '/welcome')
      ];
    });
    
    this.log.debug('Breadcrumbs updated', { 
      count: this.breadcrumbs.length,
      breadcrumbs: this.breadcrumbs
    });
  }
  
  // Set entity-based breadcrumbs
  setEntityBreadcrumbs(entities) {
    const crumbs = [{ label: 'Home', path: '/welcome' }];
    
    // Track selected entities for smart navigation
    runInAction(() => {
      this.selectedEntities = { ...entities };
    });
    
    // Build breadcrumbs based on entity hierarchy
    Object.entries(entities).forEach(([type, entity]) => {
      if (!entity) return;
      
      // Add category/list page if this is first entity
      if (crumbs.length === 1) {
        const listPath = `/${type.toLowerCase().replace('Type', '')}s`;
        crumbs.push({
          label: this.formatEntityType(type) + 's',
          path: listPath
        });
      }
      
      // Add the entity itself
      crumbs.push({
        label: entity.name || `${this.formatEntityType(type)} #${entity.id}`,
        path: this.buildEntityPath(entities, type)
      });
    });
    
    runInAction(() => {
      this.breadcrumbs = crumbs;
    });
    
    this.log.debug('Entity breadcrumbs set', { 
      entities, 
      crumbs 
    });
  }
  
  // Format entity type for display
  formatEntityType(type) {
    // Convert camelCase to Title Case with spaces
    return type
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  }
  
  // Build path for entity based on hierarchy
  buildEntityPath(entities, currentType) {
    // Example: /ingredients/5/12 for ingredient ID 12 of type ID 5
    const types = ['ingrType', 'ingredient', 'batch']; // Order matters!
    const base = `/${currentType.toLowerCase().replace('Type', '')}s`; 
    
    // Build path components
    const pathParts = [];
    for (const type of types) {
      if (entities[type]) {
        pathParts.push(entities[type].id);
      }
      // Stop once we reach the current type
      if (type === currentType) break;
    }
    
    return pathParts.length ? `${base}/${pathParts.join('/')}` : base;
  }
  
  // Get a selected entity by type
  getSelectedEntity(entityType) {
    return this.selectedEntities[entityType] || null;
  }
  
  // Clear all navigation state
  reset() {
    runInAction(() => {
      this.currentPath = '';
      this.currentPage = '';
      this.pageTitle = 'WhatsFresh';
      this.breadcrumbs = [{ label: 'Home', path: '/welcome' }];
      this.selectedEntities = {};
    });
    
    this.log.debug('Navigation store reset');
  }
}

const navigationStore = new NavigationStore();
export default navigationStore;
