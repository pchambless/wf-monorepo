/**
 * UI-focused Entity Registry
 * Maps event types to UI components and routing information
 */

const entityRegistry = {
  // Special pages section
  "dashboard": {
    pageIndexPath: "0-Dashboard/dashboard/index.jsx",
    title: "Dashboard",
    layout: "MainLayout",
    routeKey: "DASHBOARD",
    icon: "Dashboard",
    section: "main",
    sectionOrder: 10,
    type: "dashboard",  // Changed from pageType
    widgets: [
      { id: "recentIngrBtchList", size: "medium", position: 1 },
      { id: "recentProdBtchList", size: "medium", position: 2 },
      { id: "alertsWidget", size: "small", position: 3 },
      { id: "quickLinks", size: "small", position: 4 }
    ],
    color: "teal",
    import: true
  },
  
  // Auth flow
  "userLogin": {
    pageIndexPath: "0-Auth/01-Login/index.js",
    title: "Login",
    layout: "AuthLayout",
    routeKey: "LOGIN",
    icon: "Login",
    section: "auth",
    type: "authForm",  // Changed from pageType
    authFlow: true,
    nextRoute: "SELECT_ACCOUNT",
    import: true,
    formFields: [
      { name: "username", label: "Username", type: "text", required: true },
      { name: "password", label: "Password", type: "password", required: true }
    ]
  },
  
  "userAcctList": {
    pageMapPath: "0-Auth/userAcctList/config.js", 
    layout: "SelectorLayout",
    routeKey: "SELECT_ACCOUNT",
    icon: "AccountBalance",
    section: "auth",
    type: "widget",  // Changed from pageType
    widgetId: "accountSelect",
    widgetType: "selector",
    listEvent: "userAcctList"  // Event for data fetching
  },
  
  // Ingredients section
  "ingrTypeList": {
    pageIndexPath: "2-Ingredient/01-ingrTypeList/index.jsx",
    title: "Ingredient Types",
    layout: "CrudLayout",
    routeKey: "INGREDIENT_TYPES",
    icon: "Category",
    section: "ingredients",
    sectionOrder: 20,
    itemOrder: 10,
    color: "pink",
    import: true
  },
  "ingrList": {
    pageIndexPath: "2-Ingredient/02-ingrList/index.jsx",
    title: "Ingredients",
    layout: "CrudLayout",
    routeKey: "INGREDIENTS",
    icon: "ListAlt",
    section: "ingredients",
    itemOrder: 20,
    color: "pink",
    import: false
  },
  "ingrBtchList": {
    pageIndexPath: "2-Ingredient/03-ingrBtchList/index.jsx",
    title: "Ingredient Batches",
    layout: "CrudLayout",
    routeKey: "INGREDIENT_BATCHES",
    icon: "Inventory",
    section: "ingredients",
    itemOrder: 30,
    color: "pink",
    import: false
  },
  
  // Products section
  "prodTypeList": {
    pageIndexPath: "3-Product/01-prodTypeList/index.jsx",
    title: "Product Types",
    layout: "CrudLayout",
    routeKey: "PRODUCT_TYPES",
    icon: "Category",
    section: "products",
    sectionOrder: 30,
    itemOrder: 10,
    color: "blue",
    import: true
  },
  "prodList": {
    pageIndexPath: "3-Product/02-prodList/index.jsx",
    title: "Products",
    layout: "CrudLayout",
    routeKey: "PRODUCTS",
    icon: "Fastfood",
    section: "products",
    itemOrder: 20,
    color: "blue",
    import: false
  },
  "prodBtchList": {
    pageIndexPath: "3-Product/03-prodBtchList/index.jsx",
    title: "Product Batches",
    layout: "CrudLayout",
    routeKey: "PRODUCT_BATCHES",
    icon: "Inventory",
    section: "products",
    itemOrder: 30,
    color: "blue",
    import: false
  },
  
  // Reference section
  "brndList": {
    pageIndexPath: "4-Reference/01-brndList/index.jsx",
    title: "Brands",
    layout: "CrudLayout",
    routeKey: "BRANDS",
    icon: "Branding",
    section: "reference",
    sectionOrder: 50,
    itemOrder: 10,
    color: "gray",
    import: true
  },
  "vndrList": {
    pageIndexPath: "4-Reference/02-vndrList/index.jsx",
    title: "Vendors",
    layout: "CrudLayout",
    routeKey: "VENDORS",
    icon: "Business",
    section: "reference",
    itemOrder: 20,
    color: "gray",
    import: true
  },
  "wrkrList": {
    pageIndexPath: "4-Reference/03-wrkrList/index.jsx",
    title: "Workers",
    layout: "CrudLayout",
    routeKey: "WORKERS",
    icon: "Person",
    section: "reference",
    itemOrder: 30,
    color: "gray",
    import: true
  },
  "measList": {
    pageIndexPath: "4-Reference/04-measList/index.jsx",
    title: "Measures",
    layout: "CrudLayout",
    routeKey: "MEASURES",
    icon: "Scale",
    section: "reference",
    itemOrder: 40,
    color: "gray",
    import: false
  },
  
  // Mapping section
  "btchMap": {
    pageIndexPath: "5-Mapping/01-btchMap/index.jsx",
    title: "Batch Mapping",
    layout: "BatchMapLayout",
    routeKey: "BATCH_MAP",
    icon: "Map",
    section: "maps",
    sectionOrder: 40,
    itemOrder: 10,
    color: "green",
    import: true
  },
  "taskList": {
    pageIndexPath: "5-Mapping/02-taskList/index.jsx",
    title: "Product Type Tasks",
    layout: "CrudLayout",
    routeKey: "BATCH_TASKS",
    icon: "Assignment",
    section: "maps",
    itemOrder: 30,
    color: "green",
    import: false
  },
  "rcpeList": {
    pageIndexPath: "5-Mapping/03-rcpeList/index.jsx",
    title: "Product Recipes",
    layout: "RecipeLayout",
    routeKey: "RECIPES",
    icon: "MenuBook",
    section: "maps",
    itemOrder: 20,
    color: "green",
    import: false
  },
  
  // Admin/utility items
  "acctList": {
    pageIndexPath: "9-Admin/01-acctList/index.jsx",
    title: "Accounts",
    layout: "CrudLayout",
    routeKey: null,
    icon: "AccountBox",
    section: "admin",
    sectionOrder: 90,
    itemOrder: 10,
    color: "purple",
    import: false
  },
  "userList": {
    pageIndexPath: "9-Admin/02-userList/index.jsx",
    title: "Users",
    layout: "CrudLayout",
    routeKey: null,
    icon: "People",
    section: "admin",
    itemOrder: 20,
    color: "purple",
    import: false
  }
};

