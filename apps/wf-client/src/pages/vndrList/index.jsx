import React from 'react';
import { CrudLayout } from '@whatsfresh/shared-imports/jsx';
import pageMap from './pageMap';


/**
 * Vendors Page
 * Generated by DevTools - Simple wrapper around CrudLayout
 * All data fetching, state management, and UI handled internally by CrudLayout
 */
const vndrList = () => {
  return <CrudLayout pageMap={pageMap} />;
};

export default vndrList;
