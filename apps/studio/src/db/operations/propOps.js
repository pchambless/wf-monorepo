// Re-export from modular eventProps operations
// Kept for backward compatibility with existing imports

export {
  insertProp as createProp,
  updateProp,
  deleteProp,
  getPropsByComponent as getPropsByXrefId,
  getPropById as getPropByIdbID,
  getPropsAsObject,
  getPropValue,
  bulkUpsertProps,
  upsertPropByName
} from './eventProps/index.js';
