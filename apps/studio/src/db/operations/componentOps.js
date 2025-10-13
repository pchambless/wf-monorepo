// Re-export from modular eventComp_xref operations
// Kept for backward compatibility with existing imports

export {
  insertComponent as createComponent,
  updateComponent,
  deleteComponent,
  getComponentsByPage,
  getComponentByIdbId as getComponentById,
  getComponentHierarchy
} from './eventComp_xref/index.js';
