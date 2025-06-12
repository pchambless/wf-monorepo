/**
 * Central definition of all application routes
 * This is the ONLY place paths should be defined
 */
export const ROUTES = {
  // Dashboard
  DASHBOARD: {
    path: '/welcome',
    label: 'Dashboard',
    icon: 'Dashboard',
    section: 'dashboard', 
    sectionOrder: 10
  },

  // Select Account
  SELECT_ACCOUNT: {
    path: '/accounts/select',
    label: 'Select Account',
    icon: 'AccountBalance',
    section: 'dashboard',
    itemOrder: 20
  },
  
  // Ingredients section (pink)
  INGREDIENT_TYPES: {
    path: '/ingredients/types',
    label: 'Ingredient Types',
    icon: 'Category',
    section: 'ingredients',
    sectionOrder: 20,
    itemOrder: 10
  },
  INGREDIENTS: {
    path: '/ingredients/:ingrTypeID/ingredients',
    label: 'Ingredients',
    icon: 'ListAlt',
    section: 'ingredients',
    itemOrder: 20,
    requiredParams: ['ingrTypeID']
  },
  INGREDIENT_BATCHES: {
    path: '/ingredients/:ingrID/batches',
    label: 'Ingredient Batches',
    icon: 'Inventory',
    section: 'ingredients',
    itemOrder: 30,
    requiredParams: ['ingrTypeID', 'ingrID']
  },
  
  // Products section (blue)
  PRODUCT_TYPES: {
    path: '/products/types',
    label: 'Product Types',
    icon: 'Category',
    section: 'products',
    sectionOrder: 30,
    itemOrder: 10
  },
  PRODUCTS: {
    path: '/products/:prodTypeID/products',
    label: 'Products',
    icon: 'Fastfood',
    section: 'products',
    itemOrder: 20,
    requiredParams: ['prodTypeID']
  },
  PRODUCT_BATCHES: {
    path: '/products/:prodTypeID/products/:prodID/batches',
    label: 'Product Batches',
    icon: 'Inventory',
    section: 'products',
    itemOrder: 30,
    requiredParams: ['prodTypeID', 'prodID']
  },
  
  // Maps section (green)
  BATCH_MAP: {
    path: '/maps/batch-map',
    label: 'Batch Map',
    icon: 'Map',
    section: 'maps',
    sectionOrder: 40,
    itemOrder: 10
  },
  RECIPES: {
    path: '/maps/recipes',
    label: 'Recipes',
    icon: 'MenuBook',
    section: 'maps',
    itemOrder: 20
  },
  BATCH_TASKS: {
    path: '/maps/batch-tasks',
    label: 'Batch Tasks',
    icon: 'Assignment',
    section: 'maps',
    itemOrder: 30
  },
  
  // Reference section (grey)
  BRANDS: {
    path: '/account/brands',
    label: 'Brands',
    icon: 'Branding',
    section: 'reference',
    sectionOrder: 50,
    itemOrder: 10
  },
  VENDORS: {
    path: '/account/vendors',
    label: 'Vendors',
    icon: 'Business',
    section: 'reference',
    itemOrder: 20
  },
  WORKERS: {
    path: '/account/workers',
    label: 'Workers',
    icon: 'Person',
    section: 'reference',
    itemOrder: 30
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
export function getNavigationSections() {
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
 * Get route information by key
 */
export function getRoute(routeKey) {
  return ROUTES[routeKey];
}
