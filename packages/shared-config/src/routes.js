/**
 * Central definition of all application routes
 * This is the ONLY place paths should be defined
 */
export const ROUTES = {
  // Auth routes
  LOGIN: {
    path: '/login',
    label: 'Login',
    icon: 'Login',
    listEvent: 'loginList',
    section: null,  // No section as this is a standalone route
    // No section or sectionOrder needed as this isn't in the main navigation
  },

  // Dashboard
  DASHBOARD: {
    path: '/dashboard',  // Clean, simple path
    label: 'Dashboard',
    icon: 'Dashboard',
    section: 'dashboard', 
    listEvent: 'dashList',
    sectionOrder: 10
  },

  // Ingredients section (pink)
  INGREDIENT_TYPES: {
    path: '/ingredients/:acctID/types',
    label: 'Ingredient Types',
    icon: 'Category',
    section: 'ingredients',
    listEvent: 'ingrTypeList',
    sectionOrder: 20,
    itemOrder: 10,
    requiredParams: ['acctID']
  },
  INGREDIENTS: {
    path: '/ingredients/:ingrTypeID/ingredients',
    label: 'Ingredients',
    icon: 'ListAlt',
    section: 'ingredients',
    listEvent: 'ingrList',
    itemOrder: 20,
    requiredParams: ['acctID', 'ingrTypeID']
  },
  INGREDIENT_BATCHES: {
    path: '/ingredients/:ingrID/batches',
    label: 'Ingredient Batches',
    icon: 'Inventory',
    section: 'ingredients',
    listEvent: 'ingrBtchList',
    itemOrder: 30,
    requiredParams: ['acctID', 'ingrTypeID', 'ingrID']
  },
  
  // Products section (blue)
  PRODUCT_TYPES: {
    path: '/products/:acctID/types',
    label: 'Product Types',
    icon: 'Category',
    section: 'products',
    listEvent: 'prodTypeList',
    sectionOrder: 30,
    itemOrder: 10,
    requiredParams: ['acctID']
  },
  PRODUCTS: {
    path: '/products/:prodTypeID/products',
    label: 'Products',
    icon: 'Fastfood',
    section: 'products',
    listEvent: 'prodList',
    itemOrder: 20,
    requiredParams: ['acctID', 'prodTypeID']
  },
  PRODUCT_BATCHES: {
    path: '/products/:prodID/batches',
    label: 'Product Batches',
    icon: 'Inventory',
    section: 'products',
    listEvent: 'prodBtchList',
    itemOrder: 30,
    requiredParams: ['acctID', 'prodTypeID', 'prodID']
  },
  
  // Maps section (green)
  BATCH_MAP: {
    path: '/products/:prodID/batch-map',
    label: 'Batch Map',
    icon: 'Map',
    section: 'maps',
    sectionOrder: 40,
    itemOrder: 10,
    requiredParams: ['acctID', 'prodID']
  },
  RECIPES: {
    path: '/products/:prodID/recipes',
    label: 'Recipes',
    icon: 'MenuBook',
    section: 'maps',
    listEvent: 'rcpeList',
    itemOrder: 20,
    requiredParams: ['acctID', 'prodID']
  },
  BATCH_TASKS: {
    path: '/products/:prodTypeID/prod-type-tasks',
    label: 'Batch Tasks',
    icon: 'Assignment',
    section: 'maps',
    listEvent: 'taskList',
    itemOrder: 30,
    requiredParams: ['acctID', 'prodTypeID']
  },
  
  // Reference section (grey)
  BRANDS: {
    path: '/account/:acctID/brands',
    label: 'Brands',
    icon: 'Branding',
    section: 'reference',
    listEvent: 'brndList',
    sectionOrder: 50,
    itemOrder: 10,
    requiredParams: ['acctID']
  },
  VENDORS: {
    path: '/account/:acctID/vendors',
    label: 'Vendors',
    icon: 'Business',
    section: 'reference',
    listEvent: 'vndrList',
    itemOrder: 20,
    requiredParams: ['acctID']
  },
  WORKERS: {
    path: '/account/:acctID/workers',
    label: 'Workers',
    icon: 'Person',
    section: 'reference',
    listEvent: 'wrkrList',
    itemOrder: 30,
    requiredParams: ['acctID']
  },
  MEASURES: {
    path: '/account/:acctID/measures',
    label: 'Measure Units',
    icon: 'Scale', 
    section: 'reference',
    listEvent: 'measList',
    itemOrder: 40,
    requiredParams: ['acctID']
  }
};

// Section definitions with corresponding colors from your diagram
export const SECTIONS = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'Dashboard',
    color: '#FFFFFF' // White/default
  },
  ingredients: {
    id: 'ingredients',
    label: 'Ingredients',
    icon: 'Restaurant',
    color: '#FBD3E9' // Pink color from your diagram
  },
  products: {
    id: 'products',
    label: 'Products',
    icon: 'Fastfood',
    color: '#D0E1F9' // Blue color from your diagram
  },
  maps: {
    id: 'maps',
    label: 'Maps',
    icon: 'Map',
    color: '#C4EABD' // Green color from your diagram
  },
  reference: {
    id: 'reference',
    label: 'Reference',
    icon: 'Book',
    color: '#E0E0E0' // Grey color from your diagram
  }
};

// Helper function to organize routes by section
export function getNavSections() {
  const sections = {};
  
  // First, initialize sections
  Object.keys(SECTIONS).forEach(sectionKey => {
    sections[sectionKey] = {
      ...SECTIONS[sectionKey],
      items: []
    };
  });
  
  // Then, organize routes into their sections
  Object.entries(ROUTES).forEach(([routeKey, route]) => {
    if (route.section && sections[route.section]) {
      sections[route.section].items.push({
        id: routeKey,
        ...route
      });
    }
  });
  
  // Sort items within each section
  Object.keys(sections).forEach(sectionKey => {
    sections[sectionKey].items.sort((a, b) => 
      (a.itemOrder || 999) - (b.itemOrder || 999)
    );
  });
  
  // Convert to array and sort sections
  const sortedSections = Object.values(sections)
    .filter(section => section.items.length > 0)
    .sort((a, b) => {
      const aOrder = a.items[0]?.sectionOrder || 999;
      const bOrder = b.items[0]?.sectionOrder || 999;
      return aOrder - bOrder;
    });
  
  return sortedSections;
}

/**
 * Helper to resolve parameterized routes with actual values
 */
export function resolveRoute(routeKey, params = {}) {
  const route = ROUTES[routeKey];
  if (!route) {
    console.error(`Route key not found: ${routeKey}`);
    return '/';
  }
  
  let resolvedPath = route.path;
  Object.entries(params).forEach(([key, value]) => {
    resolvedPath = resolvedPath.replace(`:${key}`, value);
  });
  return resolvedPath;
}

/**
 * Get route information by key or listEvent
 * @param {string} identifier - Either a route key (e.g., 'DASHBOARD') or a listEvent (e.g., 'dashList')
 * @returns {Object|null} The route object and its key, or null if not found
 */
export function getRoute(identifier) {
  if (!identifier) return null;
  
  // First, try direct lookup by route key (e.g., 'DASHBOARD')
  if (ROUTES[identifier]) {
    return {
      key: identifier,
      route: ROUTES[identifier]
    };
  }
  
  // If not found by key, try lookup by listEvent (e.g., 'dashList')
  const entry = Object.entries(ROUTES).find(([_, route]) => 
    route.listEvent === identifier
  );
  
  if (!entry) return null;
  
  return {
    key: entry[0],
    route: entry[1]
  };
}
