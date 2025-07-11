import React from 'react';
import { CrudLayout } from '@whatsfresh/shared-imports/jsx';

/**
 * RecipeLayout - Specialized layout for recipe management
 * For now, extends CrudLayout - will add recipe-specific features later
 * TODO: Add recipe-specific UI like ingredient lists, measurements, steps, etc.
 */
const RecipeLayout = ({ pageMap }) => {
  // For now, just use CrudLayout - customize later with recipe-specific features
  return <CrudLayout pageMap={pageMap} />;
};

export default RecipeLayout;