/**
 * WhatsFresh Shared Imports Package - Components Export
 * 
 * This file exports all shared UI components.
 * For use in non-React environments, import from '@whatsfresh/shared-imports/jsx' instead.
 * 
 * Usage:
 * import { Button, Modal, Form } from '@whatsfresh/shared-imports/components';
 */

// Page-level components
export * from './1-page/b-navigation/aa-AppBar/AppBar.jsx';
export * from './1-page/b-navigation/bb-Sidebar/Sidebar.jsx';

// Form components
export * from './2-form';

// Common components
export * from './3-common';

// Authentication components
export * from './auth';

// Modal components
export * from './modal';

// DML components
export * from './dml';

// Standalone components
export { default as ErrorBoundary } from './ErrorBoundary.jsx';
export { default as ProtectedRoute } from './ProtectedRoute.js';
export { default as Registration } from './Registration.js';
