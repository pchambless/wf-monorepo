import { setVar, getVar } from './externalStoreDel';

// Map entity types to their variable names
const entityVarMap = {
  'ingredientType': ':ingrTypeID',
  'ingredient': ':ingrID',
  'ingredientBatch': ':ingrBtchID',
  'productType': ':prodTypeID',
  'product': ':prodID',
  'productBatch': ':prodBtchID',
  'recipe': ':rcpeID',
  'brand': ':brndID',
  'vendor': ':vndrID',
  'worker': ':wrkrID',
  'generic': ':entityID' // Fallback
};

// Set entity ID in the external store
export const setEntityId = (entityType, id) => {
  const varName = entityVarMap[entityType] || `${entityType}ID`; // Remove redundant colon
  setVars(varName, id);
  return varName;
};

// Get entity ID from the external store
export const getEntityId = (entityType) => {
  const varName = entityVarMap[entityType] || `${entityType}ID`; // Remove redundant colon
  return getVar(varName);
};
