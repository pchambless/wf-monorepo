/**
 * WhatsFresh Shared Imports Package - JSX Components Export
 * 
 * This file exports JSX components from shared-ui.
 * Use this for importing React components that contain JSX.
 * 
 * Usage:
 * import { LoginForm, CrudLayout, Modal } from '@whatsfresh/shared-imports/jsx';
 * 
 * Note: This file will only work once webpack is configured to process JSX files in shared packages.
 * Until then, use the temporary stubs from the main export.
 */

// === SHARED UI JSX COMPONENTS ===
export {
    LoginForm,
    LoginView,
    LoginPresenter
} from '../shared-ui/src/components/auth/LoginForm/index.js';

export { default as CrudLayout } from '../shared-ui/src/components/1-page/c-crud/CrudLayout/index.js';

export {
    default as Modal,
    modalStore,
    useModalStore,
    useModal
} from '../shared-ui/src/components/3-common/a-modal/index.js';

// DML utilities that include JSX
export {
    executeDML,
    insertRecord,
    updateRecord,
    deleteRecord,
    previewDML,
    showDMLPreview
} from '../shared-ui/src/utils/dml/index.js';

// Widget components
export { default as SelAcct } from '../shared-ui/src/widgets/acct/SelAcct.js';

// Placeholder exports
export const RcntIngrBtch = () => null;
export const RcntProdBtch = () => null;
