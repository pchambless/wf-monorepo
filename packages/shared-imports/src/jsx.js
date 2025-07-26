/**
 * WhatsFresh Shared Imports Package - JSX Exports
 *
 * This file exports React JSX components for client-side use.
 * Don't import this in server-side code.
 *
 * Usage:
 * import { LoginForm, CrudLayout, Modal, MainLayout } from '@whatsfresh/shared-imports/jsx';
 */

import React from "react";

// Export layouts
export { default as MainLayout } from "./components/layouts/MainLayout.jsx";
export { default as AuthLayout } from "./components/layouts/AuthLayout.jsx";

// Export navigation components
export { default as AppBar } from "./components/navigation/aa-AppBar/AppBar.jsx";
export { default as Sidebar } from "./components/navigation/bb-Sidebar/Sidebar.jsx";

// Export auth components
export { default as LoginForm } from "./components/auth/LoginForm/LoginForm.jsx";
export { default as LoginView } from "./components/auth/LoginForm/LoginView.jsx";

// Export CRUD components
export { default as CrudLayout } from "./components/crud/CrudLayout/CrudLayout.jsx";
export { default as Form } from "./components/crud/Form/Form.jsx";
export { default as Table } from "./components/crud/Table/Table.jsx";

// Export modal components
export { default as Modal } from "./components/modals/Modal.jsx";
export { default as useModalStore } from "./components/modals/useModalStore.js";
export { default as modalStore } from "./components/modals/modalStore.js";
export { useModal } from "./components/modals/useModal.js";

// Export form components
export { default as DatePick } from "./components/forms/DatePick.jsx";
export {
  TextField,
  MultiLineField,
  Select,
  NumberField,
  DecimalField,
  DateField,
  BooleanField,
} from "./components/forms/index.js";

// Export selector components (PascalCase names)
export {
  SelAcct,
  SelBrnd,
  SelVndr,
  SelMeas,
  SelPlan,
  SelProd,
  SelIngr,
  SelWrkr,
  SelUserAcct,
  SelectWidget,
  createSelectWidget,
} from "./components/selectors/index.js";

// Export grid components
export { default as DataGrid } from "./components/grids/DataGrid.jsx";

// Export common components
export { default as Logo } from "./components/common/Logo/index.jsx";
export { default as ErrorBoundary } from "./components/common/ErrorBoundary.jsx";
export { default as EntitySelector } from "./components/common/EntitySelector.jsx";

// Export architecture components (development)
export { default as ArchDashboard } from "./architecture/components/ArchDashboard.jsx";

// Export auth utilities
export { useAuth, AuthProvider } from "./components/auth.jsx";

// Workflows are now in architecture folder - not JSX components
// Import workflows directly from architecture when needed in business logic
