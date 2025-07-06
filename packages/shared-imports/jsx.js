/**
 * WhatsFresh Shared Imports Package - JSX Components Export
 * 
 * This file exports JSX components from shared-imports.
 * Use this for importing React components that contain JSX.
 * 
 * Usage:
 * import { LoginForm, CrudLayout, Modal } from '@whatsfresh/shared-imports/jsx';
 */

// === SHARED UI JSX COMPONENTS ===
export {
    LoginForm,
    LoginView,
    LoginPresenter
} from './src/components/auth/LoginForm/index.js';

export { default as CrudLayout } from './src/components/crud/CrudLayout/index.js';

export {
    default as Modal,
    modalStore,
    useModalStore,
    useModal
} from './src/components/modals/index.js';

// DML utilities that include JSX
export {
    executeDML,
    insertRecord,
    updateRecord,
    deleteRecord,
    previewDML,
    showDMLPreview
} from './src/utils/dml/index.js';

// Widget components
export { default as SelAcct } from './src/components/selectors/SelAcct.js';

// Placeholder exports
export const RcntIngrBtch = () => null;
export const RcntProdBtch = () => null;
