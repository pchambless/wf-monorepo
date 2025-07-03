/**
 * WhatsFresh Widget Registry
 * Central registry for all reusable UI components across applications
 */
// Local abbreviation map to avoid circular dependencies
const abbreviationMap = {
  'acct': 'Account',
  'btch': 'Batch',
  'brnd': 'Brand',
  'ingr': 'Ingredient',
  'prod': 'Product',
  'meas': 'Measurement',
  'vndr': 'Vendor',
  'wrkr': 'Worker',
  'rcpe': 'Recipe',
  'sel': 'Select'
};

/**
 * Widget type constants
 */
export const WIDGET_TYPES = {
  DATA: 'data',      // Data display/management
  FORM: 'form',      // Form inputs
  NAV: 'navigation', // Navigation components
  DASH: 'dashboard', // Dashboard widgets
  DISP: 'display',   // Visual display components
  UTIL: 'utility',   // Utility widgets
  SEL: 'selection'   // Selection widgets (dropdowns)
};

/**
 * Size constants for widgets
 */
export const WIDGET_SIZES = {
  SM: 'small',
  MD: 'medium',
  LG: 'large',
  XL: 'extra-large',
  FLEX: 'flexible'
};

/**
 * Widget registry with abbreviated IDs
 */
export const WIDGET_REGISTRY = {
  /**************************************
   * SELECTION WIDGETS
   * Dropdown selectors for entities
   **************************************/
  
  // Account selector
  selAcct: {
    id: "selAcct",
    component: "SelAcct", 
    type: WIDGET_TYPES.SEL,  // Changed from NAV to SEL
    dataSource: "userAcctList",
    defaultSize: WIDGET_SIZES.SM,
    description: "Account selection dropdown",
    apps: ["client", "admin"]
  },
  
  // Brand selector
  selBrnd: {
    id: "selBrnd",
    component: "SelBrnd",
    type: WIDGET_TYPES.SEL,  // Changed from FORM to SEL
    dataSource: "brndList",
    defaultSize: WIDGET_SIZES.SM,
    description: "Brand selection dropdown",
    apps: ["client", "admin"]
  },
  
  // Vendor selector
  selVndr: {
    id: "selVndr",
    component: "SelVndr",
    type: WIDGET_TYPES.SEL,  // Changed from FORM to SEL
    dataSource: "vndrList",
    defaultSize: WIDGET_SIZES.SM,
    description: "Vendor selection dropdown",
    apps: ["client", "admin"]
  },
  
  // Worker selector
  selWrkr: {
    id: "selWrkr",
    component: "SelWrkr",
    type: WIDGET_TYPES.SEL,  // Changed from FORM to SEL
    dataSource: "wrkrList",
    defaultSize: WIDGET_SIZES.SM,
    description: "Worker selection dropdown",
    apps: ["client", "admin"]
  },
  
  // Measurement selector
  selMeas: {
    id: "selMeas",
    component: "SelMeas",
    type: WIDGET_TYPES.SEL,  // Changed from FORM to SEL
    dataSource: "measList", 
    defaultSize: WIDGET_SIZES.SM,
    description: "Measurement unit selection",
    apps: ["client", "admin"]
  },
  
  // Ingredient type selector
  selIngrType: {
    id: "selIngrType",
    component: "SelIngrType",
    type: WIDGET_TYPES.SEL,  // Changed from FORM to SEL
    dataSource: "ingrTypeList",
    defaultSize: WIDGET_SIZES.SM,
    description: "Ingredient type selection",
    apps: ["client"]
  },
  
  // Ingredient selector
  selIngr: {
    id: "selIngr",
    component: "SelIngr",
    type: WIDGET_TYPES.SEL,  // Changed from FORM to SEL
    dataSource: "ingrList",
    defaultSize: WIDGET_SIZES.SM,
    description: "Ingredient selection dropdown",
    apps: ["client"]
  },
  
  // Product type selector
  selProdType: {
    id: "selProdType",
    component: "SelProdType",
    type: WIDGET_TYPES.SEL,  // Changed from FORM to SEL
    dataSource: "prodTypeList",
    defaultSize: WIDGET_SIZES.SM,
    description: "Product type selection dropdown",
    apps: ["client"]
  },
  
  // Product selector
  selProd: {
    id: "selProd",
    component: "SelProd",
    type: WIDGET_TYPES.SEL,  // Changed from FORM to SEL
    dataSource: "prodList",
    defaultSize: WIDGET_SIZES.SM,
    description: "Product selection dropdown",
    apps: ["client"]
  },

  /**************************************
   * DATA MANAGEMENT WIDGETS
   * CRUD operations on data
   **************************************/
  
  // CRUD Table
  crudTbl: {
    id: "crudTbl",
    component: "CrudTable",
    type: WIDGET_TYPES.DATA,
    defaultSize: WIDGET_SIZES.LG,
    description: "Data table with CRUD operations",
    apps: ["client", "admin"],
    configurable: true
  },
  
  // CRUD Form
  crudForm: {
    id: "crudForm",
    component: "CrudForm",
    type: WIDGET_TYPES.FORM,
    defaultSize: WIDGET_SIZES.MD,
    description: "Form for creating and editing entities",
    apps: ["client", "admin"],
    configurable: true
  },
  
  // Detail View
  dtlView: {
    id: "dtlView",
    component: "DetailView",
    type: WIDGET_TYPES.DATA,
    defaultSize: WIDGET_SIZES.MD,
    description: "Detail view of an entity",
    apps: ["client", "admin"],
    configurable: true
  },
  
  // Data Filter
  dataFltr: {
    id: "dataFltr",
    component: "DataFilter",
    type: WIDGET_TYPES.FORM,
    defaultSize: WIDGET_SIZES.SM,
    description: "Filter controls for data tables",
    apps: ["client", "admin"],
    configurable: true
  },

  /**************************************
   * DASHBOARD WIDGETS
   * Reporting and visualization
   **************************************/
  
  // Recent ingredient batches
  rcntIngrBtch: {
    id: "rcntIngrBtch",
    component: "RcntIngrBtch", 
    type: WIDGET_TYPES.DASH,
    dataSource: "ingrBtchList",
    defaultSize: WIDGET_SIZES.MD,
    description: "Recent ingredient batches",
    apps: ["client"]
  },
  
  // Recent product batches
  rcntProdBtch: {
    id: "rcntProdBtch", 
    component: "RcntProdBtch",
    type: WIDGET_TYPES.DASH,
    dataSource: "prodBtchList", 
    defaultSize: WIDGET_SIZES.MD,
    description: "Recent product batches",
    apps: ["client"]
  },
  
  // Batch status summary
  btchSumm: {
    id: "btchSumm",
    component: "BatchSummary",
    type: WIDGET_TYPES.DASH,
    dataSource: "prodBtchList",
    defaultSize: WIDGET_SIZES.MD,
    description: "Batch production summary",
    apps: ["client"]
  },
  
  // Inventory level chart
  invChart: {
    id: "invChart",
    component: "InventoryChart",
    type: WIDGET_TYPES.DASH,
    dataSource: "ingrBtchList",
    defaultSize: WIDGET_SIZES.MD,
    description: "Inventory levels visualization",
    apps: ["client"]
  },
  
  // Quick links navigation
  qckLinks: {
    id: "qckLinks",
    component: "QuickLinks",
    type: WIDGET_TYPES.NAV,
    defaultSize: WIDGET_SIZES.SM,
    description: "Quick access links",
    apps: ["client"]
  },
  
  // Alerts and notifications
  alerts: {
    id: "alerts",
    component: "Alerts",
    type: WIDGET_TYPES.DASH,
    dataSource: "alertsList", // Future event
    defaultSize: WIDGET_SIZES.SM,
    description: "System alerts and notifications",
    apps: ["client", "admin"]
  },

  /**************************************
   * UTILITY WIDGETS
   * Reusable functional components
   **************************************/
  
  // File uploader
  fileUpld: {
    id: "fileUpld",
    component: "FileUploader",
    type: WIDGET_TYPES.UTIL,
    defaultSize: WIDGET_SIZES.SM,
    description: "File upload component",
    apps: ["client", "admin"]
  },
  
  // Date range picker
  dateRng: {
    id: "dateRng",
    component: "DateRangePicker",
    type: WIDGET_TYPES.FORM,
    defaultSize: WIDGET_SIZES.SM,
    description: "Date range selection",
    apps: ["client", "admin"]
  },
  
  // Recipe steps editor
  rcpeSteps: {
    id: "rcpeSteps",
    component: "RecipeStepsEditor",
    type: WIDGET_TYPES.FORM,
    dataSource: "rcpeList",
    defaultSize: WIDGET_SIZES.LG,
    description: "Recipe steps editor",
    apps: ["client"]
  }
};