/**
 * Legacy mapping support (for backward compatibility)
 */
const eventToPageMap = {};
Object.entries(entityRegistry).forEach(([event, config]) => {
  // Use pageIndexPath when pageMapPath is not available
  eventToPageMap[event] = config.pageMapPath || config.pageIndexPath;
});

/**
 * Utility functions for accessing registry data
 */

// Get entity configuration by event name
const getEntityConfig = (eventName) => {
  return entityRegistry[eventName] || null;
};

// Get entity configuration from route key
const getEntityConfigFromRoute = (routeKey) => {
  for (const [event, config] of Object.entries(entityRegistry)) {
    if (config.routeKey === routeKey) {
      return { ...config, eventName: event };
    }
  }
  return null;
};

// Get all entities in a section
const getEntitiesBySection = (sectionName) => {
  return Object.entries(entityRegistry)
    .filter(([_, config]) => config.section === sectionName)
    .sort((a, b) => (a[1].itemOrder || 999) - (b[1].itemOrder || 999))
    .map(([event, config]) => ({ eventName: event, ...config }));
};

// Get route path for entity
const getRouteForEntity = (eventName, routes) => {
  const config = getEntityConfig(eventName);
  if (!config || !config.routeKey || !routes || !routes[config.routeKey]) {
    return null;
  }
  return routes[config.routeKey].path;
};

// Get all sections in order
const getSections = () => {
  const sections = new Map();
  
  Object.values(entityRegistry).forEach(config => {
    if (!config.section) return;
    
    if (!sections.has(config.section)) {
      sections.set(config.section, {
        name: config.section,
        order: config.sectionOrder || 999,
        color: config.color
      });
    }
  });
  
  return Array.from(sections.values())
    .sort((a, b) => a.order - b.order);
};

// Legacy support
const getPageMapForEvent = (eventName) => {
  return eventToPageMap[eventName];
};

const getEventForPageMap = (pageMapPath) => {
  for (const [event, path] of Object.entries(eventToPageMap)) {
    if (path === pageMapPath) {
      return event;
    }
  }
  return null;
};

// This function already properly accepts routes as a parameter
function getEntityRoute(entityKey, routes) {
  return routes[entityRegistry[entityKey].routeKey];
}

module.exports = {
  entityRegistry,
  eventToPageMap,
  getPageMapForEvent,
  getEventForPageMap,
  getEntityConfig,
  getEntityConfigFromRoute,
  getEntitiesBySection,
  getRouteForEntity, // Now expects routes as a parameter
  getSections,
  getEntityRoute
};