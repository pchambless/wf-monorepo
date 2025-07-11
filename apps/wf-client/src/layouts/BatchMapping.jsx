import React from 'react';
import { CrudLayout } from '@whatsfresh/shared-imports/jsx';

/**
 * BatchMapping layout - Specialized layout for batch mapping
 * For now, extends CrudLayout - will add batch mapping features later
 * TODO: Add batch mapping UI with recipe tabs, ingredient selection, etc.
 */
const BatchMapping = ({ pageMap }) => {
  // For now, just use CrudLayout - customize later with batch mapping features
  return <CrudLayout pageMap={pageMap} />;
};

export default BatchMapping;