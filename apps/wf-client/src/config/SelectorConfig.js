/**
 * Central definition of all selector configurations
 */
export const SELECTORS = {
  // Ingredient section selectors
  "ingr": {
    selectors: [
      {
        id: "sel1",
        entityType: "ingrType",
        idField: "ingrTypeID",
        listEvent: "ingrTypeList",
        displayField: "ingrTypeName",
        label: "Ingredient Type",
        defaultValue: 1, // Default to first type
        defaultRule: "first" // Alternatively use "first" to select first available
      }
    ]
  },
  
  "ingrBatch": {
    selectors: [
      {
        id: "sel1",
        entityType: "ingrType",
        idField: "ingrTypeID",
        listEvent: "ingrTypeList",
        displayField: "ingrTypeName",
        label: "Ingredient Type",
        defaultValue: 1
      },
      {
        id: "sel2",
        entityType: "ingr", 
        idField: "ingrID",
        listEvent: "ingrList",
        displayField: "ingrName",
        label: "Ingredient",
        dependsOn: "ingrTypeID",
        defaultRule: "first" // Select first available in the filtered list
      }
    ]
  },
  
  // Product section selectors
  "prod": {
    // ...same pattern
  },
  
  // Mapping section selectors
  "batchMap": {
    selectors: [
      {
        id: "sel1",
        // ...
      },
      {
        id: "sel2",
        // ...
      },
      {
        id: "sel3",
        // ...
      }
    ]
  }
};

/**
 * Get selectors config for a specific page ID
 */
export function getSelectorsForPage(pageId) {
  return SELECTORS[pageId]?.selectors || [];
}
