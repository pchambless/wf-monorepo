/**
 * GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from event type relationships and pageMapRegistry
 */

// Route definitions with simplified structure
export const ROUTES = {
  "DASHBOARD": {
    "path": "/dashboard",
    "listEvent": "dashboard"
  },
  "LOGIN": {
    "path": "/login",
    "listEvent": "userLogin"
  },
  "SELECT_ACCOUNT": {
    "path": "/select-account",
    "listEvent": "userAcctList"
  },
  "INGREDIENT_TYPES": {
    "path": "/ingredients/:acctID/ingrTypeList",
    "listEvent": "ingrTypeList"
  },
  "INGREDIENTS": {
    "path": "/ingredients/:ingrTypeID/ingrList",
    "listEvent": "ingrList"
  },
  "INGREDIENT_BATCHES": {
    "path": "/ingredients/:ingrID/ingrBtchList",
    "listEvent": "ingrBtchList"
  },
  "PRODUCT_TYPES": {
    "path": "/products/:acctID/prodTypeList",
    "listEvent": "prodTypeList"
  },
  "PRODUCTS": {
    "path": "/products/:prodTypeID/prodList",
    "listEvent": "prodList"
  },
  "PRODUCT_BATCHES": {
    "path": "/products/:prodID/prodBtchList",
    "listEvent": "prodBtchList"
  },
  "BRANDS": {
    "path": "/reference/:acctID/brndList",
    "listEvent": "brndList"
  },
  "VENDORS": {
    "path": "/reference/:acctID/vndrList",
    "listEvent": "vndrList"
  },
  "WORKERS": {
    "path": "/reference/:acctID/wrkrList",
    "listEvent": "wrkrList"
  },
  "MEASURES": {
    "path": "/reference/:acctID/measList",
    "listEvent": "measList"
  },
  "BATCH_MAP": {
    "path": "/maps/btchMap",
    "listEvent": "btchMap"
  },
  "BATCH_TASKS": {
    "path": "/maps/:prodTypeID/taskList",
    "listEvent": "taskList"
  },
  "RECIPES": {
    "path": "/maps/:prodID/rcpeList",
    "listEvent": "rcpeList"
  }
};

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
 * Get route key by listEvent
 */
export function getRouteKeyByEvent(listEvent) {
  if (!listEvent) return null;
  
  const entry = Object.entries(ROUTES).find(([_, route]) => 
    route.listEvent === listEvent
  );
  
  return entry ? entry[0] : null;
}