/**
 * Get a widget definition by ID
 */
export function getWidgetById(widgetId) {
  return WIDGET_REGISTRY[widgetId];
}

/**
 * Get all widgets for a specific application
 */
export function getWidgetsByApp(app) {
  return Object.values(WIDGET_REGISTRY).filter(widget => 
    widget.apps && widget.apps.includes(app)
  );
}

/**
 * Get all widgets of a specific type
 */
export function getWidgetsByType(type) {
  return Object.values(WIDGET_REGISTRY).filter(widget => 
    widget.type === type
  );
}

/**
 * Get widget display name from ID using abbreviation map
 */
export function getWidgetDisplayName(widgetId) {
  const widget = getWidgetById(widgetId);
  if (!widget) return widgetId;
  
  // Split the ID into parts based on camelCase
  const parts = widget.id.split(/(?=[A-Z])/).map(part => part.toLowerCase());
  
  // Convert each part using abbreviationMap
  const expandedParts = parts.map(part => 
    abbreviationMap[part] || part.charAt(0).toUpperCase() + part.slice(1)
  );
  
  // Join with spaces
  return expandedParts.join(' ');
}

/**
 * Get all widgets that can use a specific data source
 */
export function getWidgetsByDataSource(eventType) {
  return Object.values(WIDGET_REGISTRY).filter(widget => 
    widget.dataSource === eventType
  );
}