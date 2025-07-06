// Registry exports
export { 
  WIDGET_REGISTRY, 
  WIDGET_TYPES, 
  WIDGET_SIZES,
  getWidgetById,
  getWidgetsByApp,
  getWidgetDisplayName
} from './widgets/index.js';

// Widget exports
export { default as SelAcct } from './widgets/acct/SelAcct.js';

// Layout components  
export { default as MainLayout } from './layouts/MainLayout.jsx';

// Navigation components
export { default as AppBar } from './components/1-page/b-navigation/aa-AppBar/AppBar.jsx';
export { default as Sidebar } from './components/1-page/b-navigation/bb-Sidebar/Sidebar.jsx';

// Logo component
export { default as Logo } from './components/Logo/index.js';

// App-level components
export { default as CrudLayout } from './components/1-page/c-crud/CrudLayout/index.js';

// Auth components
export { 
  LoginForm, 
  LoginView, 
  LoginPresenter 
} from './components/auth/LoginForm/index.js';

// Modal components
export { 
  default as Modal, 
  modalStore, 
  useModalStore, 
  useModal 
} from './components/3-common/a-modal/index.js';

// DML utilities
export { 
  executeDML,
  insertRecord,
  updateRecord,
  deleteRecord,
  previewDML,
  buildDMLData,
  buildSQLPreview,
  showDMLPreview
} from './utils/dml/index.js';

// Placeholder exports - add implementations later
export const RcntIngrBtch = () => null;
export const RcntProdBtch = () => null;