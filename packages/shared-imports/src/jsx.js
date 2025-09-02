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

// Export layouts - TEMPORARILY DISABLED FOR ARCHITECTURE REFACTOR
// TODO: Replace with PageRenderer layout eventTypes
// export { default as MainLayout } from "./components/layouts/MainLayout.jsx";
// export { default as AuthLayout } from "./components/layouts/AuthLayout.jsx";
// export { default as SimpleLayout } from "./components/layouts/SimpleLayout.jsx";

// Export navigation components - TEMPORARILY DISABLED FOR ARCHITECTURE REFACTOR
// TODO: Replace with PageRenderer appbar/sidebar eventTypes
// export { default as AppBar } from "./components/navigation/aa-AppBar/AppBar.jsx";
// export { default as Sidebar } from "./components/navigation/bb-Sidebar/Sidebar.jsx";

// Export auth components - TEMPORARILY DISABLED FOR ARCHITECTURE REFACTOR
// TODO: Replace with PageRenderer auth eventTypes in /shared/auth/
// export { default as LoginForm } from "./components/auth/LoginForm/LoginForm.jsx";
// export { default as LoginView } from "./components/auth/LoginForm/LoginView.jsx";

// Export modal components - TEMPORARILY DISABLED FOR ARCHITECTURE REFACTOR
// TODO: Replace with PageRenderer modal eventTypes
// export { default as Modal } from "./components/modals/Modal.jsx";
// export { default as useModalStore } from "./components/modals/useModalStore.js";
// export { default as modalStore } from "./components/modals/modalStore.js";
// export { useModal } from "./components/modals/useModal.js";

// Export form components
export { default as DatePick } from "./components/forms/DatePick.jsx";
export { default as TextArea } from "./components/forms/TextArea.jsx";
export {
  TextField,
  MultiLineField,
  Select,
  NumberField,
  DecimalField,
  DateField,
  BooleanField,
} from "./components/forms/index.js";

// Export schema-driven form components - TEMPORARILY DISABLED
// TODO: Evaluate if needed for PageRenderer
// export { FormComponent } from "./components/FormComponent.jsx";

// Export selector components (PascalCase names) - TEMPORARILY DISABLED FOR MUI CONVERSION
// TODO: Convert SelectWidget to vanilla React, then re-enable these exports
// export {
//   SelBrnd,
//   SelVndr,
//   SelMeas,
//   SelPlan,
//   SelProd,
//   SelIngr,
//   SelWrkr,
//   SelUserAcct,
//   SelectWidget,
//   createSelectWidget,
// } from "./components/selectors/index.js";

// Export grid components - TEMPORARILY DISABLED FOR MUI CONVERSION
// export { default as DataGrid } from "./components/grids/DataGrid.jsx";

// Export common components - TEMPORARILY DISABLED FOR MUI CONVERSION  
// TODO: Convert these to vanilla React
// export { default as Logo } from "./components/common/Logo/index.jsx";
// export { default as ErrorBoundary } from "./components/common/ErrorBoundary.jsx";
// export { default as EntitySelector } from "./components/common/EntitySelector.jsx";

// 🚀 Export PageRenderer system (NEW!)
export { default as PageRenderer } from "./components/PageRenderer/index.jsx";

// Export auth utilities - TEMPORARILY DISABLED FOR ARCHITECTURE REFACTOR
// TODO: Convert to eventTypes in /shared/auth/ folder
// export { useAuth, AuthProvider } from "./components/auth.jsx";

// Export plan context utilities
export {
  PlanContextProvider,
  usePlanContext,
} from "./contexts/PlanContext.jsx";

// Workflows are now in architecture folder - not JSX components
// Import workflows directly from architecture when needed in business logic
