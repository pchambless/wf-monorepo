import navigationHandlers from './navigation';
import selectionHandlers from './selection';
// Import other handler categories as they're created

/**
 * Combined handler registry from all handler categories
 */
const actionHandlers = {
  NAVIGATION: navigationHandlers,
  SELECTION: selectionHandlers,
  // Add other categories as they're implemented
  // FORM: formHandlers,
  // CRUD: crudHandlers,
};

export default actionHandlers;
