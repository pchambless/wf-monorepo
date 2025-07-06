/**
 * JSX-specific exports from shared-ui
 * Use this when you need React components in client apps
 */

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
export { default as RcntIngrBtch } from './widgets/ingr/RcntIngrBtch.js';
export { default as RcntProdBtch } from './widgets/prod/RcntProdBtch.js';

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
    LoginPresenter,
    LoginView
} from './components/auth/LoginForm/index.js';

// Modal and state management
export { default as Modal } from './components/3-common/a-modal/Modal.jsx';
export { default as modalStore } from './components/3-common/a-modal/modalStore.js';
export { default as useModal } from './components/3-common/a-modal/useModal.js';
export { default as useModalStore } from './components/3-common/a-modal/useModalStore.js';

// DML utilities
export {
    showDMLPreview,
    previewDML
} from './utils/dml/dmlPreview.jsx';
export {
    buildDMLData,
    buildSQLPreview,
    insertRecord,
    updateRecord,
    deleteRecord,
    executeDML
} from './utils/dml/index.js';
