/**
 * Enhanced Registry with complete entity mappings
 * Serves as the single source of truth for application structure
 */

// Import routes to ensure consistency
const routes = require('./src/routes');

/**
 * Comprehensive entity registry that defines the entire application structure
 */
const entityRegistry = {
  // Special pages section
  "dashboard": {
    pageIndexPath: "0-Dashboard/dashboard/index.jsx",
    title: "Dashboard",
    layout: "DashboardLayout", // Add layout attribute
    routeKey: "DASHBOARD",
    icon: "Dashboard",
    section: "main",
    sectionOrder: 10,
    pageType: "dashboard",  // Keep existing pageType
    widgets: [
      { id: "recentIngrBtchList", size: "medium", position: 1 },
      { id: "recentProdBtchList", size: "medium", position: 2 },
      { id: "alertsWidget", size: "small", position: 3 },
      { id: "quickLinks", size: "small", position: 4 }
    ],
    color: "teal"
  },
  
  // Auth flow - special handling
  "userLogin": {
    // Point to the existing index.js
    pageIndexPath: "0-Auth/01-Login/index.js",
    // Keep all other properties
    title: "Login",
    layout: "AuthLayout", // Add layout attribute
    routeKey: "LOGIN",
    icon: "Login",
    section: "auth",
    pageType: "authForm",  // Keep existing pageType
    authFlow: true,
    nextRoute: "SELECT_ACCOUNT",
    formFields: [
      { name: "username", label: "Username", type: "text", required: true },
      { name: "password", label: "Password", type: "password", required: true }
    ]
  },
  
  "userAcctList": {
    pageMapPath: "0-Auth/userAcctList/config.js", 
    layout: "SelectorLayout", // Add layout attribute
    routeKey: "SELECT_ACCOUNT",
    sampleDataPath: "samples/userAcctList.json",
    sqlPath: "sql/views/crud/userAcctList.sql",
    icon: "AccountBalance",
    section: "auth",
    pageType: "widget",  // Keep existing pageType
    widgetId: "accountSelect",
    widgetType: "selector",
    keyField: "acctID",
    nameField: "acctName",
    listEvent: "userAcctList"  // Event for data fetching
  },
  
  // Standard CRUD pages
  "ingrTypeList": {
    pageIndexPath: "2-Ingredient/01-ingrTypeList/index.jsx",
    title: "Ingredient Types",
    layout: "CrudLayout", // Add layout attribute
    routeKey: "INGREDIENT_TYPES",
    db_table: "ingredient_types",
    sampleDataPath: "samples/ingrTypeList.json",
    sqlPath: "sql/views/crud/ingrTypeList.sql",
    icon: "Category",
    section: "ingredients",
    sectionOrder: 20,
    itemOrder: 10,
    childEntity: "ingrList",
    childIdField: "ingrTypeID",
    parentIdField: "acctID",
    keyField: "ingrTypeID",
    nameField: "ingrTypeName",
    color: "pink"
  },
  "ingrList": {
    pageIndexPath: "2-Ingredient/02-ingrList/index.jsx",
    title: "Ingredients",
    layout: "CrudLayout", // Add layout attribute
    routeKey: "INGREDIENTS",
    db_table: "ingredients",
    sampleDataPath: "samples/ingrList.json",
    sqlPath: "sql/views/crud/ingrList.sql",
    icon: "ListAlt",
    section: "ingredients",
    itemOrder: 20,
    childEntity: "ingrBtchList",
    childIdField: "ingrID",
    parentEntity: "ingrTypeList",
    parentIdField: "ingrTypeID",
    keyField: "ingrID",
    nameField: "ingrName",
    color: "pink"
  },
  "ingrBtchList": {
    pageIndexPath: "2-Ingredient/03-ingrBtchList/index.jsx",
    title: "Ingredient Batches",
    layout: "CrudLayout", // Add layout attribute
    routeKey: "INGREDIENT_BATCHES",
    db_table: "ingredient_batches",
    sampleDataPath: "samples/ingrBtchList.json",
    sqlPath: "sql/views/crud/ingrBtchList.sql",
    icon: "Inventory",
    section: "ingredients",
    itemOrder: 30,
    parentEntity: "ingrList",
    parentIdField: "ingrID",
    keyField: "ingrBtchID",
    nameField: "ingrBtchCode",
    color: "pink"
  },
  
  "prodTypeList": {
    pageIndexPath: "3-Product/01-prodTypeList/index.jsx",
    title: "Product Types",
    layout: "CrudLayout", // Add layout attribute
    routeKey: "PRODUCT_TYPES",
    db_table: "product_types",
    sampleDataPath: "samples/prodTypeList.json",
    sqlPath: "sql/views/crud/prodTypeList.sql",
    icon: "Category",
    section: "products",
    sectionOrder: 30,
    itemOrder: 10,
    childEntity: "prodList",
    childIdField: "prodTypeID",
    parentIdField: "acctID",
    keyField: "prodTypeID",
    nameField: "prodTypeName",
    color: "blue"
  },
  "prodList": {
    pageIndexPath: "3-Product/02-prodList/index.jsx",
    title: "Products",
    layout: "CrudLayout", // Add layout attribute
    routeKey: "PRODUCTS",
    db_table: "products",
    sampleDataPath: "samples/prodList.json",
    sqlPath: "sql/views/crud/prodList.sql",
    icon: "Fastfood",
    section: "products",
    itemOrder: 20,
    childEntity: "prodBtchList",
    childIdField: "prodID",
    parentEntity: "prodTypeList",
    parentIdField: "prodTypeID",
    keyField: "prodID",
    nameField: "prodName",
    color: "blue"
  },
  "prodBtchList": {
    pageIndexPath: "3-Product/03-prodBtchList/index.jsx",
    title: "Product Batches",
    layout: "CrudLayout", // Add layout attribute
    routeKey: "PRODUCT_BATCHES",
    db_table: "product_batches",
    sampleDataPath: "samples/prodBtchList.json",
    sqlPath: "sql/views/crud/prodBtchList.sql",
    icon: "Inventory",
    section: "products",
    itemOrder: 30,
    parentEntity: "prodList",
    parentIdField: "prodID",
    keyField: "prodBtchID",
    nameField: "prodBtchCode",
    color: "blue"
  },
  
  // Reference section (gray in diagram) - including measList
  "brndList": {
    pageIndexPath: "4-Reference/01-brndList/index.jsx",
    title: "Brands",
    layout: "CrudLayout", // Add layout attribute
    routeKey: "BRANDS",
    db_table: "brands",
    sampleDataPath: "samples/brndList.json",
    sqlPath: "sql/views/crud/brndList.sql",
    icon: "Branding",
    section: "reference",
    sectionOrder: 50,
    itemOrder: 10,
    parentIdField: "acctID",
    keyField: "brndID",
    nameField: "brndName",
    color: "gray"
  },
  "vndrList": {
    pageIndexPath: "4-Reference/02-vndrList/index.jsx",
    title: "Vendors",
    layout: "CrudLayout", // Add layout attribute
    routeKey: "VENDORS",
    db_table: "vendors",
    sampleDataPath: "samples/vndrList.json",
    sqlPath: "sql/views/crud/vndrList.sql",
    icon: "Business",
    section: "reference",
    itemOrder: 20,
    parentIdField: "acctID",
    keyField: "vndrID",
    nameField: "vndrName",
    color: "gray"
  },
  "wrkrList": {
    pageIndexPath: "4-Reference/03-wrkrList/index.jsx",
    title: "Workers",
    layout: "CrudLayout", // Add layout attribute
    routeKey: "WORKERS",
    db_table: "workers",
    sampleDataPath: "samples/wrkrList.json",
    sqlPath: "sql/views/crud/wrkrList.sql",
    icon: "Person",
    section: "reference",
    itemOrder: 30,
    parentIdField: "acctID",
    keyField: "wrkrID",
    nameField: "wrkrName",
    color: "gray"
  },
  "measList": {
    pageIndexPath: "4-Reference/04-measList/index.jsx",
    title: "Measures",
    layout: "CrudLayout", // Add layout attribute
    routeKey: "MEASURES",
    db_table: "measures",
    sampleDataPath: "samples/measList.json",
    sqlPath: "sql/views/crud/measList.sql",
    icon: "Scale",
    section: "reference",  // Changed from admin to reference as requested
    itemOrder: 40,
    parentIdField: "acctID", // This makes it account-specific
    keyField: "measID",
    nameField: "measName",
    color: "gray" 
  },
  
  // Mapping section (green in diagram)
  "btchMap": {
    pageIndexPath: "5-Mapping/01-btchMap/index.jsx",
    title: "Batch Mapping",
    layout: "BatchMapLayout", // Add layout attribute for future use
    routeKey: "BATCH_MAP",
    db_table: "product_batch_ingredients",
    sampleDataPath: "samples/btchMap.json",
    sqlPath: "sql/views/crud/btchMap.sql",
    icon: "Map",
    section: "maps",
    sectionOrder: 40,
    itemOrder: 10,
    parentEntity: "prodList",
    parentIdField: "prodBtchID",
    keyField: "btchMapID",
    color: "green"
  },
  "taskList": {
    pageIndexPath: "5-Mapping/02-taskList/index.jsx",
    title: "Product Type Tasks",
    layout: "CrudLayout", // Standard layout for now
    routeKey: "BATCH_TASKS",
    db_table: "tasks",
    sampleDataPath: "samples/taskList.json",
    sqlPath: "sql/views/crud/taskList.sql",
    icon: "Assignment",
    section: "maps",
    itemOrder: 30,
    parentEntity: "prodTypeList",
    parentIdField: "prodTypeID",
    keyField: "taskID",
    nameField: "taskName",
    color: "green"
  },
  "rcpeList": {
    pageIndexPath: "5-Mapping/03-rcpeList/index.jsx",
    title: "Product Recipes",
    layout: "RecipeLayout", // Special layout for future use
    routeKey: "RECIPES",
    db_table: "product_recipes",
    sampleDataPath: "samples/rcpeList.json",
    sqlPath: "sql/views/crud/rcpeList.sql",
    icon: "MenuBook",
    section: "maps",
    itemOrder: 20,
    parentEntity: "prodList",
    parentIdField: "prodID",
    keyField: "rcpeID", 
    nameField: "rcpeName",
    color: "green"
  },
  
  // Admin/utility items
  "acctList": {
    pageIndexPath: "9-Admin/01-acctList/index.jsx",
    title: "Accounts",
    layout: "CrudLayout",
    routeKey: null, // Admin-only
    db_table: "accounts",
    sampleDataPath: "samples/acctList.json", 
    sqlPath: "sql/views/crud/acctList.sql",
    icon: "AccountBox",
    section: "admin",
    sectionOrder: 90,
    itemOrder: 10,
    keyField: "acctID",
    nameField: "acctName",
    color: "purple"
  },
  "userList": {
    pageIndexPath: "9-Admin/02-userList/index.jsx",
    title: "Users",
    layout: "CrudLayout",
    routeKey: null, // Admin-only
    db_table: "users",
    sampleDataPath: "samples/userList.json",
    sqlPath: "sql/views/crud/userList.sql", 
    icon: "People",
    section: "admin",
    itemOrder: 20,
    keyField: "userID",
    nameField: "userName",
    color: "purple"
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
const getRouteForEntity = (eventName) => {
  const config = getEntityConfig(eventName);
  if (!config || !config.routeKey || !routes[config.routeKey]) {
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

module.exports = {
  entityRegistry,
  eventToPageMap,
  getPageMapForEvent,
  getEventForPageMap,
  getEntityConfig,
  getEntityConfigFromRoute,
  getEntitiesBySection,
  getRouteForEntity,
  getSections
};